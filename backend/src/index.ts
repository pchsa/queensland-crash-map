import express from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import cors from "cors";
import SQL from "sql-template-strings";
import { buildCrashQuery } from "./QueryUtils";
import { GoogleGenAI } from "@google/genai";

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

app.get("/crashes", async (req, res) => {
  const { startDate, endDate, location } = req.query;

  // Validate dates
  if (
    !startDate ||
    !endDate ||
    typeof startDate !== "string" ||
    typeof endDate !== "string"
  ) {
    res
      .status(400)
      .json({ error: "startDate and endDate required in YYYY-MM format" });
    return;
  }

  // Validate location
  if (!location) {
    res.status(400).json({ error: "location is required" });
    return;
  }

  try {
    const locationList: string[] = Array.isArray(location)
      ? location.map((loc) => String(loc))
      : [String(location)];

    const columns = [
      "crash_ref_number",
      "crash_severity",
      "crash_year",
      "crash_month",
      "crash_day_of_week",
      "crash_hour",
      "crash_longitude",
      "crash_latitude",
    ];

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
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: "How does AI work?",
    });
    res.json(response.text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not retrieve geodata" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
