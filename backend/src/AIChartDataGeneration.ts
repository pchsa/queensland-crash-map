import { GoogleGenAI, Type } from "@google/genai";

// --- System Instruction for LLM (Formatting & Title Generation - WITH Original Prompt Context) ---
export const formattingAndTitleSystemInstruction = `
You are an expert data analysis assistant identifying chart metadata.
You will receive an original user query and a JSON array representing SAMPLE results from a PostgreSQL query (usually the first few rows) executed based on that query. The source table columns include: crash_severity, crash_year, crash_month, crash_day_of_week, crash_hour, crash_date, crash_nature, crash_type, crash_roadway_feature, crash_speed_limit, crash_atmospheric_condition.

Your task is to determine the appropriate metadata for a Mantine BarChart based on the user query and the structure of the sample results provided. Adhere strictly to the provided JSON output schema.

**Instructions:**
1.  Analyze the original user query to understand the requested visualization.
2.  Examine the structure (column names/keys) of the sample 'SQL Results (JSON Array)'.
3.  **Identify the 'dataKey':** Determine which column name from the results represents the primary category axis (should match the main grouping in the user query).
4.  **Identify the 'series':** Determine the names of the other columns in the results which represent the aggregated values or breakdowns (create an object { name: "column_name" } for each).
5.  **Generate a 'title':** Create a concise, descriptive title for the chart based on the original user query and the identified dataKey/series.
6.  **Output:** Respond ONLY with a JSON object containing the 'title', 'dataKey', and 'series' according to the provided schema. Do NOT include the 'data' array in your response.

**Example Input Data Structure:** [{ "crash_severity": "Fatal", "count": 10 }, { "crash_severity": "Hospitalisation", "count": 50 }]
**Example Output JSON:** { "title": "Crashes by Severity", "dataKey": "crash_severity", "series": [{ "name": "count" }] }
`;

// --- Define Schema for Structured JSON Output (Formatting & Title Step) ---
const chartOutputSchema_withTitle = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description:
        "A concise, descriptive title for the bar chart based on the user query and data.",
      nullable: false, // Title should always be generated
    },
    dataKey: {
      type: Type.STRING,
      description:
        "The key from the data objects representing the category axis (e.g., 'crash_month', 'crash_severity').",
      nullable: false,
    },
    series: {
      type: Type.ARRAY,
      description:
        "An array of objects defining the series (bars). Each object must have a 'name' property corresponding to a key in the data objects.",
      nullable: false,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description:
              "Name of the data series (e.g., 'count', 'Fatal', 'Serious').",
            nullable: false,
          },
        },
        required: ["name"],
      },
    },
  },
  // All fields are now required for a successful formatting response
  required: ["title", "dataKey", "series"],
};

// Define the expected response type from the LLM now
export type LLMMetadataResponse = {
  title: string;
  dataKey: string;
  series: { name: string }[]; // More specific type than Object[]
};

// Define the final return type
export type ChartData = {
  title: string;
  dataKey: string;
  series: { name: string }[]; // Use the specific type
  data: any[]; // Use any[] or Record<string, any>[] if preferred
};
export async function generateChartData(
  originalUserQuery: string,
  dataToFormat: any[],
  ai: GoogleGenAI
): Promise<ChartData> {
  try {
    const prompt = `
    Original User Query for context: "${originalUserQuery}"

    Sample Database Query Results (JSON Array, first few rows):
    ${JSON.stringify(dataToFormat)}

    Based on the original query and the SAMPLE results provided above, please generate the chart title, dataKey, and series list according to the instructions and schema provided in the system prompt.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: formattingAndTitleSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: chartOutputSchema_withTitle,
      },
    });

    if (!response.text) {
      throw new Error("Response text is undefined");
    }

    const partialResponse = JSON.parse(response.text) as LLMMetadataResponse;
    const finalChartData: ChartData = {
      title: partialResponse.title,
      dataKey: partialResponse.dataKey,
      series: partialResponse.series,
      data: dataToFormat,
    };

    return finalChartData;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Unknown error");
  }
}
