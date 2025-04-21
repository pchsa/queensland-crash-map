import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { useFilterStore } from "../../store";
import { fetchSuburbGeoData } from "../../api";
import L from "leaflet";

function GeoLayer() {
  const map = useMap();
  const { location } = useFilterStore();

  // Store previously added layers in a ref
  const layerMapRef = useRef<Record<string, L.GeoJSON | L.Rectangle>>({});

  useEffect(() => {
    const current = new Set(location);
    const layerMap = layerMapRef.current;

    // Remove layers that are no longer selected
    for (const loc in layerMap) {
      if (!current.has(loc)) {
        map.removeLayer(layerMap[loc]);
        delete layerMap[loc];
      }
    }

    // Add new layers
    Promise.all(
      location.map(async (loc) => {
        if (!layerMap[loc]) {
          if (loc.startsWith("Bounding Box #")) {
            const [, bboxStr] = loc.split(":");
            const [minLng, minLat, maxLng, maxLat] = bboxStr
              .split(",")
              .map(parseFloat);

            const bounds = L.latLngBounds(
              L.latLng(minLat, minLng),
              L.latLng(maxLat, maxLng)
            );

            console.log(bounds);

            const rectangle = L.rectangle(bounds, {
              color: "#3388FF",
              weight: 3,
              dashArray: "4 8",
              fillOpacity: 0.2,
            }).addTo(map);
            layerMap[loc] = rectangle;
          } else {
            const geojson = await fetchSuburbGeoData(loc);
            const layer = L.geoJSON(geojson).addTo(map);
            layerMap[loc] = layer;
          }
        }
      })
    ).then(() => {
      // After all layers are added, zoom to bounds
      const layers = Object.values(layerMap);
      if (layers.length > 0) {
        const combined = layers
          .map((layer) => layer.getBounds())
          .reduce((acc, bounds) => acc.extend(bounds));
        map.fitBounds(combined);
      }
    });
  }, [location, map]);

  return null;
}

export default GeoLayer;
