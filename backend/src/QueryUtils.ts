import SQL, { SQLStatement } from "sql-template-strings";

export function buildLocalitiesFilter(locations: string[]): SQLStatement {
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

export function buildBboxFilter(locations: string[]): SQLStatement {
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

export function buildDateFilter(
  startDate: string,
  endDate: string
): SQLStatement {
  return SQL`
      DATE_TRUNC('month', TO_DATE(crash_month || ' ' || crash_year, 'Month YYYY'))
      BETWEEN DATE_TRUNC('month', TO_DATE(${startDate}, 'YYYY-MM'))
      AND DATE_TRUNC('month', TO_DATE(${endDate}, 'YYYY-MM'))
    `;
}

export function buildCrashQuery(
  startDate: string,
  endDate: string,
  locationList: string[],
  columns: string[]
): SQLStatement {
  const localitiesFilter = buildLocalitiesFilter(locationList);
  const bboxFilter = buildBboxFilter(locationList);

  const dateFilter = buildDateFilter(startDate, endDate);

  const queries: SQLStatement[] = [];
  const colSQL = columns.map((c) => `C.${c}`).join(", ");

  if (localitiesFilter.query.length > 0) {
    const q = SQL`SELECT `;
    q.append(colSQL);
    q.append(
      SQL` FROM crashes C JOIN localities L ON ST_Within(C.geom, L.geom) WHERE `
    );
    q.append(dateFilter);
    q.append(SQL`AND (`);
    q.append(localitiesFilter);
    q.append(SQL`)`);
    queries.push(q);
  }

  if (bboxFilter.query.length > 0) {
    const q = SQL`SELECT `;
    q.append(colSQL);
    q.append(
      SQL` FROM crashes C JOIN localities L ON ST_Within(C.geom, L.geom) WHERE `
    );
    q.append(dateFilter);
    q.append(SQL`AND (`);
    q.append(bboxFilter);
    q.append(SQL`)`);
    queries.push(q);
  }

  let finalQuery = SQL``;

  if (queries.length === 2) {
    finalQuery.append(queries[0]);
    finalQuery.append(SQL` UNION `);
    finalQuery.append(queries[1]);
  } else {
    finalQuery = queries[0]; // only one was needed
  }
  return finalQuery;
}

// --- Define Unique Values for Categorical Columns ---
export const uniqueValuesInfo = `
Unique values for relevant columns:
- Crash_Atmospheric_Condition: ['Clear', 'Fog', 'Raining', 'Smoke/Dust']
- crash_day_of_week: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
- crash_hour: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23] (Note: These are integers)
- crash_month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] (Note: These seem to be strings, ensure DB column type matches. If it's integer 1-12, adjust prompt)
- Crash_Nature: ['Angle', 'Collision - miscellaneous', 'Fall from vehicle', 'Head-on', 'Hit animal', 'Hit object', 'Hit parked vehicle', 'Hit pedestrian', 'Non-collision - miscellaneous', 'Other', 'Overturned', 'Rear-end', 'Sideswipe', 'Struck by external load', 'Struck by internal load']
- Crash_Roadway_Feature: ['Bikeway', 'Bridge/Causeway', 'Forestry/National Park Road', 'Intersection - 5+ way', 'Intersection - Cross', 'Intersection - Interchange', 'Intersection - Multiple Road', 'Intersection - Roundabout', 'Intersection - T-Junction', 'Intersection - Y-Junction', 'Median Opening', 'Merge Lane', 'No Roadway Feature', 'Other', 'Railway Crossing']
- Crash_Severity: ['Fatal', 'Hospitalisation', 'Medical treatment', 'Minor injury']
- Crash_Speed_Limit: ['0 - 50 km/h', '60 km/h', '70 km/h', '80 - 90 km/h', '100 - 110 km/h', NULL] 
- Crash_Type: ['Hit pedestrian', 'Multi-Vehicle', 'Other', 'Single Vehicle']
- Crash_year: ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'] 
`;

// --- System Instruction for LLM (SQL Generation with Structured Output) ---
export const sqlGenerationSystemInstruction = `
You are an expert PostgreSQL assistant generating parts of SQL queries for a crash dataset.
Your goal is to generate a SQL query fragment based on a user request or provide a clear error message if the request cannot be fulfilled based on the available data.
The data will be provided in a CTE named 'filtered_crashes'.
Relevant columns within 'filtered_crashes' and their types/notes:
- crash_severity (text)
- crash_year (integer) // Corrected type based on unique values
- crash_month (text - e.g., 'January', 'February')
- crash_day_of_week (text - e.g., 'Monday')
- crash_hour (integer - 0-23)
- crash_date (timestamp without time zone - NOTE: only year and month are accurate)
- crash_nature (text)
- crash_type (text)
- crash_roadway_feature (text)
- crash_speed_limit (text)
- crash_atmospheric_condition (text)

${uniqueValuesInfo} // Includes the detailed list of unique values

**Task:**
Analyze the user's query. Determine if it can be answered using the available columns and unique values listed above.
If the query is feasible:
  - Generate ONLY the 'SELECT ... FROM filtered_crashes GROUP BY ... ORDER BY ... LIMIT ...' part of the SQL query.
  - Base the aggregation (usually COUNT(*)) and GROUP BY clause on the user's query, considering the valid unique values provided.
  - If the user query implies a breakdown by a secondary category (e.g., '... by severity'), use COUNT(*) FILTER (WHERE "column_name" = 'value') syntax. Only create FILTER clauses for the known valid unique values of that secondary column.
  - The first column selected MUST be the category for the chart's main axis.
  - Do NOT include 'WITH filtered_crashes AS (...)'. Start directly with 'SELECT'.
  - Order results meaningfully (e.g., by count desc or category asc). Apply a reasonable LIMIT, keeping in mind that this data will be displayed in a bar chart.
  - Respond with a JSON object containing: { "success": true, "response": "YOUR_GENERATED_SQL_FRAGMENT_HERE" }. Ensure the SQL is a valid string within the JSON. Do not add explanations outside the JSON structure.

If the query CANNOT be answered using the available columns/data (e.g., asks for 'driver age', 'vehicle color', predictions, unsupported analysis):
  - Do NOT generate a default SQL query.
  - Respond with a JSON object containing: { "success": false, "response": "Clear error message explaining why the query cannot be fulfilled (e.g., 'The dataset does not contain driver age information.', 'Breakdown by vehicle color is not supported.')" }. The error message should be concise and informative.

**Output Format:** Respond ONLY with the JSON object described above. Do not include any text before or after the JSON.
`;
