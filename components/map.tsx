import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useCallback } from 'react';

const defaultContainerStyle = {
  width: '100%',
  // height will be a prop, e.g., '400px'
};

const defaultCenter = {
  lat: 39.9526,  // Filadelfia, PA
  lng: -75.1652,
};

interface MapComponentProps {
  position: { lat: number; lng: number } | null; // Current position of the marker, or null if none
  onPositionChange: (newPosition: { lat: number; lng: number }) => void; // Callback when position changes
  mapHeight?: string; // e.g., '300px', defaults to '400px'
  initialZoom?: number; // Zoom level when there's a marker
  defaultZoom?: number; // Zoom level when there's no marker
}

const MapComponent = ({
  position,
  onPositionChange,
  mapHeight = '400px',
  initialZoom = 15,
  defaultZoom = 10,
}: MapComponentProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const newPos = { lat: event.latLng.lat(), lng: event.latLng.lng() };
        onPositionChange(newPos);
      }
    },
    [onPositionChange]
  );

  const handleMarkerDragEnd = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const newPos = { lat: event.latLng.lat(), lng: event.latLng.lng() };
        onPositionChange(newPos);
      }
    },
    [onPositionChange]
  );

  if (loadError) {
    console.error("Error loading Google Maps:", loadError);
    return <div style={{ padding: '20px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px', background: '#f9f9f9' }}>Error: No se pudo cargar Google Maps. Verifica tu clave API.</div>;
  }

  if (!isLoaded) {
    return <div style={{ padding: '20px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px', background: '#f9f9f9' }}>Cargando mapa...</div>;
  }

  const currentCenter = position || defaultCenter;
  const currentZoom = position ? initialZoom : defaultZoom;
  const containerStyle = { ...defaultContainerStyle, height: mapHeight };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentCenter}
      zoom={currentZoom}
      onClick={handleMapClick}
    >
      {position && (
        <Marker
          position={position}
          draggable={true}
          onDragEnd={handleMarkerDragEnd}
        />
      )}
    </GoogleMap>
  );
};

export default MapComponent;
