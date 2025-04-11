import { useCrashStore } from "../../store";

function StatsPanel() {
  const { crashCount } = useCrashStore();
  return <text>{crashCount()} crashes</text>;
}
export default StatsPanel;
