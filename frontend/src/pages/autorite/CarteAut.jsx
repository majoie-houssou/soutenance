import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
 
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});
 
const RISK_CONFIG = {
  3: { color: '#dc2626', label: 'Risque élevé',   radius: 5000, bg: '#fef2f2', border: '#fca5a5' },
  2: { color: '#f97316', label: 'Risque modéré',  radius: 4000, bg: '#fff7ed', border: '#fdba74' },
  1: { color: '#16a34a', label: 'Risque faible',  radius: 3000, bg: '#f0fdf4', border: '#86efac' },
};
 
const getRisk = (n) => RISK_CONFIG[n] ?? RISK_CONFIG[1];
 
const CartePublique = () => {
  const [zones, setZones]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all'); // 'all' | 1 | 2 | 3
  const [stats, setStats]     = useState({ total: 0, eleve: 0, modere: 0, faible: 0 });
 
  useEffect(() => {
    fetch('http://localhost:5000/api/public/zones')
      .then(r => r.json())
      .then(data => {
        setZones(data);
        setStats({
          total:  data.length,
          eleve:  data.filter(z => z.niveau_risque === 3).length,
          modere: data.filter(z => z.niveau_risque === 2).length,
          faible: data.filter(z => z.niveau_risque === 1).length,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
 
  const filtered = filter === 'all' ? zones : zones.filter(z => z.niveau_risque === Number(filter));
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Sora:wght@400;500&display=swap');
 
        .cp-page {
          font-family: 'Sora', sans-serif;
          background: #f8fafc;
          min-height: 100vh;
          color: #1e293b;
        }
 
        /* ── HEADER ── */
        .cp-header {
          background: linear-gradient(135deg, #0a1f44 0%, #0d2d6b 60%, #0f3460 100%);
          padding: 3.5rem 2rem 4.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;

         
  margin-top: -68px;
  padding-top: calc(6rem + 68px);
        }
        .cp-header::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 120%, rgba(6,182,212,.18) 0%, transparent 65%);
          pointer-events: none;
        }
        .cp-header-tag {
          display: inline-block;
          background: rgba(6,182,212,.15);
          border: 1px solid rgba(6,182,212,.3);
          color: #38bdf8;
          font-family: 'Outfit', sans-serif;
          font-size: .75rem; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          padding: .32rem .95rem; border-radius: 99px;
          margin-bottom: 1.2rem;
        }
        .cp-header h1 {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 900; color: #fff;
          margin-bottom: .7rem; line-height: 1.15;
        }
        .cp-header h1 span {
          background: linear-gradient(90deg, #38bdf8, #06b6d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cp-header p { color: rgba(255,255,255,.7); font-size: 1rem; }
        .cp-wave {
          position: absolute; bottom: -2px; left: 0;
          width: 100%; line-height: 0;
        }
 
        /* ── BODY ── */
        .cp-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 4rem;
        }
 
        /* ── STATS ── */
        .cp-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .cp-stat {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.2rem 1rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,.04);
          transition: transform .2s;
        }
        .cp-stat:hover { transform: translateY(-3px); }
        .cp-stat-num {
          font-family: 'Outfit', sans-serif;
          font-size: 1.9rem; font-weight: 900;
          line-height: 1; margin-bottom: .3rem;
        }
        .cp-stat-label { font-size: .8rem; color: #64748b; font-weight: 500; }
 
        /* ── TOOLBAR ── */
        .cp-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.2rem;
        }
        .cp-toolbar-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 700; font-size: 1rem; color: #0a1f44;
        }
        .cp-filters {
          display: flex; gap: .5rem; flex-wrap: wrap;
        }
        .cp-filter-btn {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .38rem .9rem;
          border-radius: 99px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: .82rem; font-weight: 600;
          color: #475569; cursor: pointer;
          transition: all .2s;
        }
        .cp-filter-btn:hover { border-color: #1a56db; color: #1a56db; }
        .cp-filter-btn.active {
          background: #0a1f44; border-color: #0a1f44; color: #fff;
        }
        .cp-filter-dot {
          width: 9px; height: 9px; border-radius: 50%;
        }
 
        /* ── MAP CARD ── */
        .cp-map-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,.07);
          position: relative;
        }
        .cp-map-wrap {
          height: 540px;
          width: 100%;
        }
 
        /* ── LÉGENDE ── */
        .cp-legend {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          padding: 1rem 1.5rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
        .cp-legend-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 700; font-size: .82rem;
          color: #64748b; text-transform: uppercase;
          letter-spacing: .07em; margin-right: .5rem;
        }
        .cp-legend-item {
          display: flex; align-items: center; gap: .5rem;
          font-size: .85rem; color: #475569; font-weight: 500;
        }
        .cp-legend-dot {
          width: 14px; height: 14px;
          border-radius: 50%; flex-shrink: 0;
          opacity: .9;
        }
 
        /* ── LOADING ── */
        .cp-loading {
          min-height: 60vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 1rem;
        }
        .cp-spinner {
          width: 48px; height: 48px;
          border: 4px solid #e2e8f0;
          border-top-color: #1a56db;
          border-radius: 50%;
          animation: cp-spin .9s linear infinite;
        }
        @keyframes cp-spin { to { transform: rotate(360deg); } }
        .cp-loading p {
          font-family: 'Outfit', sans-serif;
          font-weight: 600; color: #64748b; font-size: .95rem;
        }
 
        /* ── POPUP Leaflet ── */
        .cp-popup-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 800; font-size: .98rem;
          color: #0a1f44; margin-bottom: .3rem;
        }
        .cp-popup-loc { font-size: .82rem; color: #64748b; margin-bottom: .5rem; }
        .cp-popup-badge {
          display: inline-block;
          font-family: 'Outfit', sans-serif;
          font-size: .75rem; font-weight: 700;
          padding: .2rem .7rem; border-radius: 99px;
        }
 
        @media (max-width: 600px) {
          .cp-map-wrap { height: 380px; }
          .cp-legend { gap: .8rem; }
        }
      `}</style>
 
      <div className="cp-page">
 
        {/* ── HEADER ── */}
        <div className="cp-header">
          <div className="cp-header-tag">🗺️ Visualisation en temps réel</div>
          <h1>Carte des <span>zones à risque</span></h1>
          <p>Consultez les zones vulnérables aux inondations sur l'ensemble du territoire béninois</p>
          <div className="cp-wave">
            <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0,20 C360,50 1080,0 1440,25 L1440,50 L0,50 Z" fill="#f8fafc"/>
            </svg>
          </div>
        </div>
 
        {loading ? (
          <div className="cp-loading">
            <div className="cp-spinner" />
            <p>Chargement de la carte...</p>
          </div>
        ) : (
          <div className="cp-body">
 
            {/* ── STATS ── */}
            <div className="cp-stats">
              <div className="cp-stat">
                <div className="cp-stat-num" style={{ color: '#0a1f44' }}>{stats.total}</div>
                <div className="cp-stat-label">Zones recensées</div>
              </div>
              <div className="cp-stat">
                <div className="cp-stat-num" style={{ color: '#dc2626' }}>{stats.eleve}</div>
                <div className="cp-stat-label">Risque élevé</div>
              </div>
              <div className="cp-stat">
                <div className="cp-stat-num" style={{ color: '#f97316' }}>{stats.modere}</div>
                <div className="cp-stat-label">Risque modéré</div>
              </div>
              <div className="cp-stat">
                <div className="cp-stat-num" style={{ color: '#16a34a' }}>{stats.faible}</div>
                <div className="cp-stat-label">Risque faible</div>
              </div>
            </div>
 
            {/* ── TOOLBAR ── */}
            <div className="cp-toolbar">
              <span className="cp-toolbar-title">
                {filtered.length} zone{filtered.length !== 1 ? 's' : ''} affichée{filtered.length !== 1 ? 's' : ''}
              </span>
              <div className="cp-filters">
                <button
                  className={`cp-filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >Toutes</button>
                {[3, 2, 1].map(n => (
                  <button
                    key={n}
                    className={`cp-filter-btn ${filter === n ? 'active' : ''}`}
                    onClick={() => setFilter(n)}
                  >
                    <span className="cp-filter-dot" style={{ background: getRisk(n).color }} />
                    {getRisk(n).label}
                  </button>
                ))}
              </div>
            </div>
 
            {/* ── CARTE ── */}
            <div className="cp-map-card">
              <div className="cp-map-wrap">
                <MapContainer center={[6.37, 2.42]} zoom={8} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {filtered.map(zone =>
                    zone.latitude && zone.longitude ? (
                      <Circle
                        key={zone.id}
                        center={[zone.latitude, zone.longitude]}
                        radius={getRisk(zone.niveau_risque).radius}
                        pathOptions={{
                          color: getRisk(zone.niveau_risque).color,
                          fillColor: getRisk(zone.niveau_risque).color,
                          fillOpacity: 0.35,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div style={{ minWidth: '160px' }}>
                            <div className="cp-popup-title">{zone.nom}</div>
                            <div className="cp-popup-loc">📍 {zone.commune} · {zone.departement}</div>
                            <span
                              className="cp-popup-badge"
                              style={{
                                background: getRisk(zone.niveau_risque).bg,
                                color: getRisk(zone.niveau_risque).color,
                                border: `1px solid ${getRisk(zone.niveau_risque).border}`,
                              }}
                            >
                              {getRisk(zone.niveau_risque).label}
                            </span>
                          </div>
                        </Popup>
                      </Circle>
                    ) : null
                  )}
                </MapContainer>
              </div>
 
              {/* Légende */}
              <div className="cp-legend">
                <span className="cp-legend-title">Légende</span>
                {[3, 2, 1].map(n => (
                  <div className="cp-legend-item" key={n}>
                    <span className="cp-legend-dot" style={{ background: getRisk(n).color }} />
                    {getRisk(n).label}
                  </div>
                ))}
              </div>
            </div>
 
          </div>
        )}
      </div>
    </>
  );
};
 
export default CartePublique;