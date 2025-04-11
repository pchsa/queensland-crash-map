import { BarChart } from "@mantine/charts";
import { ActionIcon, Group, Stack, TextInput } from "@mantine/core";
import { IconSparkles, IconInfoCircle } from "@tabler/icons-react";

function AIBarChart() {
  return (
    <Stack>
      <Group>
        <TextInput placeholder="sm size input" size="sm" />
        <ActionIcon size="input-sm" variant="filled">
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
