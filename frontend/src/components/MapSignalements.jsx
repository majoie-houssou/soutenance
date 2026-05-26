import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapSignalements = ({ signalements, zones, onClose }) => {
  const mapCenter = [6.37, 2.42];

  const getMarkerColor = (niveau) => {
    switch(niveau) {
      case 'critique': return '#dc2626';
      case 'maisons_touchees': return '#f97316';
      default: return '#eab308';
    }
  };

  const getMarkerIcon = (niveau) => {
    const color = getMarkerColor(niveau);
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
      iconSize: [14, 14],
      className: 'custom-marker'
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '24px', width: '90%', maxWidth: '1200px', height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: '#1e3a8a', color: 'white' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>🗺️ Carte des signalements</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
        <div style={{ flex: 1, padding: '1rem', position: 'relative' }}>
          <MapContainer center={mapCenter} zoom={9} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Zones à risque */}
            {zones?.map((zone) => {
              if (!zone.latitude || !zone.longitude) return null;
              const lat = parseFloat(zone.latitude);
              const lng = parseFloat(zone.longitude);
              if (isNaN(lat) || isNaN(lng)) return null;
              const color = zone.niveau_risque === 3 ? '#dc2626' : zone.niveau_risque === 2 ? '#f97316' : '#22c55e';
              return (
                <Circle
                  key={`zone-${zone.id}`}
                  center={[lat, lng]}
                  radius={zone.niveau_risque === 3 ? 5000 : 3000}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.2, weight: 1 }}
                >
                  <Popup>📍 {zone.nom}<br />Risque: {zone.niveau_risque === 3 ? 'Élevé' : zone.niveau_risque === 2 ? 'Modéré' : 'Faible'}</Popup>
                </Circle>
              );
            })}
            
            {/* Signalements */}
            {signalements?.map((s) => {
              if (!s.latitude || !s.longitude) return null;
              const lat = parseFloat(s.latitude);
              const lng = parseFloat(s.longitude);
              if (isNaN(lat) || isNaN(lng)) return null;
              return (
                <Marker
                  key={s.id}
                  position={[lat, lng]}
                  icon={getMarkerIcon(s.niveau_eau)}
                >
                  <Popup>
                    <div style={{ minWidth: '180px' }}>
                      <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>🚨 Signalement</p>
                      <p style={{ margin: '2px 0' }}><strong>📍</strong> {lat.toFixed(4)}, {lng.toFixed(4)}</p>
                      <p style={{ margin: '2px 0' }}><strong>💧</strong> {s.niveau_eau === 'critique' ? 'Critique' : s.niveau_eau === 'maisons_touchees' ? 'Maisons touchées' : 'Chaussée inondée'}</p>
                      <p style={{ margin: '2px 0' }}><strong>📅</strong> {new Date(s.date_creation).toLocaleString()}</p>
                      <p style={{ margin: '2px 0' }}><strong>⏱️</strong> {s.statut === 'en_attente' ? 'En attente' : 'Confirmé'}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
        <div style={{ padding: '0.75rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#64748b', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <span><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#dc2626', borderRadius: '50%', marginRight: '4px' }}></span> Critique</span>
          <span><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#f97316', borderRadius: '50%', marginRight: '4px' }}></span> Maisons touchées</span>
          <span><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#eab308', borderRadius: '50%', marginRight: '4px' }}></span> Chaussée inondée</span>
          <span><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', marginRight: '4px' }}></span> Zones à risque</span>
        </div>
      </div>
    </div>
  );
};

export default MapSignalements;