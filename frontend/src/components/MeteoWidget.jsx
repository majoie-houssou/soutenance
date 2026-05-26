import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MeteoWidget = ({ ville = "Cotonou" }) => {
  const [meteo, setMeteo] = useState(null);
  const [previsions, setPrevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVille, setSelectedVille] = useState(ville);

  const villesBenin = [
    'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Grand-Popo',
    'Sèmè-Kraké', 'Lokossa', 'Bohicon', 'Natitingou', 'Kandi'
  ];

  // TA CLÉ API OPENWEATHERMAP
  const API_KEY = '8f66822058981c9fbc512abf1d61ed0a';

  useEffect(() => {
    fetchMeteo();
    fetchPrevisions();
  }, [selectedVille]);

  const fetchMeteo = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${selectedVille},BJ&units=metric&lang=fr&appid=${API_KEY}`
      );
      setMeteo(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur météo:', err);
      setError('Impossible de charger les données météo');
    }
  };

  const fetchPrevisions = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${selectedVille},BJ&units=metric&lang=fr&appid=${API_KEY}`
      );
      const dailyForecasts = response.data.list.filter((item, index) => index % 8 === 0).slice(0, 5);
      setPrevisions(dailyForecasts);
    } catch (err) {
      console.error('Erreur prévisions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (precipitation, description) => {
    const hasRain = description?.toLowerCase().includes('pluie') || description?.toLowerCase().includes('rain');
    if (precipitation > 10 || (hasRain && precipitation > 5)) return { level: 'élevé', color: '#dc2626', icon: '🔴' };
    if (precipitation > 5 || hasRain) return { level: 'modéré', color: '#f97316', icon: '🟠' };
    return { level: 'faible', color: '#22c55e', icon: '🟢' };
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', textAlign: 'center' }}>
        <div style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#fee2e2', borderRadius: '16px', padding: '1rem', textAlign: 'center', color: '#dc2626' }}>
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <div style={{ background: '#1e3a8a', padding: '0.75rem 1rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🌤️</span>
          <span style={{ fontWeight: 'bold' }}>Météo en temps réel</span>
        </div>
        <select
          value={selectedVille}
          onChange={(e) => setSelectedVille(e.target.value)}
          style={{ padding: '0.25rem 0.5rem', borderRadius: '8px', border: 'none', fontSize: '0.8rem' }}
        >
          {villesBenin.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {meteo && (
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{Math.round(meteo.main.temp)}°C</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{meteo.weather[0].description}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>💧 Humidité: {meteo.main.humidity}%</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>🌬️ Vent: {Math.round(meteo.wind.speed)} km/h</div>
            </div>
            <div>
              <img src={getWeatherIcon(meteo.weather[0].icon)} alt="icône météo" style={{ width: '80px' }} />
            </div>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Risque d'inondation actuel</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: getRiskLevel(0, meteo.weather[0].description).color }}>
              {getRiskLevel(0, meteo.weather[0].description).icon} {getRiskLevel(0, meteo.weather[0].description).level}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem' }}>📅 Prévisions 5 jours</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.5rem' }}>
              {previsions.map((prev, idx) => {
                const date = new Date(prev.dt_txt);
                const risk = getRiskLevel(prev.rain?.['3h'] || 0, prev.weather[0].description);
                return (
                  <div key={idx} style={{ textAlign: 'center', background: '#f8fafc', borderRadius: '8px', padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                    <img src={getWeatherIcon(prev.weather[0].icon)} alt="icône" style={{ width: '30px' }} />
                    <div style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{Math.round(prev.main.temp)}°C</div>
                    <div style={{ fontSize: '0.6rem', color: risk.color }}>{risk.icon}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.75rem', textAlign: 'center' }}>
            Données météo fournies par OpenWeatherMap
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MeteoWidget;