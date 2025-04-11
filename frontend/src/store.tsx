import { create } from "zustand";
import { Crash, HourlyRadarData, SeverityDonutData } from "./types";

type CrashState = {
  crashes: Crash[];
  setCrashes: (data: Crash[]) => void;
  crashCount: () => number;
  getHourlyRadarData: () => HourlyRadarData[];
  getSeverityCounts: () => SeverityDonutData[];
};

export const useCrashStore = create<CrashState>((set, get) => ({
  crashes: [],
  setCrashes: (data) =>
    set({
      crashes: data,
    }),
  crashCount: () => get().crashes.length,
  getHourlyRadarData: () => {
    const hourlyCounts = new Array(24).fill(0);
    get().crashes.forEach(({ crash_hour }) => {
      if (crash_hour >= 0 && crash_hour <= 23) {
        hourlyCounts[crash_hour]++;
      }
    });
    return hourlyCounts.map((value, hour) => ({ hour, value }));
  },
  getSeverityCounts: () => {
    const counts: Record<string, number> = {};

    get().crashes.forEach(({ crash_severity }) => {
      counts[crash_severity] = (counts[crash_severity] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name: name as
        | "Fatal"
        | "Hospitalisation"
        | "Medical treatment"
        | "Minor injury",
      value,
      color: severityColorMap[name] ?? "gray.6",
    }));
  },
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

const severityColorMap: Record<string, string> = {
  Fatal: "red.6",
  Hospitalisation: "orange.6",
  "Medical treatment": "yellow.6",
  "Minor injury": "blue.6",
};
