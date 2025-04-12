export type Crash = {
  crash_ref_number: string;
  crash_severity: string;
  crash_year: string;
  crash_month: string;
  crash_day_of_week: string;
  crash_hour: number;
  crash_longitude: number;
  crash_latitude: number;
};

export type CrashQuery = {
  startDate: string; // format: 'YYYY-MM'
  endDate: string; // format: 'YYYY-MM'
  location: string[]; // format: ['suburb:Brisbane', 'lga:Logan']
};

export type HourlyRadarData = {
  hour: number; // 0 to 23 (acts as angle axis key)
  value: number; // the metric you’re plotting (e.g. crash count)
};

export type SeverityDonutData = {
  name: "Fatal" | "Hospitalisation" | "Medical treatment" | "Minor injury";
  value: number;
  color: string;
};

export type AIChartData = {
  title: string;
  dataKey: string;
  series: { name: string }[]; // Use the specific type
  data: any[]; // Use any[] or Record<string, any>[] if preferred
};
