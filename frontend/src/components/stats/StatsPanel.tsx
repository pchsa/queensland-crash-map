import { Paper, Space, Stack, Text, Title } from "@mantine/core";
import { useCrashStore, useFilterStore } from "../../store";
import AIBarChart from "./AIBarChart";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

function StatsPanel() {
  const { crashCount } = useCrashStore();
  const [dateDisplay, setDateDisplay] = useState("");
  const { dateRange } = useFilterStore();

  useEffect(() => {
    if (
      dateRange &&
      dateRange.length === 2 &&
      dateRange[0] instanceof Date &&
      !isNaN(dateRange[0].getTime()) &&
      dateRange[1] instanceof Date &&
      !isNaN(dateRange[1].getTime())
    ) {
      const formattedRange = formatDisplayDateRange(dateRange[0], dateRange[1]);
      setDateDisplay(formattedRange);
    }
  }, [dateRange]);

  return (
    <Paper shadow="md" radius="lg" w="100%" p={25} withBorder>
      <Stack w="100%" align="center" gap={0}>
        <Title order={1}>{crashCount()} crashes</Title>
        <Text c="dimmed">{dateDisplay}</Text>
      </Stack>
      <Space h="lg" />
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
