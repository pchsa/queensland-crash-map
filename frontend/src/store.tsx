import { create } from "zustand";
import { Crash } from "./types";

type CrashStore = {
	crashes: Crash[];
	setCrashes: (data: Crash[]) => void;
};

export const useCrashStore = create<CrashStore>((set) => ({
	crashes: [],
	setCrashes: (data) => set({
		crashes: data,
	}),
}));