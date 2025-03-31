import { useState } from "react";
import { MonthPickerInput } from "@mantine/dates";

function DateSelect() {
  const [value, setValue] = useState<[Date | null, Date | null]>([
    new Date(2023, 0, 1), // January 2023
    new Date(2023, 11, 1), // December 2023
  ]);
  return (
    <MonthPickerInput
      type="range"
      label="Pick dates range"
      placeholder="Pick dates range"
      value={value}
      onChange={setValue}
      minDate={new Date(2011, 0, 1)} // January 1, 2011
      maxDate={new Date(2023, 11, 31)}
      // disabled={true}
    />
  );
}

export default DateSelect;
