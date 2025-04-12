import { Type } from "@google/genai";
import SQL, { SQLStatement } from "sql-template-strings";

export const CRASH_QUERY_COLUMNS = [
  "crash_ref_number",
  "crash_severity",
  "crash_year",
  "crash_month",
  "crash_day_of_week",
  "crash_hour",
  "crash_longitude",
  "crash_latitude",
];

export function getLocationList(
  input: string | string[] | undefined
): string[] {
  if (!input) return [];
  return Array.isArray(input) ? input.map(String) : [String(input)];
}

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

export function buildFilteredCrashCTEQuery(cte: SQLStatement) {
  const baseQuery = SQL`WITH filtered_crashes AS (`;
  baseQuery.append(cte);
  baseQuery.append(SQL`) `);
  return baseQuery;
}
