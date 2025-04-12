import { Grid } from "@mantine/core";
import MapView from "./components/map/MapView";
import Filters from "./components/filtering/Filters";
import StatsPanel from "./components/stats/StatsPanel";

function App() {
  return (
    <Grid>
      <Grid.Col span={2}>
        <Filters />
      </Grid.Col>
      <Grid.Col span={6}>
        <MapView />
      </Grid.Col>
      <Grid.Col span={4}>
        <StatsPanel />
      </Grid.Col>
    </Grid>
  );
}

export default App;
