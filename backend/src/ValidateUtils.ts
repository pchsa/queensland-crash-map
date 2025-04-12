import { Response } from "express";

export function validateCrashQueryParams(
  startDate: unknown,
  endDate: unknown,
  location: unknown,
  res: Response
):
  | {
      isValid: true;
      startDate: string;
      endDate: string;
      location: string | string[];
    }
  | { isValid: false } {
  if (typeof startDate !== "string" || typeof endDate !== "string") {
    res
      .status(400)
      .json({ error: "startDate and endDate required in YYYY-MM format" });
    return { isValid: false };
  }

  const isLocationValid =
    typeof location === "string" || Array.isArray(location);

  if (!isLocationValid) {
    res.status(400).json({ error: "location is required" });
    return { isValid: false };
  }

  return { isValid: true, startDate, endDate, location };
}

export function validateChartQueryParams(
  startDate: unknown,
  endDate: unknown,
  location: unknown,
  prompt: unknown,
  res: Response
):
  | {
      isValid: true;
      startDate: string;
      endDate: string;
      location: string | string[];
      prompt: string;
    }
  | {
      isValid: false;
    } {
  if (typeof startDate !== "string" || typeof endDate !== "string") {
    res
      .status(400)
      .json({ error: "startDate and endDate required in YYYY-MM format" });
    return { isValid: false };
  }

  const isLocationValid =
    typeof location === "string" || Array.isArray(location);
  if (!isLocationValid) {
    res.status(400).json({ error: "location is required" });
    return { isValid: false };
  }

  if (typeof prompt !== "string") {
    res.status(400).json({ error: "prompt is required" });
    return { isValid: false };
  }

  return {
    isValid: true,
    startDate,
    endDate,
    location,
    prompt,
  };
}
