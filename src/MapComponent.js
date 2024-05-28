import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue in Leaflet 1.7.x
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = ({ onLocationSelect, position, disabled }) => {
  const [currentPosition, setCurrentPosition] = useState(position);
  const [initialLocationSet, setInitialLocationSet] = useState(false);
  const [address, setAddress] = useState('');
  const markerRef = useRef(null);

  const MapEvent = () => {
    useMapEvent('click', (e) => {
      if (!disabled) {
        const { lat, lng } = e.latlng;
        setCurrentPosition([lat, lng]);
        onLocationSelect([lat, lng]);
        getAddress(lat, lng);
      }
    });
    return null;
  };

  const FlyToLocation = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.setView(center, map.getZoom());
      }
    }, [center, map]);
    return null;
  };

  useEffect(() => {
    if (!initialLocationSet) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition([latitude, longitude]);
        onLocationSelect([latitude, longitude]);
        getAddress(latitude, longitude);
        setInitialLocationSet(true);
      }, (error) => {
        console.error("Error Code = " + error.code + " - " + error.message);
      });
    }
  }, [initialLocationSet, onLocationSelect]);

  useEffect(() => {
    if (position) {
      setCurrentPosition(position);
      getAddress(position[0], position[1]);
    }
  }, [position]);

  const getAddress = async (lat, lng) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      if (response.data && response.data.display_name) {
        setAddress(response.data.display_name);
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      } else {
        setAddress('Address not found');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress('Address not found');
    }
  };

  return (
    <MapContainer 
      center={currentPosition || [32.109333, 34.855499]} 
      zoom={13} 
      doubleClickZoom={false} 
      dragging={!disabled}
      zoomControl={!disabled}
      scrollWheelZoom={!disabled}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {currentPosition && (
        <Marker position={currentPosition} ref={markerRef}>
          <Popup>{address}</Popup>
        </Marker>
      )}
      <MapEvent />
      <FlyToLocation center={currentPosition} />
    </MapContainer>
  );
};

export default MapComponent;
