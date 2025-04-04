import { Button } from "@mantine/core";
import DateSelect from "./DateSelect";
import { LocationSelect } from "./LocationSelect";
import SeveritySelect from "./SeveritySelect";
import { useCrashStore, useFilterStore } from "../../store";
import { fetchCrashes } from "../../api";
import { CrashQuery } from "../../types";

function Filters() {
  const { location, dateRange } = useFilterStore();
  const { setCrashes } = useCrashStore();

  const handleSubmit = () => {
    // do something with selected filters here
    if (location.length == 0) {
      console.log("must include location");
      return;
    }

    if (!dateRange[0] || !dateRange[1]) {
      console.log("must include date range");
      return;
    }

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

    console.log({
      startDate: queryDateRange[0],
      endDate: queryDateRange[1],
      location: queryLocation,
    });
    fetchCrashes({
      startDate: queryDateRange[0],
      endDate: queryDateRange[1],
      location: queryLocation,
    } as CrashQuery).then(setCrashes);
  };

  return (
    <div>
      <LocationSelect />
      <DateSelect />
      <SeveritySelect />
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}

export default Filters;
