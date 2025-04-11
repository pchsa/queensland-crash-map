import { Stack, Text } from "@mantine/core";
import { useCrashStore } from "../../store";
import { DonutChart } from "@mantine/charts";
import HourChart from "./HourChart";

function StatsPanel() {
  const { crashCount, getHourlyRadarData, getSeverityCounts } = useCrashStore();
  return (
    <Stack>
      <text>{crashCount()} crashes</text>
      <HourChart data={getHourlyRadarData()} />
      <div>
        <Text fz="xs" mb="sm" ta="center">
          Data only for hovered segment
        </Text>
        <DonutChart
          data={getSeverityCounts()}
          tooltipDataSource="segment"
          mx="auto"
        />
      </div>
    </Stack>
  );
}
export default StatsPanel;
