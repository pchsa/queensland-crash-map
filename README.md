# 🗺️ Web Application Project: Queensland Crash Map

## 1. Project Overview 📝

### Motivation

*   **Problem Solved:** Provides an accessible and interactive way to explore and analyze historical road crash data for Queensland, often presented statically. Inspired by [Queensland Police Service — Online Crime Map](https://qps-ocm.s3-ap-southeast-2.amazonaws.com/index.html)
*   **Real-World Usefulness:** A data visualization tool 📊 for analysts, planners, policymakers, and the public to identify crash hotspots, understand trends, and investigate correlations using dynamic filtering and innovative features like AI-powered chart generation 🤖.

### Web Application Functions

*   **Interactive Map Display 📍:** Visualizes crash locations on a Leaflet map with marker clustering.
*   **Data Filtering 🔍:** Filter crash data by:
    *   **Spatial Location:** Draw bounding boxes (`Ctrl` + Click + Drag) or search suburbs.
    *   **Temporal Range:** Select start/end dates (Month/Year).
*   **Crash Details 🖱️:** Click markers for basic info popups.
*   **AI-Powered Chart Generation 💡:** Type natural language prompts (e.g., "show crashes by severity") to generate custom bar charts.

## 2. Tech Stack ⚙️

### Programming Languages & Frameworks

*   **Backend:** Node.js with Express.js (TypeScript)
*   **Frontend:** React (TypeScript)
*   **Database:** PostgreSQL with PostGIS extension 🐘

### Packages & Dependencies

**Backend (`backend/package.json`):**

*   `@google/genai`: Interface with Google Gemini models 🧠.
*   `cors`: Enable Cross-Origin Resource Sharing.
*   `dotenv`: Load environment variables 🔑.
*   `express`: Web application framework.
*   `pg`: PostgreSQL client (database driver).
*   `sql-template-strings`: Safely build SQL queries.

**Frontend (`frontend/package.json`):**

*   `@mantine/core`, `@mantine/*`: UI component library & hooks 🎨.
*   `@tabler/icons-react`: Icon library ✨.
*   `axios`: HTTP client for API requests 🌐.
*   `dayjs`: Date/time manipulation 📅.
*   `leaflet`, `react-leaflet`: Interactive maps library 🗺️.
*   `leaflet-area-select`: Bounding box selection plugin.
*   `react-leaflet-markercluster`: Marker clustering plugin.
*   `recharts`: Charting library used by Mantine Charts 📊.
*   `zustand`: State management library 🐻.

## 3. Setup Instructions 🛠️

### Environment Setup

1.  **Clone the repository.** <kbd>git clone ...</kbd>
2.  **Backend:** `cd backend` then `npm install`
3.  **Frontend:** `cd frontend` then `npm install`
4.  **Database:** Ensure PostgreSQL + PostGIS are installed and enabled.

### Database Configuration 💾

# TODO

## 4. Code Structure 📁

### Frontend

*   **Location:** `frontend/`
*   **Key Components:** `MapView.tsx`, `Filters.tsx`, `StatsPanel.tsx`, `AIBarChart.tsx`, state management (`store.tsx`), API calls (`api.tsx`).

### Backend

# TODO add endpoint params

*   **Location:** `backend/` (main file `index.ts`)
*   **Key API Endpoints:**
    *   `GET /crashes`: Fetch filtered crash data.
    *   `POST /crashes/generate-chart`: Generate chart data via AI from prompt + filters.

### Database Connection

*   **Location:** Configured via `.env` in `backend/`, loaded by `dotenv`. Connection logic in `index.ts`.
*   **`.env` Configuration:**
    ```.env
    PORT=3000
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=qld_crashes
    GEMINI_API_KEY=your_google_gemini_api_key
    ```

## 5. Queries Implemented ⁉️
# TODO

## 6. How to Run the Application 🚀

1.  ✅ Ensure Database is running & data loaded.
2.  ✅ Ensure `backend/.env` is configured.
3.  **Start Backend:** `cd backend` then `npm run dev`
4.  **Start Frontend:** Open a *new* terminal. `cd frontend` then `npm run dev`
5.  🌍 Open browser to the frontend address.

## 7. Port Usage 🔌

*   **Backend:** `3000` (configurable via `.env`)
*   **Frontend:** `5173` (Vite default)

## 8. UI Address 💻

*   `http://localhost:5173`

## 9. Additional Notes 💡

*   **Assumptions:** Working PostgreSQL/PostGIS, Node.js/npm installed, correct DB/API keys configured.
*   **Acknowledgements 🙏:**
    *   Data: [Queensland Government Open Data Portal](https://www.data.qld.gov.au/dataset/crash-data-from-queensland-roads/resource/e88943c0-5968-4972-a15f-38e120d72ec0)
    *   Tech: Node.js, Express, React, TypeScript, Leaflet, Mantine UI, Recharts, PostgreSQL, PostGIS, Google Gemini.
    *   AI Assistance: ChatGPT used to help write code and documentation.
