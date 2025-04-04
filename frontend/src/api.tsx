import axios from "axios";
import { Crash, CrashQuery } from "./types";

const API_BASE = "http://localhost:3000";

export async function fetchCrashes(params: CrashQuery): Promise<Crash[]> {
  const res = await axios.get<Crash[]>(`${API_BASE}/crashes`, {
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
      location: params.location,
    },
  });
  return res.data;
}

export async function fetchSuburbNames(): Promise<string[]> {
  const res = await axios.get<string[]>(`${API_BASE}/localities/names`);
  return res.data;
}

export async function fetchSuburbGeoData(name: string): Promise<any> {
  const res = await axios.get<any>(`${API_BASE}/localities/geodata`, {
    params: {
      locality: name,
    },
  });

  return res.data;
}
