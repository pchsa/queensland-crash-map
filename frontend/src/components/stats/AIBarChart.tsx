import { BarChart } from "@mantine/charts";
import {
  ActionIcon,
  Group,
  Stack,
  TextInput,
  Text,
  Center,
  Loader,
  Tooltip,
} from "@mantine/core";
import {
  IconSparkles,
  IconInfoCircle,
  IconExclamationCircle,
} from "@tabler/icons-react";
import { AIChartData, CrashQuery } from "../../types";
import { useEffect, useState } from "react";
import { fetchAIChartData } from "../../api";
import { useCrashStore, useFilterStore } from "../../store";
import axios from "axios";

function AIBarChart() {
  const { location, dateRange } = useFilterStore();
  const { crashes } = useCrashStore();

  const [prompt, setPrompt] = useState("");
  const [chartData, setChartData] = useState<AIChartData>({
    title: "Sample Data",
    dataKey: "crash_atmospheric_condition",
    series: [{ name: "count" }],
    data: data,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayChart, setDisplayChart] = useState(false);

  useEffect(() => {
    setError("");
    setDisplayChart(false);
  }, [crashes]);

  const handleGenerateChart = async () => {
    setLoading(true);
    setError("");
    console.log("Generating chart with prompt:", prompt);
    try {
      const data = await fetchAIChartData(
        getCrashQuery(location, dateRange),
        prompt
      );
      setChartData(data);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setError(err.response.data.error);
      }
    }
    setLoading(false);
    setDisplayChart(true);
  };

  const renderChart = () => {
    if (error) {
      return (
        <Center h={300}>
          <Stack align="center" gap="xs">
            <IconExclamationCircle size={32} color="gray" />
            <Text c="dimmed" ta="center">
              {error}
            </Text>
          </Stack>
        </Center>
      );
    } else if (loading) {
      return (
        <Center h={300}>
          <Stack align="center" gap="xs">
            <Loader size={32} color="gray" />
            <Text c="dimmed" ta="center">
              Generating Chart
            </Text>
          </Stack>
        </Center>
      );
    } else if (displayChart) {
      return (
        <div>
          <Text fz="xs" mb="sm" ta="center">
            {chartData.title}
          </Text>
          <BarChart
            tooltipAnimationDuration={200}
            h={300}
            data={chartData.data}
            dataKey={chartData.dataKey}
            series={chartData.series}
          />
        </div>
      );
    } else {
      return (
        <Center h={300}>
          <Stack align="center" gap="xs">
            <IconInfoCircle size={32} color="gray" />
            <Text c="dimmed" ta="center">
              Select data and submit a prompt to generate a chart.
            </Text>
          </Stack>
        </Center>
      );
    }
    return null;
  };

  return (
    <Stack>
      <Group>
        <TextInput
          placeholder="Generate a chart (e.g. Show me crashes by severity)"
          size="sm"
          value={prompt}
          onChange={(event) => setPrompt(event.currentTarget.value)}
          flex={1}
        />

        <ActionIcon
          disabled={prompt.length == 0 || location.length == 0}
          size="input-sm"
          variant="filled"
          onClick={(event) => {
            event.preventDefault();
            handleGenerateChart();
          }}
        >
          <IconSparkles style={{ width: "70%", height: "70%" }} stroke={1.5} />
        </ActionIcon>
      </Group>

      {renderChart()}
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
