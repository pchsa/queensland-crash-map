import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Paper,
  Space,
  Title,
} from "@mantine/core";
import DateSelect from "./DateSelect";
import { LocationSelect } from "./LocationSelect";
import { useCrashStore, useFilterStore } from "../../store";
import { fetchCrashes } from "../../api";
import { CrashQuery } from "../../types";
import { IconInfoCircle } from "@tabler/icons-react";
import { useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import InfoContent from "../InfoContent";

function Filters() {
  const [opened, { open, close }] = useDisclosure(false);
  const { location, dateRange } = useFilterStore();
  const { setCrashes } = useCrashStore();

  useEffect(() => {
    if (location.length == 0) {
      setCrashes([]);
      return;
    }

    if (!dateRange[0] || !dateRange[1]) {
      return;
    }

    fetchCrashes(getCrashQuery(location, dateRange)).then(setCrashes);
  }, [location, dateRange]);

  return (
    <>
      <Paper shadow="md" radius="lg" w="100%" p={25} withBorder>
        <Group align="center">
          <Title order={3} lh={0} mb={4}>
            Queensland Crash Map
          </Title>
          <ActionIcon variant="subtle" color="gray" radius="xl" onClick={open}>
            <IconInfoCircle />
          </ActionIcon>
        </Group>
        <Space h="md" />
        <LocationSelect />
        <Space h="md" />

        <DateSelect />
      </Paper>

      <Modal
        opened={opened}
        onClose={close}
        title={<Title order={3}>Tips for using the Queensland Crash Map</Title>}
        size="53rem"
      >
        <InfoContent />
      </Modal>
    </>
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
