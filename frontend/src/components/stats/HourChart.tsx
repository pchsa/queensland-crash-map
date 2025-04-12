import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AspectRatio, Text } from "@mantine/core";
import type { HourlyRadarData } from "../../types"; // adjust the path

type HourChartProps = {
  data: HourlyRadarData[];
};

function HourChart({ data }: HourChartProps) {
  return (
    <div>
      <Text fz="xs" mb="sm" ta="center">
        Data only for hovered segment
      </Text>
      <AspectRatio ratio={16 / 9} w="100%">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid gridType="circle" />
            <PolarAngleAxis
              dataKey="hour"
              tickFormatter={(tick) =>
                [0, 3, 6, 9, 12, 15, 18, 21].includes(tick)
                  ? hourLabels[tick]
                  : ""
              }
            />
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
  );
}

export default HourChart;
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
