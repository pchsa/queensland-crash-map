import axios from "axios";
import { Crash } from "./types";

const API_BASE = 'http://localhost:3000';

export async function fetchCrashes(): Promise<Crash[]> {
	const res = await axios.get<Crash[]>(`${API_BASE}/crashes`);
	return res.data;
}