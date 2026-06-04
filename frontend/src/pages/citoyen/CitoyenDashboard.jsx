import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/authService';
 
const menuItems = [
  {
    path: '/citoyen/signaler',
    icon: '🚨',
    title: 'Signaler',
    desc: 'Signalez une montée des eaux',
    accent: '#1a56db',
    bg: '#fef2f2',
  },
  {
    path: '/citoyen/mes-signalements',
    icon: '📋',
    title: 'Mes signalements',
    desc: 'Suivez vos alertes envoyées',
    accent: '#1a56db',
    bg: '#eff6ff',
  },
  {
    path: '/citoyen/alertes-reelles',
    icon: '⚡',
    title: 'Alertes en temps réel',
    desc: "Niveau d'alerte actuel",
    accent: '#1a56db',
    bg: '#fffbeb',
  },
  {
    path: '/citoyen/alertes',
    icon: '🔍',
    title: 'Alertes par localité',
    desc: 'Alertes de votre commune',
    accent: '#1a56db',
    bg: '#f5f3ff',
  },
  {
    path: '/citoyen/historique',
    icon: '📜',
    title: 'Historique',
    desc: 'Inondations passées',
    accent: '#1a56db',
    bg: '#ecfeff',
  },
  {
    path: '/citoyen/carte',
    icon: '🗺️',
    title: 'Carte des risques',
    desc: 'Zones vulnérables',
    accent: '#1a56db',
    bg: '#f0fdf4',
  },
];
 
const communesBenin = [
  'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Grand-Popo',
  'Sèmè-Kraké', 'Lokossa', 'Bohicon', 'Natitingou', 'Kandi',
];
 
const CitoyenDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [email, setEmail]       = useState('');
  const [telephone, setTelephone] = useState('');
  const [commune, setCommune]   = useState(user?.commune || 'Cotonou');
  const [subscribed, setSubscribed] = useState(false);
  const [loadingSubscribe, setLoadingSubscribe] = useState(false);
 
  useEffect(() => { checkSubscription(); }, []);
 
  const checkSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const res  = await fetch('http://localhost:5000/api/citoyen/verifier-abonnement-email', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubscribed(data.abonne);
      if (data.abonne && data.abonneData?.email) {
        setEmail(data.abonneData.email);
        setCommune(data.abonneData.commune || user?.commune || 'Cotonou');
      }
    } catch (e) { console.error(e); }
  };
 
  const handleSubscribe   = async () => { /* inchangé */ };
  const handleUnsubscribe = async () => { /* inchangé */ };
 
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Sora:wght@400;500&display=swap');
 
        .cd-page {
          font-family: 'Sora', sans-serif;
          min-height: 100vh;
          background: #f1f5f9;
          color: #1e293b;
        }
 
        /* ── BANNER ── */
        .cd-banner {
          background: linear-gradient(135deg, #0a1f44 0%, #1a56db 100%);
          padding: 2.5rem 2rem 4rem;
          position: relative;
          overflow: hidden;

         
  margin-top: -68px;
  padding-top: calc(6rem );
        }
        .cd-banner::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 90% 50%, rgba(56,189,248,.18) 0%, transparent 60%);
          pointer-events: none;
        }
        .cd-banner-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          position: relative;
        }
        .cd-banner-left h2 {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 900;
          color: #fff;
          margin-bottom: .35rem;
        }
        .cd-banner-left p {
          color: rgba(255,255,255,.7);
          font-size: .95rem;
        }
        .cd-banner-left p strong { color: #38bdf8; }
 
        .cd-banner-avatar {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #38bdf8, #06b6d4);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem;
          font-weight: 900;
          color: #fff;
          box-shadow: 0 4px 16px rgba(6,182,212,.4);
          flex-shrink: 0;
          border: 3px solid rgba(255,255,255,.25);
        }
 
        .cd-banner-right {
          display: flex; align-items: center; gap: .8rem;
        }
 
        .cd-btn-subscribe {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .55rem 1.2rem;
          border-radius: 99px;
          font-family: 'Outfit', sans-serif;
          font-weight: 700; font-size: .88rem;
          cursor: pointer; border: none;
          transition: transform .2s, box-shadow .2s;
        }
        .cd-btn-subscribe.on {
          background: rgba(255,255,255,.15);
          border: 1.5px solid rgba(255,255,255,.3);
          color: #fff;
        }
        .cd-btn-subscribe.off {
          background: #f59e0b;
          color: #fff;
          box-shadow: 0 3px 12px rgba(245,158,11,.4);
        }
        .cd-btn-subscribe:hover { transform: translateY(-1px); }
 
        .cd-btn-logout {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .5rem 1.1rem;
          border-radius: 99px;
          background: rgba(239,68,68,.15);
          border: 1.5px solid rgba(239,68,68,.3);
          color: #fca5a5;
          font-family: 'Outfit', sans-serif;
          font-weight: 600; font-size: .85rem;
          cursor: pointer;
          transition: background .2s, transform .2s;
        }
        .cd-btn-logout:hover { background: rgba(239,68,68,.25); transform: translateY(-1px); }
 
        .cd-wave {
          position: absolute; bottom: -2px; left: 0;
          width: 100%; line-height: 0; pointer-events: none;
        }
 
        /* ── BODY ── */
        .cd-body {
          max-width: 1100px;
          margin: -2rem auto 0;
          padding: 0 1.5rem 4rem;
          position: relative;
          z-index: 2;
        }
 
        /* ── ALERTE ABONNEMENT ── */
        .cd-sub-banner {
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border: 1px solid #fcd34d;
          border-radius: 14px;
          padding: 1rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 1rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(245,158,11,.12);
        }
        .cd-sub-banner p {
          font-size: .9rem; color: #92400e; margin: 0;
        }
        .cd-sub-banner strong { color: #78350f; }
        .cd-sub-link {
          background: #f59e0b; color: #fff;
          font-family: 'Outfit', sans-serif;
          font-weight: 700; font-size: .85rem;
          padding: .45rem 1.1rem; border-radius: 99px;
          border: none; cursor: pointer;
          white-space: nowrap;
          transition: background .2s;
        }
        .cd-sub-link:hover { background: #d97706; }
 
        /* ── SECTION TITLE ── */
        .cd-section-label {
          font-family: 'Outfit', sans-serif;
          font-weight: 700; font-size: .78rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: #94a3b8; margin-bottom: 1rem;
        }
 
        /* ── MENU GRID ── */
        .cd-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.2rem;
        }
 
        .cd-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.6rem 1.4rem;
          cursor: pointer;
          transition: transform .25s, box-shadow .25s, border-color .25s;
          position: relative;
          overflow: hidden;
        }
        .cd-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          border-radius: 0 0 16px 16px;
          transform: scaleX(0);
          transition: transform .3s;
          transform-origin: left;
        }
        .cd-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(0,0,0,.09);
          border-color: transparent;
        }
        .cd-card:hover::after { transform: scaleX(1); }
 
        .cd-card-icon-wrap {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
        .cd-card h3 {
          font-family: 'Outfit', sans-serif;
          font-weight: 800; font-size: 1rem;
          color: #0a1f44; margin-bottom: .35rem;
        }
        .cd-card p {
          font-size: .83rem; color: #64748b; line-height: 1.5; margin: 0;
        }
        .cd-card-arrow {
          position: absolute;
          top: 1.4rem; right: 1.4rem;
          font-size: .85rem; color: #cbd5e1;
          transition: color .2s, transform .2s;
        }
        .cd-card:hover .cd-card-arrow {
          color: #94a3b8;
          transform: translateX(3px);
        }
 
        /* ── MODAL ── */
        .cd-overlay {
          position: fixed; inset: 0;
          background: rgba(10,31,68,.55);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
        }
        .cd-modal {
          background: #fff;
          border-radius: 20px;
          padding: 2.2rem;
          width: 100%; max-width: 440px;
          box-shadow: 0 24px 64px rgba(0,0,0,.2);
          animation: cd-slidein .25s ease;
        }
        @keyframes cd-slidein {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cd-modal h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.2rem; font-weight: 800;
          color: #0a1f44; margin-bottom: .4rem;
        }
        .cd-modal-sub { font-size: .88rem; color: #64748b; margin-bottom: 1.5rem; }
 
        .cd-field { margin-bottom: 1rem; }
        .cd-field label {
          display: block; font-size: .82rem; font-weight: 600;
          color: #374151; margin-bottom: .4rem;
        }
        .cd-field input,
        .cd-field select {
          width: 100%; padding: .65rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-family: 'Sora', sans-serif;
          font-size: .9rem; color: #1e293b;
          outline: none;
          transition: border-color .2s;
        }
        .cd-field input:focus,
        .cd-field select:focus { border-color: #1a56db; }
 
        .cd-modal-btns {
          display: flex; gap: .8rem; margin-top: 1.5rem;
        }
        .cd-modal-confirm {
          flex: 1; padding: .7rem;
          background: linear-gradient(135deg, #1a56db, #06b6d4);
          color: #fff; border: none; border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-weight: 700; font-size: .92rem;
          cursor: pointer; transition: opacity .2s;
        }
        .cd-modal-confirm:hover { opacity: .9; }
        .cd-modal-cancel {
          flex: 1; padding: .7rem;
          background: #f1f5f9; color: #64748b;
          border: none; border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-weight: 600; font-size: .92rem;
          cursor: pointer; transition: background .2s;
        }
        .cd-modal-cancel:hover { background: #e2e8f0; }
 
        @media (max-width: 700px) {
          .cd-grid { grid-template-columns: repeat(2, 1fr); }
          .cd-banner-right { flex-wrap: wrap; }
        }
        @media (max-width: 480px) {
          .cd-grid { grid-template-columns: 1fr; }
        }
      `}</style>
 
      <div className="cd-page">
 
        {/* ── BANNER ── */}
        <div className="cd-banner">
          <div className="cd-banner-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="cd-banner-avatar">
                {(user?.nom?.[0] || 'C').toUpperCase()}
              </div>
              <div className="cd-banner-left">
                <h2>{greeting}, <span style={{ color: '#38bdf8' }}>{user?.nom || 'Citoyen'}</span> 👋</h2>
                <p>Espace Citoyen · <strong>{user?.commune || 'Bénin'}</strong></p>
              </div>
            </div>
            <div className="cd-banner-right">
              <button
                className={`cd-btn-subscribe ${subscribed ? 'on' : 'off'}`}
                onClick={() => setShowSubscribeModal(true)}
              >
                {subscribed ? '🔔 Abonné aux alertes' : '🔕 S\'abonner aux alertes'}
              </button>
            
            </div>
          </div>
          <div className="cd-wave">
            <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0,20 C480,50 960,0 1440,25 L1440,50 L0,50 Z" fill="#f1f5f9"/>
            </svg>
          </div>
        </div>
 
        {/* ── BODY ── */}
        <div className="cd-body">
 
          {/* Bannière abonnement si non abonné */}
          {!subscribed && (
            <div className="cd-sub-banner">
              <p>🔕 Vous n'êtes pas encore abonné aux alertes. <strong>Activez les notifications</strong> pour être prévenu en cas d'inondation près de chez vous.</p>
              <button className="cd-sub-link" onClick={() => setShowSubscribeModal(true)}>
                Activer les alertes
              </button>
            </div>
          )}
 
          <div className="cd-section-label">Mes fonctionnalités</div>
 
          {/* ── GRILLE ── */}
          <div className="cd-grid">
            {menuItems.map((item, i) => (
              <div
                key={i}
                className="cd-card"
                onClick={() => navigate(item.path)}
                style={{ '--card-accent': item.accent }}
              >
                <style>{`.cd-card:nth-child(${i + 1})::after { background: ${item.accent}; }`}</style>
                <div className="cd-card-icon-wrap" style={{ background: item.bg }}>
                  {item.icon}
                </div>
                <h3 style={{ color: item.accent === '#dc2626' ? '#991b1b' : '#0a1f44' }}>
                  {item.title}
                </h3>
                <p>{item.desc}</p>
                <span className="cd-card-arrow">→</span>
              </div>
            ))}
          </div>
        </div>
 
        {/* ── MODAL ABONNEMENT ── */}
        {showSubscribeModal && (
          <div className="cd-overlay" onClick={() => setShowSubscribeModal(false)}>
            <div className="cd-modal" onClick={e => e.stopPropagation()}>
              <h3>{subscribed ? '⚙️ Gérer mon abonnement' : '🔔 S\'abonner aux alertes'}</h3>
              <p className="cd-modal-sub">
                {subscribed
                  ? 'Modifiez vos préférences ou désabonnez-vous.'
                  : 'Recevez des alertes d\'inondation pour votre commune.'}
              </p>
 
              <div className="cd-field">
                <label>Adresse e-mail</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="cd-field">
                <label>Téléphone (optionnel)</label>
                <input
                  type="tel"
                  placeholder="+229 ..."
                  value={telephone}
                  onChange={e => setTelephone(e.target.value)}
                />
              </div>
              <div className="cd-field">
                <label>Commune à surveiller</label>
                <select value={commune} onChange={e => setCommune(e.target.value)}>
                  {communesBenin.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
 
              <div className="cd-modal-btns">
                {subscribed ? (
                  <>
                    <button className="cd-modal-confirm" onClick={handleSubscribe} disabled={loadingSubscribe}>
                      {loadingSubscribe ? 'Mise à jour...' : '✅ Mettre à jour'}
                    </button>
                    <button
                      style={{ flex: 1, padding: '.7rem', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '10px', fontFamily: 'Outfit', fontWeight: 700, fontSize: '.92rem', cursor: 'pointer' }}
                      onClick={handleUnsubscribe}
                    >
                      🔕 Se désabonner
                    </button>
                  </>
                ) : (
                  <button className="cd-modal-confirm" onClick={handleSubscribe} disabled={loadingSubscribe}>
                    {loadingSubscribe ? 'Abonnement...' : '🔔 Activer les alertes'}
                  </button>
                )}
                <button className="cd-modal-cancel" onClick={() => setShowSubscribeModal(false)}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
 
      </div>
    </>
  );
};
 
export default CitoyenDashboard;