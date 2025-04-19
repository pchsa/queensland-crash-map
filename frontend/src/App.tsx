import { Box, Stack } from "@mantine/core";
import MapView from "./components/map/MapView";
import Filters from "./components/filtering/Filters";
import StatsPanel from "./components/stats/StatsPanel";

function App() {
  return (
    <Box pos="relative" h="100vh" w="100vw">
      <MapView />
      <Stack
        pos="absolute"
        left={20}
        top={20}
        w={600}
        style={{
          zIndex: 10,
        }}
      >
        <Filters />
        <StatsPanel />
      </Stack>
    </Box>
  );
}

export default App;
