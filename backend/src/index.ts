import express from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import cors from "cors";
import SQL from "sql-template-strings";
import {
  buildCrashQuery,
  buildFilteredCrashCTEQuery,
  CRASH_QUERY_COLUMNS,
  getLocationList,
} from "./QueryUtils";
import { GoogleGenAI, Type } from "@google/genai";
import { generateAggregationSql } from "./AISQLGeneration";
import {
  validateChartQueryParams,
  validateCrashQueryParams,
} from "./ValidateUtils";

dotenv.config(); // Load .env variables

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Set up a PostgreSQL connection
const pg = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-2.0-flash-lite";

app.get("/crashes", async (req, res) => {
  const validation = validateCrashQueryParams(
    req.query.startDate,
    req.query.endDate,
    req.query.location,
    res
  );

  if (!validation.isValid) return;
  const { startDate, endDate, location } = validation;

  try {
    const locationList: string[] = getLocationList(
      location as string | string[] | undefined
    );
    const columns = CRASH_QUERY_COLUMNS;

    const finalQuery = buildCrashQuery(
      startDate,
      endDate,
      locationList,
      columns
    );

    const result = await pg.query(finalQuery);

    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);

    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/localities/names", async (req, res) => {
  try {
    const result = await pg.query(
      SQL`SELECT DISTINCT locality FROM localities ORDER BY locality`
    );
    res.json(result.rows.map((r) => r.locality));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not retrieve names" });
  }
});

app.get("/localities/geodata", async (req, res) => {
  try {
    const { locality } = req.query;
    const result = await pg.query(
      SQL`SELECT ST_AsGeoJSON(geom)::json as geom FROM localities WHERE locality = ${locality}`
    );
    res.json(result.rows[0].geom);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not retrieve geodata" });
  }
});

app.get("/crashes/generate-chart", async (req, res) => {
  const validation = validateChartQueryParams(
    req.query.startDate,
    req.query.endDate,
    req.query.location,
    req.query.prompt,
    res
  );

  if (!validation.isValid) return;

  const { startDate, endDate, location, prompt } = validation;
  try {
    const locationList: string[] = getLocationList(
      location as string | string[] | undefined
    );

    const q = buildFilteredCrashCTEQuery(
      buildCrashQuery(startDate, endDate, locationList, ["*"])
    );

    console.log("LLM Step 1: Generating Aggregation SQL...");

    // Get SQL query from LLM
    const generateSQLResponse = await generateAggregationSql(prompt, ai);
    console.log(generateSQLResponse.response);
    console.log(generateSQLResponse.success);

    if (!generateSQLResponse.success) {
      res.status(400).json({ error: generateSQLResponse.response });
    }

    // Query database
    q.append(generateSQLResponse.response);
    const result = await pg.query(q);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not retrieve geodata" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
