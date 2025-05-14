# 🗺️ Web Application Project: Queensland Crash Map

https://github.com/user-attachments/assets/3b984d82-08b9-4869-9717-5644eae71752

## 1. Project Overview 📝

### Motivation

- **Problem Solved:** Provides an accessible and interactive way to explore and analyze historical road crash data for Queensland, often presented statically. Inspired by [Queensland Police Service — Online Crime Map](https://qps-ocm.s3-ap-southeast-2.amazonaws.com/index.html)
- **Real-World Usefulness:** A data visualization tool 📊 for analysts, planners, policymakers, and the public to identify crash hotspots, understand trends, and investigate correlations using dynamic filtering and innovative features like AI-powered chart generation 🤖.

### Web Application Functions

- **Interactive Map Display 📍:** Visualizes crash locations on a Leaflet map with marker clustering.
- **Data Filtering 🔍:** Filter crash data by:
  - **Spatial Location:** Draw bounding boxes (`Ctrl` + Click + Drag) or search suburbs.
  - **Temporal Range:** Select start/end dates (Month/Year).
- **Crash Details 🖱️:** Click markers for basic info popups.
- **AI-Powered Chart Generation 💡:** Type natural language prompts (e.g., "show crashes by severity") to generate custom bar charts.

## 2. Tech Stack ⚙️

### Programming Languages & Frameworks

- **Backend:** Node.js with Express.js (TypeScript)
- **Frontend:** React (TypeScript)
- **Database:** PostgreSQL with PostGIS extension 🐘

### Packages & Dependencies

**Backend (`backend/package.json`):**

- `@google/genai`: Interface with Google Gemini models 🧠.
- `cors`: Enable Cross-Origin Resource Sharing.
- `dotenv`: Load environment variables 🔑.
- `express`: Web application framework.
- `pg`: PostgreSQL client (database driver).
- `sql-template-strings`: Safely build SQL queries.

**Frontend (`frontend/package.json`):**

- `@mantine/core`, `@mantine/*`: UI component library & hooks 🎨.
- `@tabler/icons-react`: Icon library ✨.
- `axios`: HTTP client for API requests 🌐.
- `dayjs`: Date/time manipulation 📅.
- `leaflet`, `react-leaflet`: Interactive maps library 🗺️.
- `leaflet-area-select`: Bounding box selection plugin.
- `react-leaflet-markercluster`: Marker clustering plugin.
- `recharts`: Charting library used by Mantine Charts 📊.
- `zustand`: State management library 🐻.

**Database Setup (`requirements.txt`):**

- `pandas`, `numpy`: Data manipulation and analysis tools 📊.
- `geopandas`: Extends pandas for geospatial data support 🌍.
- `requests`: Make HTTP requests to external APIs 🔗.
- `sqlalchemy`: SQL toolkit and ORM for database interaction 🛠️.
- `psycopg2`: PostgreSQL database adapter for Python 🐘.
- `geoalchemy2`: Adds spatial support to SQLAlchemy using PostGIS 🧭.
- `python-dotenv`: Load environment variables from `.env` files 🔐.

## 3. Setup Instructions 🛠️

### Environment Setup

1.  **Clone the repository.** <kbd>git clone ...</kbd>
2.  **Backend:** `cd backend` then `npm install`
3.  **Frontend:** `cd frontend` then `npm install`
4.  **Database:** Ensure PostgreSQL + PostGIS are installed and enabled.
5.  **`.env` Configuration:**: Set up .env file in root folder. You can get Gemini API key from [here](https://aistudio.google.com/apikey).

```.env
PORT=3000
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qld_crashes
GEMINI_API_KEY=your_google_gemini_api_key
```

### Database Configuration 💾

1.  **Install dependencies & prepare data:**  
    Run the following in your project root:

    ```bash
    pip install -r requirements.txt
    python download_data.py
    ```

2.  **Create database & enable PostGIS:**  
    Connect to PostgreSQL and run:

    ```bash
    psql -U postgres -d postgres
    CREATE DATABASE qld_crashes;
    \c qld_crashes;
    CREATE EXTENSION IF NOT EXISTS postgis;
    \q
    ```

3.  **Load data into the database:**  
    Run the data loader script:
    ```bash
    python load_to_db.py
    ```

## 4. Code Structure 📁

### Frontend

- **Location:** `frontend/`
- **Key Components:** `MapView.tsx`, `Filters.tsx`, `StatsPanel.tsx`, `AIBarChart.tsx`, state management (`store.tsx`), API calls (`api.tsx`).

### Backend

- **Location:** `backend/` (main file: `index.ts`)

---

#### **API Endpoints**

---

### `GET /crashes`

Fetches filtered crash data.

**Query Parameters:**

| Name        | Type       | Required         | Description                                                                                                                                               |
| ----------- | ---------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `startDate` | `string`   | Yes              | Start of the date range, in `YYYY-MM` format.                                                                                                             |
| `endDate`   | `string`   | Yes              | End of the date range, in `YYYY-MM` format.                                                                                                               |
| `location`  | `string[]` | Yes (at least 1) | One or more location filters. Each must be in one of the following formats:<br>• `locality:{suburb name}`<br>• `bbox:{minLng},{minLat},{maxLng},{maxLat}` |

---

### `POST /crashes/generate-chart`

Generates chart data via AI based on a natural language prompt and filters.

**Query Parameters:**

| Name        | Type       | Required         | Description                                                                                  |
| ----------- | ---------- | ---------------- | -------------------------------------------------------------------------------------------- |
| `startDate` | `string`   | Yes              | Start of the date range, in `YYYY-MM` format.                                                |
| `endDate`   | `string`   | Yes              | End of the date range, in `YYYY-MM` format.                                                  |
| `location`  | `string[]` | Yes (at least 1) | Same as `/crashes`; supports multiple values with `locality:` or `bbox:` formats.            |
| `prompt`    | `string`   | Yes              | Natural language prompt describing the chart to generate (e.g., "Show crashes by severity"). |

### Database Connection

- **Location:** Configured via `.env`, loaded by `dotenv`. Connection logic in `backend/index.ts`.

## 5. Queries Implemented

In the live website, multiple queries are often combined to produce the final result. However, for clarity and documentation purposes, they are presented separately here.

---

### Query 1: Get Crashes by Suburb

**Task Description:**
This query retrieves crash records that occurred within a specific suburb. It is used in the frontend when a user selects a suburb to view crash statistics relevant to that locality.

**SQL Query (Example):**

```sql
SELECT *
FROM crashes C
JOIN localities L ON ST_Within(C.geom, L.geom)
WHERE LOWER(L.locality) = LOWER($1);
```

**Query Variables:**

-`$1`: Suburb name (e.g., 'st lucia', case-insensitive)

**Unexpected Value Handling:**  
If the suburb doesn't exist or the date format is invalid, the backend will return an error. This is unlikely since the frontend restricts input to valid suburbs.

### Query 2: Get Crashes by Bounding Box

**Task Description:**  
This query retrieves crash records that occurred within a user-defined bounding box. It is used in the frontend when the user manually draws a rectangle on the map to specify an area of interest.

**SQL Query (Example):**

```sql
SELECT *
FROM crashes C
WHERE ST_Within(
  C.geom,
  ST_Transform(
    ST_MakeEnvelope($1, $2, $3, $4, 4326),
    7844
  )
);
```

**Query Variables:**

- `$1`: Minimum longitude
- `$2`: Minimum latitude
- `$3`: Maximum longitude
- `$4`: Maximum latitude

**Unexpected Value Handling:**  
If any of the bounding box coordinates are missing or invalid, the backend will throw an error. In the frontend, an error will be thrown if a bounding box is drawn outside of Queensland.

### Query 3: Get Crashes by Date Range

**Task Description:**  
This query retrieves crash records that occurred within a specified date range, grouped by month and year. It is used to filter crashes temporally based on user-selected start and end dates.

**SQL Query (Example):**

```sql
SELECT *
FROM crashes
WHERE DATE_TRUNC('month', TO_DATE(crash_month || ' ' || crash_year, 'Month YYYY'))
  BETWEEN DATE_TRUNC('month', TO_DATE($1, 'YYYY-MM'))
  AND DATE_TRUNC('month', TO_DATE($2, 'YYYY-MM'));
```

**Query Variables:**

- `$1`: Start date in `'YYYY-MM'` format (e.g., `'2023-01'`)
- `$2`: End date in `'YYYY-MM'` format (e.g., `'2023-12'`)

**Unexpected Value Handling:**  
If the date format is invalid or out of range, the backend will return an error. This is unlikely in practice as the frontend enforces proper date formatting and range selection.

### Query 4: AI-Generated Chart Query

**Task Description:**  
This query is dynamically generated using AI based on a user's natural language prompt. It builds on the existing filtering logic (by suburb, bounding box, and date range) by wrapping into CTE `filtered_crashes`. The AI then generates a specific aggregation or transformation based on the user's intent, such as showing crash severity distributions.

**SQL Query (Example):**

```sql
WITH filtered_crashes AS ( ... )
SELECT crash_severity, COUNT(*)::INTEGER AS count
FROM filtered_crashes
GROUP BY crash_severity
ORDER BY count DESC
LIMIT 10;
```

**Unexpected Value Handling:**  
AI-generated queries are validated through prompt engineering techniques. The system first analyzes the user's prompt to check if it can be answered using the available dataset structure and values. It rejects invalid inputs—such as unsupported columns, irrelevant content, or improperly scoped questions—with specific error messages. If the query is valid, the system dynamically generates only the relevant SQL fragment (e.g., `SELECT ... FROM filtered_crashes ...`) based on the user's intent. This ensures that output is always aligned with the dataset's capabilities and frontend filtering constraints.

## 6. How to Run the Application 🚀

1.  ✅ Ensure Database is running & data loaded.
2.  ✅ Ensure `.env` is configured.
3.  **Start Backend:** `cd backend` then `npm run dev`
4.  **Start Frontend:** Open a _new_ terminal. `cd frontend` then `npm run build` then `npm run preview`
5.  🌍 Open browser to the frontend address.

## 7. Port Usage 🔌

- **Backend:** `3000` (configurable via `.env`)
- **Frontend:** `4173` (Vite default)

## 8. UI Address 💻

- `http://localhost:4173`

## 9. Additional Notes 💡

- **Assumptions:** Working PostgreSQL/PostGIS, Node.js/npm installed, Python installed, correct DB/API keys configured.
- **Acknowledgements 🙏:**
  - Data: Queensland Gvoernment Open Data Portal [Road Crash Locations](https://www.data.qld.gov.au/dataset/crash-data-from-queensland-roads/resource/e88943c0-5968-4972-a15f-38e120d72ec0), [Locality Boundaries](https://www.data.qld.gov.au/dataset/locality-boundaries-queensland)
  - Tech: Node.js, Express, React, TypeScript, Leaflet, Mantine UI, Recharts, PostgreSQL, PostGIS, Google Gemini.
  - AI Assistance: ChatGPT used to help write code and documentation.
