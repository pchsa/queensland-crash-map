import express from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import cors from "cors";
import SQL, { SQLStatement } from "sql-template-strings";

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
    const query = SQL`
      SELECT DISTINCT C.crash_ref_number, C.crash_severity, C.crash_year, C.crash_month, C.crash_day_of_week, C.crash_hour, C.crash_longitude, C.crash_latitude
      FROM crashes as C, localities as L
      WHERE 
    `;

    query.append(buildDateFilter(startDate, endDate));

    const locationList: string[] = Array.isArray(location)
      ? location.map((loc) => String(loc))
      : [String(location)];

    query.append(SQL`AND (`);
    const localitiesFilter = buildLocalitiesFilter(locationList);
    const bboxFilter = buildBboxFilter(locationList);

    query.append(localitiesFilter);
    if (localitiesFilter.query.length > 0 && bboxFilter.query.length > 0)
      query.append(SQL` OR `);
    query.append(bboxFilter);

    query.append(SQL`)`);

    const result = await pg.query(query);

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

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

function buildDateFilter(startDate: string, endDate: string): SQLStatement {
  return SQL`
    DATE_TRUNC('month', TO_DATE(crash_month || ' ' || crash_year, 'Month YYYY'))
    BETWEEN DATE_TRUNC('month', TO_DATE(${startDate}, 'YYYY-MM'))
    AND DATE_TRUNC('month', TO_DATE(${endDate}, 'YYYY-MM'))
  `;
}

function buildLocalitiesFilter(locations: string[]): SQLStatement {
  const query = SQL``;
  const localities = locations.filter((loc) => loc.startsWith("locality:"));

  if (localities.length == 0) {
    return query;
  }

  query.append(SQL`(ST_Within(C.geom, L.geom) AND (`);
  for (const [index, loc] of localities.entries()) {
    const value = loc.slice("locality:".length);
    if (index > 0) query.append(SQL` OR `);
    query.append(SQL`LOWER(L.locality) = ${value.toLowerCase()}`);
  }
  query.append(SQL`))`);

  return query;
}

function buildBboxFilter(locations: string[]): SQLStatement {
  const query = SQL``;
  const bboxList = locations.filter((loc) => loc.startsWith("bbox:"));

  if (bboxList.length == 0) {
    return query;
  }

  query.append(SQL`(`);
  for (const [index, loc] of bboxList.entries()) {
    const value = loc.slice("bbox:".length);
    const [minLng, minLat, maxLng, maxLat] = value.split(",").map(Number);

    if (index > 0) query.append(SQL` OR `);

    query.append(
      SQL`ST_Within(
        C.geom,
        ST_Transform(ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326), 7844)
      )`
    );
  }
  query.append(SQL`)`);

  return query;
}
