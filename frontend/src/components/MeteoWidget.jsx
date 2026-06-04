import React, { useState, useEffect } from 'react';
import axios from 'axios';

const villesBenin = [
  'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Grand-Popo',
  'Sèmè-Kraké', 'Lokossa', 'Bohicon', 'Natitingou', 'Kandi',
];

const API_KEY = '8f66822058981c9fbc512abf1d61ed0a';

const getRiskLevel = (precipitation, description) => {
  const hasRain = description?.toLowerCase().includes('pluie') || description?.toLowerCase().includes('rain');
  if (precipitation > 10 || (hasRain && precipitation > 5)) return { level: 'Élevé',  color: '#dc2626', bg: '#fef2f2', icon: '🔴' };
  if (precipitation > 5  || hasRain)                        return { level: 'Modéré', color: '#f97316', bg: '#fff7ed', icon: '🟠' };
  return                                                            { level: 'Faible',  color: '#16a34a', bg: '#f0fdf4', icon: '🟢' };
};

const getIcon = (code) => `https://openweathermap.org/img/wn/${code}@2x.png`;

const MeteoWidget = ({ ville = 'Cotonou' }) => {
  const [meteo, setMeteo]           = useState(null);
  const [previsions, setPrevisions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [selectedVille, setSelectedVille] = useState(ville);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${selectedVille},BJ&units=metric&lang=fr&appid=${API_KEY}`),
      axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${selectedVille},BJ&units=metric&lang=fr&appid=${API_KEY}`),
    ])
      .then(([weatherRes, forecastRes]) => {
        setMeteo(weatherRes.data);
        setPrevisions(forecastRes.data.list.filter((_, i) => i % 8 === 0).slice(0, 5));
        setError(null);
      })
      .catch(() => setError('Impossible de charger les données météo'))
      .finally(() => setLoading(false));
  }, [selectedVille]);

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#1a56db', borderRadius: '50%', animation: 'mw-spin 1s linear infinite', margin: '0 auto' }} />
      <style>{`@keyframes mw-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: '1rem', textAlign: 'center', color: '#dc2626', fontSize: '.85rem' }}>⚠️ {error}</div>
  );

  const risk = getRiskLevel(0, meteo.weather[0].description);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&display=swap');
        @keyframes mw-spin { to { transform: rotate(360deg); } }

        .mw-root { font-family: 'Outfit', sans-serif; color: #1e293b; }

        /* ── Sélecteur ville ── */
        .mw-select {
          width: 100%;
          padding: .45rem .8rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 99px;
          font-family: 'Outfit', sans-serif;
          font-size: .82rem; font-weight: 600;
          color: #1e293b; background: #f8fafc;
          outline: none; cursor: pointer;
          margin-bottom: .9rem;
          transition: border-color .2s;
        }
        .mw-select:focus { border-color: #1a56db; }

        /* ── Ligne principale temp + icône ── */
        .mw-main {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: .8rem;
        }
        .mw-temp {
          font-size: 2.4rem; font-weight: 900;
          line-height: 1; color: #0a1f44;
        }
        .mw-desc { font-size: .82rem; color: #64748b; margin-top: .2rem; text-transform: capitalize; }
        .mw-icon { width: 64px; flex-shrink: 0; }

        /* ── Infos compactes ── */
        .mw-infos {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: .4rem; margin-bottom: .9rem;
        }
        .mw-info-item {
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 8px; padding: .45rem .7rem;
          font-size: .78rem; color: #475569; font-weight: 500;
        }
        .mw-info-item span { font-weight: 700; color: #0a1f44; }

        /* ── Risque inondation ── */
        .mw-risk {
          display: flex; align-items: center; justify-content: space-between;
          border-radius: 10px; padding: .55rem .9rem;
          margin-bottom: .9rem;
        }
        .mw-risk-label { font-size: .75rem; color: #64748b; }
        .mw-risk-val { font-weight: 800; font-size: .95rem; }

        /* ── Prévisions ── */
        .mw-previsions-title {
          font-size: .72rem; color: #94a3b8;
          text-transform: uppercase; letter-spacing: .07em;
          margin-bottom: .5rem; font-weight: 700;
        }
        .mw-prev-grid {
          display: grid; grid-template-columns: repeat(5, 1fr); gap: .4rem;
        }
        .mw-prev-card {
          text-align: center;
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 8px; padding: .4rem .2rem;
        }
        .mw-prev-day { font-size: .65rem; color: #94a3b8; font-weight: 600; text-transform: capitalize; margin-bottom: .1rem; }
        .mw-prev-icon { width: 28px; }
        .mw-prev-temp { font-size: .75rem; font-weight: 800; color: #0a1f44; }
        .mw-prev-risk { font-size: .65rem; margin-top: .1rem; }

        /* ── Footer ── */
        .mw-footer { font-size: .6rem; color: #cbd5e1; text-align: center; margin-top: .8rem; }
      `}</style>

      <div className="mw-root">

        {/* Sélecteur ville */}
        <select className="mw-select" value={selectedVille} onChange={e => setSelectedVille(e.target.value)}>
          {villesBenin.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        {/* Température + icône */}
        <div className="mw-main">
          <div>
            <div className="mw-temp">{Math.round(meteo.main.temp)}°C</div>
            <div className="mw-desc">{meteo.weather[0].description}</div>
          </div>
          <img className="mw-icon" src={getIcon(meteo.weather[0].icon)} alt="météo" />
        </div>

        {/* Humidité + Vent */}
        <div className="mw-infos">
          <div className="mw-info-item">💧 Humidité <span>{meteo.main.humidity}%</span></div>
          <div className="mw-info-item">🌬️ Vent <span>{Math.round(meteo.wind.speed)} km/h</span></div>
          <div className="mw-info-item">🌡️ Ressenti <span>{Math.round(meteo.main.feels_like)}°C</span></div>
          <div className="mw-info-item">☁️ Nuages <span>{meteo.clouds.all}%</span></div>
        </div>

        {/* Risque inondation */}
        <div className="mw-risk" style={{ background: risk.bg }}>
          <div>
            <div className="mw-risk-label">Risque d'inondation</div>
            <div className="mw-risk-val" style={{ color: risk.color }}>{risk.icon} {risk.level}</div>
          </div>
          <div style={{ fontSize: '1.8rem' }}>
            {risk.level === 'Élevé' ? '⛈️' : risk.level === 'Modéré' ? '🌧️' : '☀️'}
          </div>
        </div>

        {/* Prévisions 5 jours */}
        <div className="mw-previsions-title">📅 Prévisions 5 jours</div>
        <div className="mw-prev-grid">
          {previsions.map((prev, idx) => {
            const date = new Date(prev.dt_txt);
            const r    = getRiskLevel(prev.rain?.['3h'] || 0, prev.weather[0].description);
            return (
              <div className="mw-prev-card" key={idx}>
                <div className="mw-prev-day">{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                <img className="mw-prev-icon" src={getIcon(prev.weather[0].icon)} alt="" />
                <div className="mw-prev-temp">{Math.round(prev.main.temp)}°C</div>
                <div className="mw-prev-risk">{r.icon}</div>
              </div>
            );
          })}
        </div>

        <div className="mw-footer">Données fournies par OpenWeatherMap</div>
      </div>
    </>
  );
};

export default MeteoWidget;