import { Center, Paper, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { useCrashStore, useFilterStore } from "../../store";
import { DonutChart } from "@mantine/charts";
import HourChart from "./HourChart";
import AIBarChart from "./AIBarChart";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

function StatsPanel() {
  const { crashCount, getHourlyRadarData, getSeverityCounts } = useCrashStore();
  const [dateDisplay, setDateDisplay] = useState("");
  const { dateRange } = useFilterStore();

  useEffect(() => {
    // Check if dateRange exists, has 2 elements, and both are valid Date objects
    if (
      dateRange &&
      dateRange.length === 2 &&
      dateRange[0] instanceof Date &&
      !isNaN(dateRange[0].getTime()) &&
      dateRange[1] instanceof Date &&
      !isNaN(dateRange[1].getTime())
    ) {
      // If valid, format and update the state
      const formattedRange = formatDisplayDateRange(dateRange[0], dateRange[1]);
      setDateDisplay(formattedRange);
    }
    // If dateRange is null, undefined, or invalid, do nothing (as requested)
    // The state 'dateDisplay' will retain its previous value.
    // If you wanted it to reset, you could add an else block here:
    // else {
    //   setDateDisplay("Date range not selected"); // Or ""
    // }
  }, [dateRange]);

  return (
    <Paper shadow="md" radius="lg" w="100%" p={25} withBorder>
      <Stack w="100%" align="center" gap={0}>
        <Title order={1}>{crashCount()} crashes</Title>
        {/* Use the helper function to display the formatted date range */}
        <Text c="dimmed">{dateDisplay}</Text>
      </Stack>
      <AIBarChart />
    </Paper>
  );
}

// Helper function to format the date range (keep it for formatting logic)
const formatDisplayDateRange = (
  startDate: Date, // Accepts valid dates only now
  endDate: Date
): string => {
  const startFormatted = dayjs(startDate).format("MMM YYYY");
  const endFormatted = dayjs(endDate).format("MMM YYYY");

  if (startFormatted === endFormatted) {
    return startFormatted;
  }
  return `${startFormatted} - ${endFormatted}`;
};

export default StatsPanel;
