import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';
import SQL, { SQLStatement } from 'sql-template-strings';

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

app.get('/crashes', async (req, res) => {
  const { startDate, endDate, location } = req.query;

  // Validate dates
  if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
    res.status(400).json({ error: 'startDate and endDate required in YYYY-MM format' });
    return;
  }

  // Validate location
  if (!location) {
    res.status(400).json({ error: 'location is required' });
    return;
  }

  try {
    const query = SQL`
      SELECT crash_ref_number, crash_severity, crash_year, crash_month, crash_day_of_week, crash_hour, crash_longitude, crash_latitude
      FROM crashes
      WHERE
    `;

    query.append(buildDateFilter(startDate, endDate));

    const locationList: string[] = Array.isArray(location) 
      ? location.map(loc => String(loc)) 
      : [String(location)];
    
    const locationFilters = buildLocationFilter(locationList);

    query.append(SQL` AND (`);
    locationFilters.forEach((filter, i) => {
      if (i > 0) query.append(SQL` OR `);
      query.append(filter);
    });
    query.append(SQL`)`);
    const result = await pg.query(query);

    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);

    res.status(500).json({ error: 'Something went wrong' });
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

function buildLocationFilter(locations: string[]): SQLStatement[] {
  const filters: SQLStatement[] = [];

  for (const loc of locations) {
    const [type, value] = loc.split(':');
    
    switch (type.toLowerCase()) {
      case 'suburb':
        filters.push(SQL`LOWER(Loc_Suburb) = ${value.toLowerCase()}`);
        break;
      case 'lga':
        filters.push(SQL`LOWER(Loc_Local_Government_Area) = ${value.toLowerCase()}`);
        break;
    }
  }

  return filters;
}