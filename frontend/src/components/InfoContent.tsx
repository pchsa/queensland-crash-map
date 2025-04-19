import {
  Text,
  Title,
  List,
  Code,
  Kbd,
  Space,
  Accordion,
  ThemeIcon,
  Anchor,
  Table, // Import Table
  ScrollArea, // Import ScrollArea
} from "@mantine/core";
import {
  IconMapSearch,
  IconChartBar,
  IconDatabase,
  IconKeyboard,
  IconPointer,
  IconTrash,
  IconCategory, // Keep this for the title
} from "@tabler/icons-react";

// Data for the table
const dataCategories = [
  {
    field: "Crash_Atmospheric_Condition",
    values: "Clear, Fog, Raining, Smoke/Dust",
  },
  {
    field: "crash_day_of_week",
    values: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
  },
  { field: "crash_hour", values: "0-23 (representing hour of day)" },
  {
    field: "crash_month",
    values:
      "January, February, March, April, May, June, July, August, September, October, November, December",
  },
  {
    field: "Crash_Nature",
    values:
      "Angle, Head-on, Hit pedestrian, Rear-end, Sideswipe, Overturned, etc.",
  },
  {
    field: "Crash_Roadway_Feature",
    values:
      "Intersection - Cross, Roundabout, Bridge/Causeway, No Roadway Feature, etc.",
  },
  {
    field: "Crash_Severity",
    values: "Fatal, Hospitalisation, Medical treatment, Minor injury",
  },
  {
    field: "Crash_Speed_Limit",
    values: "0 - 50 km/h, 60 km/h, 70 km/h, 80 - 90 km/h, 100 - 110 km/h, NULL",
  },
  {
    field: "Crash_Type",
    values: "Hit pedestrian, Multi-Vehicle, Other, Single Vehicle",
  },
  { field: "Crash_year", values: "2011, 2012, ..., 2023" },
];

function InfoContent() {
  const datasetLink =
    "https://www.data.qld.gov.au/dataset/crash-data-from-queensland-roads/resource/e88943c0-5968-4972-a15f-38e120d72ec0";

  // Generate table rows
  const rows = dataCategories.map((item) => (
    <Table.Tr key={item.field}>
      <Table.Td>
        <Code>{item.field}</Code>
      </Table.Td>
      <Table.Td>
        <Text size="xs">{item.values}</Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Accordion multiple defaultValue={["map", "ai-chart", "data"]}>
        {/* Map Interaction */}
        <Accordion.Item value="map">
          <Accordion.Control
            icon={
              <ThemeIcon variant="light">
                <IconMapSearch size="1.1rem" />
              </ThemeIcon>
            }
          >
            Using the Map & Filters
          </Accordion.Control>
          <Accordion.Panel>
            <List spacing="sm" size="sm">
              <List.Item
                icon={
                  <ThemeIcon variant="light" size={20} radius="xl">
                    <IconKeyboard size="0.9rem" />
                  </ThemeIcon>
                }
              >
                <Text span>
                  <Text fw={700} span>
                    Select Custom Area:
                  </Text>{" "}
                  To analyze a specific region, hold down <Kbd>Ctrl</Kbd>, then{" "}
                  <Text fw={700} span>
                    click and drag
                  </Text>{" "}
                  on the map to draw a selection box.
                </Text>
              </List.Item>
              <List.Item
                icon={
                  <ThemeIcon variant="light" size={20} radius="xl">
                    <IconPointer size="0.9rem" />
                  </ThemeIcon>
                }
              >
                <Text span>
                  <Text fw={700} span>
                    Multiple Areas/Suburbs:
                  </Text>{" "}
                  You can add multiple bounding boxes or search for suburbs in
                  the 'Location' filter.
                </Text>
              </List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="ai-chart">
          <Accordion.Control
            icon={
              <ThemeIcon variant="light">
                <IconChartBar size="1.1rem" />
              </ThemeIcon>
            }
          >
            Generating Charts (AI Powered)
          </Accordion.Control>
          <Accordion.Panel>
            <List spacing="sm" size="sm">
              <List.Item>
                <Text span>
                  <Text fw={700} span>
                    How:
                  </Text>{" "}
                  Describe the breakdown you want to see in the input box and
                  click the ✨ button. The AI will interpret your request and
                  generate the chart if possible.
                </Text>
              </List.Item>
              <List.Item>
                <Text span>
                  <Text fw={700} span>
                    Examples:
                  </Text>{" "}
                  Try prompts like:
                </Text>
                <List
                  listStyleType="disc"
                  withPadding
                  size="sm"
                  spacing={3}
                  mt={4}
                >
                  <List.Item>
                    <Code>"Show crashes by severity"</Code>
                  </List.Item>
                  <List.Item>
                    <Code>"Breakdown by day of the week"</Code>
                  </List.Item>
                  <List.Item>
                    <Code>"Crashes per hour"</Code>
                  </List.Item>
                  <List.Item>
                    <Code>"Compare crash types"</Code>
                  </List.Item>
                  <List.Item>
                    <Code>
                      "What are the weather conditions during crashes?"
                    </Code>
                  </List.Item>
                </List>
              </List.Item>
              <List.Item>
                <Text span>
                  <Text fw={700} span>
                    Tips:
                  </Text>{" "}
                  Be specific for best results. Refer to the 'About the Data &
                  Chart Categories' section below to see the types of data
                  available to ask about (like atmospheric conditions, roadway
                  features, etc.).
                </Text>
              </List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>

        {/* About the Data */}
        <Accordion.Item value="data">
          <Accordion.Control
            icon={
              <ThemeIcon variant="light">
                <IconDatabase size="1.1rem" />
              </ThemeIcon>
            }
          >
            About the Data & Chart Categories
          </Accordion.Control>
          <Accordion.Panel>
            <List spacing="xs" size="sm">
              <List.Item>
                <Text span>
                  <Text fw={700} span>
                    Source:
                  </Text>{" "}
                  Data sourced from the{" "}
                  <Anchor
                    href={datasetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Queensland Government Open Data Portal
                  </Anchor>
                  .
                </Text>
              </List.Item>
              <List.Item>
                <Text span>
                  <Text fw={700} span>
                    Coverage:
                  </Text>{" "}
                  Includes reported crashes from{" "}
                  <Text fw={700} span>
                    2011 to 2023
                  </Text>
                  .
                </Text>
              </List.Item>
              <List.Item>
                <Text span>
                  <Text fw={700} span>
                    Exclusions:
                  </Text>{" "}
                  Does{" "}
                  <Text fw={700} span>
                    not
                  </Text>{" "}
                  include crashes where only property damage occurred.
                </Text>
              </List.Item>
              <List.Item>
                <Text span>
                  <Text fw={700} span>
                    Disclaimer:
                  </Text>{" "}
                  Data is for informational purposes and may contain
                  discrepancies.
                </Text>
              </List.Item>
            </List>

            <Space h="md" />
            <Title
              order={5}
              mb="xs"
              display="flex"
              style={{ alignItems: "center" }}
            >
              <ThemeIcon variant="light" size={20}>
                <IconCategory size="1rem" />
              </ThemeIcon>
              Available Categories for Chart Generation
            </Title>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Field Name (for input)</Table.Th>
                  <Table.Th>Example Values / Format</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
  );
}

export default InfoContent;
