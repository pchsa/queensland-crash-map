import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function AreaSelect() {
  const map = useMap() as L.Map & { selectArea: { enable: () => void } }; // Extend the Map type

  useEffect(() => {
    if (!map.selectArea) return;
    map.selectArea.enable();

    map.on("selectarea:selected", (e: any) => {
      const sw = e.bounds.getSouthWest(); // L.LatLng
      const ne = e.bounds.getNorthEast(); // L.LatLng
      const bbox = `bbox:${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;
    });
  }, []);

  return null;
}
