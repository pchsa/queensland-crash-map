
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
  endDate: string;   // format: 'YYYY-MM'
  location: string[]; // format: ['suburb:Brisbane', 'lga:Logan']
}