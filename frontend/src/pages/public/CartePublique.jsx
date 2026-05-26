import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CartePublique = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/public/zones')
      .then(res => res.json())
      .then(data => {
        setZones(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Chargement de la carte...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', textAlign: 'center', color: '#1e3a8a', marginBottom: '0.5rem' }}>🗺️ Carte des zones à risque</h1>
      <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>Visualisez les zones vulnérables aux inondations au Bénin</p>
      
      <div className="map-container">
        <MapContainer center={[6.37, 2.42]} zoom={8} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {zones.map((zone) => {
            let color = '#22c55e';
            if (zone.niveau_risque === 3) color = '#dc2626';
            else if (zone.niveau_risque === 2) color = '#f97316';
            let radius = 3000;
            if (zone.niveau_risque === 3) radius = 5000;
            else if (zone.niveau_risque === 2) radius = 4000;
            
            return zone.latitude && zone.longitude ? (
              <Circle key={zone.id} center={[zone.latitude, zone.longitude]} radius={radius} pathOptions={{ color, fillColor: color, fillOpacity: 0.4 }}>
                <Popup><strong>{zone.nom}</strong><br />{zone.commune} - {zone.departement}</Popup>
              </Circle>
            ) : null;
          })}
        </MapContainer>
      </div>
      
      <div className="legend">
        <div className="legend-item"><span className="legend-color red"></span> Risque élevé</div>
        <div className="legend-item"><span className="legend-color orange"></span> Risque modéré</div>
        <div className="legend-item"><span className="legend-color green"></span> Risque faible</div>
      </div>
    </div>
  );
};

export default CartePublique;