import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 3000;

// Set up a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

// Test route that fetches 5 crash records
app.get('/crashes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT crash_ref_number, crash_severity, crash_year, crash_month, crash_day_of_week, crash_hour, crash_longitude, crash_latitude
      FROM crashes
      WHERE crash_year = '2023' and loc_post_code = '4122';  
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
