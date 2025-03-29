import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';


dotenv.config(); // Load .env variables

const app = express();
app.use(cors()); 
const PORT = process.env.PORT || 3000;

// Set up a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

app.get('/crashes', async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    res.status(400).json({ error: 'startDate and endDate are required' });
    return;
  }

  try {
    const result = await pool.query(
      `
      SELECT crash_ref_number, crash_severity, crash_year, crash_month, crash_day_of_week, crash_hour, crash_longitude, crash_latitude
      FROM crashes
      WHERE 
        DATE_TRUNC('month', TO_DATE(crash_month || ' ' || crash_year, 'Month YYYY')) 
          BETWEEN DATE_TRUNC('month', TO_DATE($1, 'YYYY-MM')) 
              AND DATE_TRUNC('month', TO_DATE($2, 'YYYY-MM'))
        AND loc_post_code = '4301';
      `,
      [startDate, endDate]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
