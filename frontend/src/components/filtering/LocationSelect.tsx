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
import { useFilterStore } from "../../store";

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
          {item.startsWith("Bounding Box #") ? item.split(":")[0] : item}
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
  const { location, setLocation } = useFilterStore();

  // fetch suburb names for autocomplete
  useEffect(() => {
    fetchSuburbNames().then((suburbs) => {
      setAllSuburbs(suburbs);
      combobox.selectFirstOption();
    });
  }, []);

  const handleValueSelect = (val: string) => {
    setLocation(
      location.includes(val)
        ? location.filter((v) => v !== val)
        : [...location, val]
    );
    setSearch("");
  };

  const handleValueRemove = (val: string) =>
    setLocation(location.filter((v) => v !== val));

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
            <SelectedPills values={location} onRemove={handleValueRemove} />

            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder={location.length == 0 ? "Search for a suburb" : ""}
                onChange={(event) => {
                  combobox.openDropdown();
                  setSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && search.length === 0) {
                    event.preventDefault();
                    handleValueRemove(location[location.length - 1]);
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
            <SuburbOptions options={filteredOptions} selected={location} />
          ) : (
            <Combobox.Empty>Nothing found...</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
