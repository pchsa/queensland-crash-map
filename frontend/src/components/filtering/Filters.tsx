import { ActionIcon, Button, Group, Paper, Space, Title } from "@mantine/core";
import DateSelect from "./DateSelect";
import { LocationSelect } from "./LocationSelect";
import { useCrashStore, useFilterStore } from "../../store";
import { fetchCrashes } from "../../api";
import { CrashQuery } from "../../types";
import { IconInfoCircle } from "@tabler/icons-react";

function Filters() {
  const { location, dateRange } = useFilterStore();
  const { setCrashes } = useCrashStore();

  const handleSubmit = () => {
    // Validate params
    if (location.length == 0) {
      console.log("must include location");
      return;
    }

    if (!dateRange[0] || !dateRange[1]) {
      console.log("must include date range");
      return;
    }

    fetchCrashes(getCrashQuery(location, dateRange)).then(setCrashes);
  };

  return (
    <Paper shadow="md" radius="lg" w="100%" p={25} withBorder>
      <Group align="center">
        <Title order={3} lh={0} mb={4}>
          Queensland Crash Map
        </Title>
        <ActionIcon variant="subtle" color="gray" radius="xl">
          <IconInfoCircle />
        </ActionIcon>
      </Group>
      <Space h="md" />
      <LocationSelect />
      <Space h="md" />

      <DateSelect />
      <Button onClick={handleSubmit}>Submit</Button>
    </Paper>
  );
}

export default Filters;

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
