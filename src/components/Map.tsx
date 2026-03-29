import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GasStation } from '../types';
import { MapPin, Fuel } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  stations: GasStation[];
  userLocation: [number, number];
  onStationSelect?: (station: GasStation) => void;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export const MapView: React.FC<MapViewProps> = ({ stations, userLocation, onStationSelect }) => {
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={userLocation}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView center={userLocation} />

        {/* User Location Marker */}
        <Marker position={userLocation} icon={L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })}>
          <Popup>Vous êtes ici</Popup>
        </Marker>

        {/* Gas Station Markers */}
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            eventHandlers={{
              click: () => onStationSelect?.(station),
            }}
          >
            <Popup className="station-popup">
              <div className="p-1 min-w-[150px]">
                <h3 className="font-bold text-sm mb-1">{station.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{station.address}, {station.city}</p>
                <div className="space-y-1">
                  {station.fuels.map((f) => (
                    <div key={f.name} className="flex justify-between items-center text-xs border-t pt-1">
                      <span className="font-medium">{f.name}</span>
                      <span className="text-blue-600 font-bold">{f.price.toFixed(3)} €</span>
                    </div>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
