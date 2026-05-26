import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CarteCitoyen = () => {
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([6.37, 2.42]); // Cotonou par défaut

  useEffect(() => {
    // Charger les zones à risque
    fetch('http://localhost:5000/api/public/zones')
      .then(res => res.json())
      .then(data => {
        setZones(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement zones:', err);
        setLoading(false);
      });

    // Récupérer la position de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(userPos);
          setMapCenter(userPos);
        },
        (err) => console.log('Géolocalisation refusée')
      );
    }
  }, []);

  const getRiskColor = (niveau) => {
    if (niveau === 3) return '#dc2626'; // rouge
    if (niveau === 2) return '#f97316'; // orange
    return '#22c55e'; // vert
  };

  const getRiskRadius = (niveau) => {
    if (niveau === 3) return 5000;
    if (niveau === 2) return 3500;
    return 2000;
  };

  const getRiskLabel = (niveau) => {
    if (niveau === 3) return 'Élevé (Rouge)';
    if (niveau === 2) return 'Modéré (Orange)';
    return 'Faible (Vert)';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#64748b' }}>Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <button onClick={() => navigate(-1)} style={{ background: '#e2e8f0', border: 'none', color: '#1e3a8a', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', marginBottom: '1.5rem' }}>
          ← Retour
        </button>

        <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ background: '#1e3a8a', padding: '1rem 1.5rem', color: 'white' }}>
            <h1 style={{ fontSize: '1.3rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🗺️ Carte des zones à risque
            </h1>
            <p style={{ opacity: 0.9, margin: '0.25rem 0 0', fontSize: '0.8rem' }}>
              Visualisez les zones vulnérables aux inondations
            </p>
          </div>

          {/* Légende */}
          <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '16px', height: '16px', background: '#dc2626', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '0.8rem' }}>Risque élevé (Rouge)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '16px', height: '16px', background: '#f97316', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '0.8rem' }}>Risque modéré (Orange)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '16px', height: '16px', background: '#22c55e', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '0.8rem' }}>Risque faible (Vert)</span>
            </div>
            {userLocation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '16px', height: '16px', background: '#3b82f6', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 0 2px #3b82f6' }}></div>
                <span style={{ fontSize: '0.8rem' }}>📍 Votre position</span>
              </div>
            )}
          </div>

          {/* Carte */}
          <div style={{ height: '550px', width: '100%' }}>
            <MapContainer center={mapCenter} zoom={9} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              {/* Zones à risque */}
              {zones.map((zone) => {
                if (!zone.latitude || !zone.longitude) return null;
                const lat = parseFloat(zone.latitude);
                const lng = parseFloat(zone.longitude);
                if (isNaN(lat) || isNaN(lng)) return null;
                
                return (
                  <Circle
                    key={zone.id}
                    center={[lat, lng]}
                    radius={getRiskRadius(zone.niveau_risque)}
                    pathOptions={{
                      color: getRiskColor(zone.niveau_risque),
                      fillColor: getRiskColor(zone.niveau_risque),
                      fillOpacity: 0.4,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div style={{ minWidth: '200px' }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#1e3a8a' }}>{zone.nom}</h3>
                        <p style={{ margin: '4px 0' }}><strong>Commune:</strong> {zone.commune}</p>
                        <p style={{ margin: '4px 0' }}><strong>Département:</strong> {zone.departement}</p>
                        <p style={{ margin: '4px 0' }}>
                          <strong>Risque:</strong> 
                          <span style={{ color: getRiskColor(zone.niveau_risque), fontWeight: 'bold' }}>
                            {' '}{getRiskLabel(zone.niveau_risque)}
                          </span>
                        </p>
                        <p style={{ margin: '4px 0' }}>
                          <strong>Population exposée:</strong> {zone.population_exposee?.toLocaleString() || 'N/A'} habitants
                        </p>
                        {zone.niveau_risque === 3 && (
                          <p style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '8px' }}>
                            ⚠️ Évacuation recommandée en cas d'alerte
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Circle>
                );
              })}
              
              {/* Position de l'utilisateur */}
              {userLocation && (
                <Circle
                  center={userLocation}
                  radius={100}
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.8,
                    weight: 2
                  }}
                >
                  <Popup>📍 Vous êtes ici</Popup>
                </Circle>
              )}
            </MapContainer>
          </div>

          {/* Informations complémentaires */}
          <div style={{ padding: '1rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b' }}>
                  📍 {zones.length} zones à risque identifiées au Bénin
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b' }}>
                  🗺️ Données cartographiques © OpenStreetMap
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CarteCitoyen;