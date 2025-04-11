import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useFilterStore } from "../../store";

export default function AreaSelect() {
  const map = useMap() as L.Map & { selectArea: { enable: () => void } }; // Extend the Map type
  const { addBoundingBox } = useFilterStore();

  useEffect(() => {
    if (!map.selectArea) return;

    // Enable the select area functionality
    map.selectArea.enable();

    // Define the event listener
    const handleSelectArea = (e: any) => {
      const sw = e.bounds.getSouthWest(); // L.LatLng
      const ne = e.bounds.getNorthEast(); // L.LatLng
      const bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;

      // Add bounding box and increment counter in one action
      addBoundingBox(bbox);
    };

    // Register the event listener
    map.on("selectarea:selected", handleSelectArea);

    // Cleanup function to remove the event listener
    return () => {
      map.off("selectarea:selected", handleSelectArea);
    };
  }, [map, addBoundingBox]); // Dependencies: map and addBoundingBox

  return null;
}
