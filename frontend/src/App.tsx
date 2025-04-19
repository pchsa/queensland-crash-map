import { Box } from "@mantine/core";
import MapView from "./components/map/MapView";
import Filters from "./components/filtering/Filters";
import StatsPanel from "./components/stats/StatsPanel";

function App() {
  return (
    <Box pos="relative" h="100vh" w="100vw">
      <MapView />
      <Filters />
      <StatsPanel />
    </Box>
  );
}

export default App;
