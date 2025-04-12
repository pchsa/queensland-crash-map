import { BarChart } from "@mantine/charts";
import { ActionIcon, Group, Stack, TextInput } from "@mantine/core";
import { IconSparkles, IconInfoCircle } from "@tabler/icons-react";
import { CrashQuery } from "../../types";
import { useState } from "react";

function AIBarChart() {
  const [prompt, setPrompt] = useState("");

  const handleGenerateChart = () => {
    console.log("Generating chart with prompt:", prompt);
    // your logic here
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
      <BarChart
        h={300}
        data={data}
        dataKey="month"
        series={[
          { name: "Smartphones" },
          { name: "Laptops" },
          { name: "Tablets" },
        ]}
        tickLine="y"
      />
    </Stack>
  );
}
export default AIBarChart;
export const data = [
  { month: "January", Smartphones: 1200, Laptops: 900, Tablets: 200 },
  { month: "February", Smartphones: 1900, Laptops: 1200, Tablets: 400 },
  { month: "March", Smartphones: 400, Laptops: 1000, Tablets: 200 },
  { month: "April", Smartphones: 1000, Laptops: 200, Tablets: 800 },
  { month: "May", Smartphones: 800, Laptops: 1400, Tablets: 1200 },
  { month: "June", Smartphones: 750, Laptops: 600, Tablets: 1000 },
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
