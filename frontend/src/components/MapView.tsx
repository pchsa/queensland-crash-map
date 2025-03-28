import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { useCrashStore } from '../store';
import { useEffect } from 'react';
import { fetchCrashes } from '../api';
import MarkerClusterGroup from 'react-leaflet-cluster';


function MapView() {
  const crashes = useCrashStore((s) => s.crashes);
  const setCrashes = useCrashStore((s) => s.setCrashes);

  useEffect(() => {
    fetchCrashes().then(setCrashes).catch(console.error);
  }, []);

  return (
<MapContainer
  center={[-27.4698, 153.0251]}
  zoom={12}
  style={{ height: '100vh', width: '100%' }}
>
  <TileLayer
    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    attribution='&copy; OpenStreetMap contributors'
  />

  <MarkerClusterGroup>
    {crashes.map((crash) => {
      const position: LatLngExpression = [crash.crash_latitude, crash.crash_longitude];
      return (
        <Marker key={crash.crash_ref_number} position={position}>
          <Popup>
            <div>
              <strong>{crash.crash_severity}</strong><br />
              {crash.crash_day_of_week}, {crash.crash_month} {crash.crash_year}<br />
              {crash.crash_hour}:00
            </div>
          </Popup>
        </Marker>
      );
    })}
  </MarkerClusterGroup>
</MapContainer>

  );
}
export default MapView;
