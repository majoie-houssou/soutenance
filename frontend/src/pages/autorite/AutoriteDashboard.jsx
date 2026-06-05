import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/authService';
import MeteoWidget from '../../components/MeteoWidget';
import MapSignalements from '../../components/MapSignalements';

const menuItems = [
  { path: '/autorite/signalements', icon: '📋', title: 'Signalements',  desc: 'Tous les signalements', accent: '#1a56db', bg: '#eff6ff' },
  { path: '/autorite/alertes',      icon: '📱', title: 'Alertes EMAIL', desc: 'Envoi de masse',        accent: '#dc2626', bg: '#fef2f2' },
  { path: '/autorite/sinistres',    icon: '👨‍👩‍👧‍👦', title: 'Sinistrés',    desc: 'Suivi des familles',  accent: '#16a34a', bg: '#f0fdf4' },
  { path: '/autorite/rapports',     icon: '📄', title: 'Rapports PDF',  desc: 'Génération',            accent: '#f59e0b', bg: '#fffbeb' },
  { action: 'map',                  icon: '🗺️', title: 'Carte',         desc: 'Voir sur la carte',     accent: '#7c3aed', bg: '#f5f3ff' },
];

const AutoriteDashboard = () => {
  const navigate = useNavigate();
  const user     = getCurrentUser();
  const [stats, setStats]                 = useState({ total: 0, enAttente: 0, confirmes: 0, critiques: 0 });
  const [recentSignals, setRecentSignals] = useState([]);
  const [signalements, setSignalements]   = useState([]);
  const [zones, setZones]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showMap, setShowMap]             = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [signalsRes, zonesRes] = await Promise.all([
          fetch('http://localhost:5000/api/signalements', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/public/zones'),
        ]);
        const signals   = await signalsRes.json();
        const zonesData = await zonesRes.json();
        setSignalements(signals);
        setZones(zonesData);
        setStats({
          total:     signals.length,
          enAttente: signals.filter(s => s.statut === 'en_attente').length,
          confirmes: signals.filter(s => s.statut === 'confirme').length,
          critiques: signals.filter(s => s.niveau_eau === 'critique').length,
        });
        setRecentSignals(signals.slice(0, 10));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleMenuClick = (item) => {
    if (item.path) navigate(item.path);
    else if (item.action === 'map') setShowMap(true);
  };

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  const niveauLabel = (n) => {
    if (n === 'critique') return { label: 'Critique', color: '#dc2626', bg: '#fef2f2' };
    if (n === 'eleve')    return { label: 'Élevé',    color: '#f97316', bg: '#fff7ed' };
    return                       { label: 'Modéré',   color: '#16a34a', bg: '#f0fdf4' };
  };
  const statutLabel = (s) => {
    if (s === 'en_attente') return { label: 'En attente', color: '#f59e0b', bg: '#fffbeb' };
    if (s === 'confirme')   return { label: 'Confirmé',   color: '#16a34a', bg: '#f0fdf4' };
    return                         { label: s,             color: '#64748b', bg: '#f1f5f9' };
  };

  if (loading) return (
    <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem', fontFamily:'Sora,sans-serif' }}>
      <div style={{ width:48, height:48, border:'4px solid #e2e8f0', borderTopColor:'#1a56db', borderRadius:'50%', animation:'spin .9s linear infinite' }} />
      <p style={{ color:'#64748b', fontWeight:600 }}>Chargement du tableau de bord...</p>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Sora:wght@400;500&display=swap');

        .ad-page { font-family:'Sora',sans-serif; min-height:100vh; background:#f1f5f9; color:#1e293b; }

        /* ── BANNER ── */
        .ad-banner {
          background: linear-gradient(135deg,#0a1f44 0%,#1a56db 100%);
          padding: 2.5rem 2rem 4.5rem;
          position:relative; overflow:hidden;
        }
        .ad-banner::before {
          content:''; position:absolute; inset:0;
          background: radial-gradient(ellipse 60% 80% at 90% 50%, rgba(56,189,248,.15) 0%, transparent 60%);
          pointer-events:none;
        }
        .ad-banner-inner {
          max-width:1400px; margin:0 auto;
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:1.5rem; position:relative;
        }
        .ad-banner-left { display:flex; align-items:center; gap:1rem; }
        .ad-avatar {
          width:56px; height:56px; border-radius:50%;
          background:linear-gradient(135deg,#38bdf8,#06b6d4);
          display:flex; align-items:center; justify-content:center;
          font-size:1.6rem; color:#fff;
          box-shadow:0 4px 16px rgba(6,182,212,.4);
          border:3px solid rgba(255,255,255,.25); flex-shrink:0;
        }
        .ad-banner-title h2 {
          font-family:'Outfit',sans-serif;
          font-size:clamp(1.3rem,3vw,1.8rem); font-weight:900;
          color:#fff; margin-bottom:.3rem;
        }
        .ad-banner-title p { color:rgba(255,255,255,.7); font-size:.9rem; }
        .ad-banner-title p strong { color:#38bdf8; }
        .ad-btn-logout {
          display:inline-flex; align-items:center; gap:.4rem;
          background:rgba(239,68,68,.15); border:1.5px solid rgba(239,68,68,.3);
          color:#fca5a5; font-family:'Outfit',sans-serif;
          font-weight:600; font-size:.85rem;
          padding:.5rem 1.1rem; border-radius:99px; cursor:pointer;
          transition:background .2s, transform .2s;
        }
        .ad-btn-logout:hover { background:rgba(239,68,68,.25); transform:translateY(-1px); }
        .ad-wave { position:absolute; bottom:-2px; left:0; width:100%; line-height:0; pointer-events:none; }

        /* ── BODY ── */
        .ad-body {
          max-width:1400px; margin:-2rem auto 0;
          padding:0 1.5rem 4rem; position:relative; z-index:2;
        }
        .ad-label {
          font-family:'Outfit',sans-serif; font-weight:700; font-size:.75rem;
          letter-spacing:.1em; text-transform:uppercase;
          color:#94a3b8; margin-bottom:.9rem; margin-top:2rem;
        }

        /* ── LIGNE 1 : STATS ── */
        .ad-stats {
          display:grid; grid-template-columns:repeat(4,1fr);
          gap:1rem; margin-bottom:0;
        }
        .ad-stat {
          background:#fff; border:1px solid #e2e8f0;
          border-radius:14px; padding:1.4rem 1rem;
          text-align:center; box-shadow:0 2px 8px rgba(0,0,0,.04);
          transition:transform .2s;
        }
        .ad-stat:hover { transform:translateY(-3px); }
        .ad-stat-icon { font-size:1.6rem; margin-bottom:.4rem; display:block; }
        .ad-stat-num { font-family:'Outfit',sans-serif; font-size:2.2rem; font-weight:900; line-height:1; margin-bottom:.3rem; }
        .ad-stat-label { font-size:.78rem; color:#64748b; font-weight:500; }

        /* ── LIGNE 2 : MENU 5 ACTIONS ── */
        .ad-menu-grid {
          display:grid; grid-template-columns:repeat(5,1fr);
          gap:1.2rem;
        }
        .ad-menu-card {
          background:#fff; border:1px solid #e2e8f0;
          border-radius:18px; padding:2rem 1.2rem;
          cursor:pointer; position:relative; overflow:hidden;
          text-align:center;
          transition:transform .25s, box-shadow .25s, border-color .25s;
        }
        .ad-menu-card::after {
          content:''; position:absolute;
          bottom:0; left:0; right:0; height:3px;
          transform:scaleX(0); transform-origin:left;
          transition:transform .3s;
        }
        .ad-menu-card:hover { transform:translateY(-6px); box-shadow:0 14px 36px rgba(0,0,0,.1); border-color:transparent; }
        .ad-menu-card:hover::after { transform:scaleX(1); }
        .ad-menu-icon {
          width:54px; height:54px; border-radius:14px;
          display:flex; align-items:center; justify-content:center;
          font-size:1.6rem; margin:0 auto 1rem;
        }
        .ad-menu-card h3 { font-family:'Outfit',sans-serif; font-weight:800; font-size:1rem; color:#0a1f44; margin-bottom:.3rem; }
        .ad-menu-card p  { font-size:.8rem; color:#64748b; }
        .ad-menu-arrow {
          position:absolute; top:1.2rem; right:1.2rem;
          font-size:.85rem; color:#cbd5e1;
          transition:color .2s, transform .2s;
        }
        .ad-menu-card:hover .ad-menu-arrow { color:#94a3b8; transform:translateX(3px); }

        /* ── LIGNE 3 : SIGNALEMENTS + MÉTÉO ── */
        .ad-bottom {
          display:grid; grid-template-columns:1fr 420px;
          gap:1.2rem; align-items:start;
        }

        /* Signalements */
        .ad-signals {
          background:#fff; border:1px solid #e2e8f0;
          border-radius:16px; overflow:hidden;
          box-shadow:0 2px 8px rgba(0,0,0,.04);
        }
        .ad-signals-header {
          background:linear-gradient(135deg,#0a1f44,#1a56db);
          padding:1rem 1.5rem;
          display:flex; align-items:center; justify-content:space-between;
        }
        .ad-signals-header h3 { font-family:'Outfit',sans-serif; font-weight:800; font-size:1rem; color:#fff; margin:0; }
        .ad-signals-count { background:rgba(255,255,255,.15); color:#fff; font-size:.78rem; font-weight:700; padding:.2rem .7rem; border-radius:99px; }
        .ad-signals-body { padding:1rem; }
        .ad-signals-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:.75rem; }

        .ad-signal-row {
          display:flex; align-items:flex-start; gap:.8rem;
          background:#f8fafc; border:1px solid #e2e8f0;
          border-radius:12px; padding:.9rem 1rem;
          transition:transform .2s;
        }
        .ad-signal-row:hover { transform:translateX(3px); }
        .ad-signal-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:.3rem; }
        .ad-signal-loc { font-family:'Outfit',sans-serif; font-weight:700; font-size:.85rem; color:#0a1f44; margin-bottom:.2rem; }
        .ad-signal-desc { font-size:.78rem; color:#64748b; line-height:1.4; }
        .ad-signal-badges { display:flex; gap:.4rem; flex-wrap:wrap; margin-top:.4rem; }
        .ad-badge { font-size:.7rem; font-weight:700; font-family:'Outfit',sans-serif; padding:.18rem .55rem; border-radius:99px; }
        .ad-empty { text-align:center; padding:2.5rem; color:#94a3b8; font-size:.9rem; }

        /* Météo */
        .ad-meteo-wrap {
          background:#fff; border:1px solid #e2e8f0;
          border-radius:16px; overflow:hidden;
          box-shadow:0 2px 8px rgba(0,0,0,.04);
        }
        .ad-meteo-header {
          background:linear-gradient(135deg,#0a1f44,#1a56db);
          padding:.85rem 1.2rem;
          display:flex; align-items:center; gap:.5rem;
        }
        .ad-meteo-header span { font-family:'Outfit',sans-serif; font-weight:700; font-size:.9rem; color:#fff; }
        .ad-meteo-body { padding:1rem; }

        @media (max-width:1100px) {
          .ad-bottom { grid-template-columns:1fr; }
          .ad-stats   { grid-template-columns:repeat(2,1fr); }
          .ad-menu-grid { grid-template-columns:repeat(3,1fr); }
        }
        @media (max-width:600px) {
          .ad-menu-grid { grid-template-columns:repeat(2,1fr); }
          .ad-stats      { grid-template-columns:repeat(2,1fr); }
          .ad-signals-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="ad-page">

        {/* ── BANNER ── */}
        <div className="ad-banner">
          <div className="ad-banner-inner">
            <div className="ad-banner-left">
              <div className="ad-avatar">🏛️</div>
              <div className="ad-banner-title">
                <h2>{greeting}, <span style={{ color:'#38bdf8' }}>{user?.nom || 'Autorité'}</span> 👋</h2>
                <p>Tableau de bord · <strong>Espace Autorité</strong></p>
              </div>
            </div>
            <button className="ad-btn-logout" onClick={() => { logout(); window.location.href='/'; }}>
              🚪 Déconnexion
            </button>
          </div>
          <div className="ad-wave">
            <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0,20 C480,50 960,0 1440,25 L1440,50 L0,50 Z" fill="#f1f5f9"/>
            </svg>
          </div>
        </div>

        <div className="ad-body">

          {/* ── LIGNE 1 : STATS ── */}
          <div className="ad-label">Vue d'ensemble</div>
          <div className="ad-stats">
            {[
              { icon:'📊', num:stats.total,     color:'#0a1f44', border:'#1a56db', label:'Total signalements' },
              { icon:'⏳', num:stats.enAttente, color:'#f97316', border:'#f97316', label:'En attente'          },
              { icon:'✅', num:stats.confirmes, color:'#16a34a', border:'#16a34a', label:'Confirmés'           },
              { icon:'🚨', num:stats.critiques, color:'#dc2626', border:'#dc2626', label:'Critiques'           },
            ].map((s,i) => (
              <div className="ad-stat" key={i} style={{ borderTop:`4px solid ${s.border}` }}>
                <span className="ad-stat-icon">{s.icon}</span>
                <div className="ad-stat-num" style={{ color:s.color }}>{s.num}</div>
                <div className="ad-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── LIGNE 2 : MENU ── */}
          <div className="ad-label">Actions rapides</div>
          <div className="ad-menu-grid">
            {menuItems.map((item,i) => (
              <div key={i} className="ad-menu-card" onClick={() => handleMenuClick(item)}>
                <style>{`.ad-menu-grid .ad-menu-card:nth-child(${i+1})::after { background:${item.accent}; }`}</style>
                <div className="ad-menu-icon" style={{ background:item.bg }}>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <span className="ad-menu-arrow">→</span>
              </div>
            ))}
          </div>

          {/* ── LIGNE 3 : SIGNALEMENTS + MÉTÉO ── */}
          <div className="ad-label">Surveillance temps réel</div>
          <div className="ad-bottom">

            <div className="ad-signals">
              <div className="ad-signals-header">
                <h3>📋 Derniers signalements</h3>
                <span className="ad-signals-count">{recentSignals.length} reçus</span>
              </div>
              <div className="ad-signals-body">
                {recentSignals.length === 0 ? (
                  <div className="ad-empty">Aucun signalement pour le moment.</div>
                ) : (
                  <div className="ad-signals-grid">
                    {recentSignals.map(s => {
                      const niv  = niveauLabel(s.niveau_eau);
                      const stat = statutLabel(s.statut);
                      return (
                        <div className="ad-signal-row" key={s.id}>
                          <span className="ad-signal-dot" style={{ background:niv.color }} />
                          <div style={{ flex:1 }}>
                            <div className="ad-signal-loc">
                              📍 {s.commune || `${parseFloat(s.latitude || 0).toFixed(3)}, ${parseFloat(s.longitude || 0).toFixed(3)}`}
                            </div>
                            <div className="ad-signal-desc">{s.description || 'Aucune description'}</div>
                            <div className="ad-signal-badges">
                              <span className="ad-badge" style={{ background:niv.bg,  color:niv.color  }}>{niv.label}</span>
                              <span className="ad-badge" style={{ background:stat.bg, color:stat.color }}>{stat.label}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="ad-meteo-wrap">
              <div className="ad-meteo-header"><span>🌤️ Météo · Cotonou</span></div>
              <div className="ad-meteo-body"><MeteoWidget ville="Cotonou" /></div>
            </div>

          </div>
        </div>
      </div>

      {showMap && (
        <MapSignalements signalements={signalements} zones={zones} onClose={() => setShowMap(false)} />
      )}
    </>
  );
};

export default AutoriteDashboard;