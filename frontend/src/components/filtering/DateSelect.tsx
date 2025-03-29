import { useState } from 'react';
import { MonthPickerInput } from '@mantine/dates';

function DateSelect() {
  const [value, setValue] = useState<[Date | null, Date | null]>([null, null]);
  return (
    <MonthPickerInput
      type="range"
      label="Pick dates range"
      placeholder="Pick dates range"
      value={value}
      onChange={setValue}
    />
  );
}

export default DateSelect;