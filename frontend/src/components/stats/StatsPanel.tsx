import { AspectRatio, Stack, Text } from "@mantine/core";
import { useCrashStore } from "../../store";
import { DonutChart } from "@mantine/charts";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function StatsPanel() {
  const { crashCount } = useCrashStore();
  return (
    <Stack>
      <text>{crashCount()} crashes</text>
      <div>
        <Text fz="xs" mb="sm" ta="center">
          Data only for hovered segment
        </Text>
        <AspectRatio ratio={3 / 3} w="100%">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={hourlyData}>
              <PolarGrid gridType="circle" />
              <PolarAngleAxis
                dataKey="hour"
                tickFormatter={(tick) =>
                  [0, 3, 6, 9, 12, 15, 18, 21].includes(tick)
                    ? hourLabels[tick]
                    : ""
                }
              />
              <PolarRadiusAxis />
              <Radar
                name="Crashes"
                dataKey="value"
                stroke="#aaa"
                fill="#aaa"
                fillOpacity={0.2}
              />
              <Tooltip labelFormatter={(label) => hourLabels[label]} />
            </RadarChart>
          </ResponsiveContainer>
        </AspectRatio>
      </div>
      <div>
        <Text fz="xs" mb="sm" ta="center">
          Data only for hovered segment
        </Text>
        <DonutChart data={data} tooltipDataSource="segment" mx="auto" />
      </div>
    </Stack>
  );
}
export default StatsPanel;
export const data = [
  { name: "USA", value: 400, color: "indigo.6" },
  { name: "India", value: 300, color: "yellow.6" },
  { name: "Japan", value: 100, color: "teal.6" },
  { name: "Other", value: 200, color: "gray.6" },
];
const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  value: Math.floor(Math.random() * 100),
}));

const hourLabels = [
  "Midnight",
  "1am",
  "2am",
  "3am",
  "4am",
  "5am",
  "6am",
  "7am",
  "8am",
  "9am",
  "10am",
  "11am",
  "Noon",
  "1pm",
  "2pm",
  "3pm",
  "4pm",
  "5pm",
  "6pm",
  "7pm",
  "8pm",
  "9pm",
  "10pm",
  "11pm",
];
