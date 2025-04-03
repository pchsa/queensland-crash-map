import { Button } from "@mantine/core";
import DateSelect from "./DateSelect";
import { LocationSelect } from "./LocationSelect";
import SeveritySelect from "./SeveritySelect";
import { useCrashStore, useFilterStore } from "../../store";
import { fetchCrashes } from "../../api";
import { CrashQuery } from "../../types";

function Filters() {
  const { location, dateRange, severity } = useFilterStore();
  const { setCrashes } = useCrashStore();

  const handleSubmit = () => {
    // do something with selected filters here
    console.log("Submit clicked");
    const queryLocation = location.map((loc) =>
      !loc.startsWith("Custom Area") ? `locality:${loc}` : `muhahah`
    );

    const queryDateRange = dateRange.map((date) =>
      date.toISOString().slice(0, 7)
    );
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
