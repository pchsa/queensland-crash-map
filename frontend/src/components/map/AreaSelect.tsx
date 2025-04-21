import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useFilterStore } from "../../store";
import { IconX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

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

      // Define the bounding box boundaries
      const boundary = {
        latMin: -29.79369059202742,
        latMax: -9.57688718503954,
        lngMin: 137.36605511389234,
        lngMax: 155.7755287851727,
      };

      // Check if the bounding box falls outside the defined boundary
      if (
        sw.lat < boundary.latMin ||
        sw.lat > boundary.latMax ||
        ne.lat < boundary.latMin ||
        ne.lat > boundary.latMax ||
        sw.lng < boundary.lngMin ||
        sw.lng > boundary.lngMax ||
        ne.lng < boundary.lngMin ||
        ne.lng > boundary.lngMax
      ) {
        // Most used notification props
        notifications.show({
          position: "bottom-center",
          withCloseButton: true,
          autoClose: 5000,
          title: "Bounding Box Out of Bounds",
          message: `The area you've selected falls outside the allowed boundary.`,
          color: "red",
          radius: "lg",
          icon: <IconX />,
        });
        return;
      }

      // Add bounding box and increment counter if within bounds
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
