import { Paper, ScrollArea, Stack, Text } from "@mantine/core";
import { useCrashStore } from "../../store";
import { DonutChart } from "@mantine/charts";
import HourChart from "./HourChart";
import AIBarChart from "./AIBarChart";

function StatsPanel() {
  const { crashCount, getHourlyRadarData, getSeverityCounts } = useCrashStore();
  return (
    <Paper
      pos="absolute"
      top={20}
      right={20}
      bottom={20}
      shadow="md"
      p={20}
      radius="lg"
      w={500}
      style={{
        zIndex: 10,
      }}
    >
      <ScrollArea h="100%">
        <Stack>
          <Text>{crashCount()} crashes</Text>
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
          <AIBarChart />
        </Stack>
      </ScrollArea>
    </Paper>
  );
}
export default StatsPanel;
