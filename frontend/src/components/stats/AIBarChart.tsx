import { BarChart } from "@mantine/charts";
import { ActionIcon, Group, Stack, TextInput, Text } from "@mantine/core";
import { IconSparkles, IconInfoCircle } from "@tabler/icons-react";
import { AIChartData, CrashQuery } from "../../types";
import { useState } from "react";
import { fetchAIChartData } from "../../api";
import { useFilterStore } from "../../store";

function AIBarChart() {
  const { location, dateRange } = useFilterStore();

  const [prompt, setPrompt] = useState("");
  const [chartData, setChartData] = useState<AIChartData>({
    title: "Sample Data",
    dataKey: "crash_atmospheric_condition",
    series: [{ name: "count" }],
    data: data,
  });

  const handleGenerateChart = () => {
    console.log("Generating chart with prompt:", prompt);
    fetchAIChartData(getCrashQuery(location, dateRange), prompt).then(
      (value) => {
        console.log(value);
        setChartData(value);
      }
    );
  };

  return (
    <Stack>
      <Group>
        <TextInput
          placeholder="Generate bar chart about..."
          size="sm"
          value={prompt}
          onChange={(event) => setPrompt(event.currentTarget.value)}
        />
        <ActionIcon
          disabled={prompt.length == 0}
          size="input-sm"
          variant="filled"
          onClick={handleGenerateChart}
        >
          <IconSparkles style={{ width: "70%", height: "70%" }} stroke={1.5} />
        </ActionIcon>
        <ActionIcon size="input-sm" variant="filled">
          <IconInfoCircle
            style={{ width: "70%", height: "70%" }}
            stroke={1.5}
          />
        </ActionIcon>
      </Group>
      <div>
        <Text fz="xs" mb="sm" ta="center">
          {chartData.title}
        </Text>
        <BarChart
          h={300}
          data={chartData.data}
          dataKey={chartData.dataKey}
          series={chartData.series}
        />
      </div>
    </Stack>
  );
}
export default AIBarChart;
const data = [
  { crash_atmospheric_condition: "Clear", count: 1 },
  { crash_atmospheric_condition: "Raining", count: 6 },
];

function getCrashQuery(
  location: string[],
  dateRange: [Date | null, Date | null]
): CrashQuery {
  const queryLocation = location.map((loc) =>
    !loc.startsWith("Bounding Box #")
      ? `locality:${loc}`
      : `bbox:${loc.split(":")[1]}`
  );

  const queryDateRange = dateRange.map((date) => {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const yyyyMM = `${year}-${month}`;
    return yyyyMM;
  });

  return {
    startDate: queryDateRange[0],
    endDate: queryDateRange[1],
    location: queryLocation,
  } as CrashQuery;
}
