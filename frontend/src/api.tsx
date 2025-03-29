import axios from "axios";
import { Crash, CrashQuery } from "./types";

const API_BASE = 'http://localhost:3000';

export async function fetchCrashes(params: CrashQuery): Promise<Crash[]> {
	const res = await axios.get<Crash[]>(`${API_BASE}/crashes`, {
	  params: {
		startDate: params.startDate,
		endDate: params.endDate,
		location: params.location,
	  }
	});
	return res.data;
}