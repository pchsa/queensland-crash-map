import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function AreaSelect() {
    const map = useMap() as L.Map & { selectArea: { enable: () => void } }; // Extend the Map type

  useEffect(() => {
    if (!map.selectArea) return;    
    map.selectArea.enable();

    map.on("selectarea:selected", (e: any) => {
      console.log(e.bounds); // lon, lat, lon, lat
      const rectangle = L.rectangle(e.bounds, { color: "red", weight: 1 }).addTo(map);
      setTimeout(() => rectangle.remove(), 1000);
    });
  }, []);

  return null;
}
