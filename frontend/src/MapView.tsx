import { MapContainer, TileLayer } from 'react-leaflet';

function MapView() {
  return (
    <MapContainer
      center={[-27.4698, 153.0251]} // Brisbane
      zoom={12}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}

export default MapView;
