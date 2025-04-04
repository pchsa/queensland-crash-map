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
  bboxCounter: number;
  addBoundingBox: (bbox: string) => void;
};

export const useFilterStore = create<FilterState>((set) => ({
  severity: [],
  setSeverity: (severity) => set({ severity }),
  location: [],
  setLocation: (location) => set({ location }),
  dateRange: [new Date(2023, 0, 1), new Date(2023, 11, 1)],
  setDateRange: (dateRange) => set({ dateRange }),
  bboxCounter: 1,
  addBoundingBox: (bbox: string) =>
    set((state) => ({
      location: [
        ...state.location,
        `Bounding Box #${state.bboxCounter}:${bbox}`,
      ],
      bboxCounter: state.bboxCounter + 1,
    })),
}));
