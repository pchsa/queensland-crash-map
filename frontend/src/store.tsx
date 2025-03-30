import { create } from "zustand";
import { Crash } from "./types";

type CrashState = {
  crashes: Crash[];
  setCrashes: (data: Crash[]) => void;
};

export const useCrashStore = create<CrashState>((set) => ({
  crashes: [],
  setCrashes: (data) =>
    set({
      crashes: data,
    }),
}));

type FilterState = {
  severity: string[];
  setSeverity: (severity: string[]) => void;
  location: string[];
  setLocation: (location: string[]) => void;
  dateRange: [Date | null, Date | null];
  setDateRange: (dateRange: [Date | null, Date | null]) => void;
};

export const useFilterStore = create<FilterState>((set) => ({
  severity: [],
  setSeverity: (severity) => set({ severity }),
  location: [],
  setLocation: (location) => set({ location }),
  dateRange: [null, null],
  setDateRange: (dateRange) => set({ dateRange }),
}));
