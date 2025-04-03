import { MonthPickerInput } from "@mantine/dates";
import { useFilterStore } from "../../store";

function DateSelect() {
  const { dateRange, setDateRange } = useFilterStore();
  return (
    <MonthPickerInput
      type="range"
      label="Pick dates range"
      placeholder="Pick dates range"
      value={dateRange}
      onChange={(val) => {
        if (!val[0] && !val[1]) {
          setDateRange([new Date(2023, 0, 1), new Date(2023, 11, 1)]);
        } else {
          setDateRange(val);
        }
      }}
      minDate={new Date(2011, 0, 1)} // January 1, 2011
      maxDate={new Date(2023, 11, 31)}
    />
  );
}

export default DateSelect;
