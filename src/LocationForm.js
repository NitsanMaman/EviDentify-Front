import React, { useState, useEffect } from 'react';
import MapComponent from './MapComponent';
import './LocationForm.css';

const LocationForm = ({ location, disabled, onLocationSelect, onLocationDescChange  }) => {
  const [locationDesc, setLocationDesc] = useState(location ? location.description : '');
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(location ? location.coordinates : null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (location && location.coordinates) {
      setSelectedLocation(location.coordinates);
    }
    if (location && location.description) {
      setLocationDesc(location.description);
    }
  }, [location]);  

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  const handleLocationDescChange = (e) => {
    const desc = e.target.value;
    setLocationDesc(desc);
    onLocationDescChange(desc); // Update the parent component
  };

  const handleAddressChange = async (e) => {
    const value = e.target.value;
    setAddress(value);
    
    if (value.length > 2) {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`);
      const data = await response.json();
      setSuggestions(data);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (lat, lon) => {
    const location = [parseFloat(lat), parseFloat(lon)];
    setSelectedLocation(location);
    onLocationSelect(location);
    setAddress('');
    setSuggestions([]);
  };

  return (
    <div className="location-form">
      <div className="location-input-container">
        <label htmlFor="locationDesc">Location Description:</label>
        <textarea
          id="locationDesc"
          type="text"
          value={locationDesc}
          onChange={handleLocationDescChange}
          placeholder="Describe the location"
          disabled={disabled}
        />
      </div>
      <div className="address-input-container">
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="Enter address"
          hidden={disabled}
        />
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map(suggestion => (
              <li key={suggestion.place_id} onClick={() => handleSuggestionClick(suggestion.lat, suggestion.lon)}>
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <MapComponent onLocationSelect={handleLocationSelect} position={selectedLocation} disabled={disabled} />
    </div>
  );
};

export default LocationForm;
