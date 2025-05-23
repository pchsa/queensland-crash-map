import { GoogleGenAI, Type } from "@google/genai";

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
- crash_year (text) 
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

If the query cannot be processed, respond with success: false and a specific error message. Reasons for failure include:
  - Input is irrelevant nonsense (use generic error: "Please ask about crash data...").
  - Query includes location/date filtering (direct user to map filters: "Use map filters for location/date...").
  - Query requires columns not available (specify missing column: "Dataset lacks [Column Name]...") or analysis types not supported (specify reason: "Analysis type [Reason] not supported...").


If the query is feasible:
  - Generate ONLY the 'SELECT ... FROM filtered_crashes GROUP BY ... ORDER BY ... LIMIT ...' part of the SQL query.
  - Base the aggregation and GROUP BY clause on the user's query, considering the valid unique values provided.
  - **IMPORTANT:** The primary aggregation should usually be COUNT(*). Always cast the result of COUNT(*) to an integer using the ::INTEGER syntax. For example: COUNT(*)::INTEGER AS count. Use a simple alias like 'count' or the category name if using FILTER.  - If the user query implies a breakdown by a secondary category (e.g., '... by severity'), use COUNT(*) FILTER (WHERE "column_name" = 'value') syntax. Only create FILTER clauses for the known valid unique values of that secondary column.
  - The first column selected MUST be the category for the chart's main axis.
  - Do NOT include 'WITH filtered_crashes AS (...)'. Start directly with 'SELECT'.
  - Order results meaningfully (e.g., by count desc or category asc). Apply a reasonable LIMIT, keeping in mind that this data will be displayed in a bar chart.
  - Respond with a JSON object containing: { "success": true, "response": "YOUR_GENERATED_SQL_FRAGMENT_HERE" }. Ensure the SQL is a valid string within the JSON. Do not add explanations outside the JSON structure.



**Output Format:** Respond ONLY with the JSON object described above. Do not include any text before or after the JSON.
`;

export const SQL_GENERATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    response: {
      type: Type.STRING,
      description: "SQL Query or error message",
      nullable: false,
    },
    success: {
      type: Type.BOOLEAN,
      description: "true if successfully returns SQL query, false otherwise",
      nullable: false,
    },
  },
  required: ["response", "success"],
};

export type LLMSQLResponse = {
  success: boolean;
  response: string;
};

export async function generateAggregationSql(
  prompt: string,
  ai: GoogleGenAI
): Promise<LLMSQLResponse> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: sqlGenerationSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: SQL_GENERATION_SCHEMA,
      },
    });

    if (!response.text) {
      throw new Error("Response text is undefined");
    }

    return JSON.parse(response.text) as LLMSQLResponse;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Unknown error");
  }
}
