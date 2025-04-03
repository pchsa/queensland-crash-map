import { useEffect, useState } from "react";
import {
  CheckIcon,
  Combobox,
  Group,
  Pill,
  PillsInput,
  useCombobox,
} from "@mantine/core";
import { fetchSuburbNames } from "../../api";

function getFilteredOptions(
  data: string[],
  searchQuery: string,
  limit: number
) {
  const result: string[] = [];

  for (let i = 0; i < data.length; i += 1) {
    if (result.length === limit) break;

    if (data[i].toLowerCase().startsWith(searchQuery.trim().toLowerCase())) {
      result.push(data[i]);
    }
  }

  return result;
}

function SelectedPills({
  values,
  onRemove,
}: {
  values: string[];
  onRemove: (val: string) => void;
}) {
  return (
    <>
      {values.map((item) => (
        <Pill key={item} withRemoveButton onRemove={() => onRemove(item)}>
          {item}
        </Pill>
      ))}
    </>
  );
}

function SuburbOptions({
  options,
  selected,
}: {
  options: string[];
  selected: string[];
}) {
  return options.map((item) => (
    <Combobox.Option value={item} key={item} active={selected.includes(item)}>
      <Group gap="sm">
        {selected.includes(item) && <CheckIcon size={12} />}
        <span>{item}</span>
      </Group>
    </Combobox.Option>
  ));
}

export function LocationSelect() {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.selectFirstOption(),
  });

  const [allSuburbs, setAllSuburbs] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [value, setValue] = useState<string[]>([]);

  // fetch suburb names for autocomplete
  useEffect(() => {
    fetchSuburbNames().then((suburbs) => {
      console.log(suburbs);
      setAllSuburbs(suburbs);
      combobox.selectFirstOption();
    });
  }, []);

  const handleValueSelect = (val: string) => {
    setValue((current) =>
      current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val]
    );
    setSearch("");
  };

  const handleValueRemove = (val: string) =>
    setValue((current) => current.filter((v) => v !== val));

  const filteredOptions = getFilteredOptions(allSuburbs, search, 10);

  useEffect(() => {
    // we need to wait for options to render before we can select first one
    combobox.selectFirstOption();
  }, [filteredOptions]);

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={handleValueSelect}
      withinPortal={false}
    >
      <Combobox.DropdownTarget>
        <PillsInput
          label="Choose Location"
          onClick={() => combobox.openDropdown()}
        >
          <Pill.Group>
            <SelectedPills values={value} onRemove={handleValueRemove} />

            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder="Search for a suburb"
                onChange={(event) => {
                  combobox.openDropdown();
                  setSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && search.length === 0) {
                    event.preventDefault();
                    handleValueRemove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown hidden={search.length === 0}>
        <Combobox.Options>
          {filteredOptions.length > 0 ? (
            <SuburbOptions options={filteredOptions} selected={value} />
          ) : (
            <Combobox.Empty>Nothing found...</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
