import { Grid } from "@mantine/core";
import MapView from "./components/MapView";
import Filters from "./components/filtering/Filters";

function App() {
  return (
    <Grid>
      <Grid.Col span={2}>
        <Filters />
      </Grid.Col>
      <Grid.Col span={8}>
        <MapView />
      </Grid.Col>
      <Grid.Col span={2}>hello</Grid.Col>
    </Grid>
  );
}

export default App;
