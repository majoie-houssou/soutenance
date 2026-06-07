import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ZONES = ['Littoral','Atlantique','Ouémé','Mono','Couffo','Zou','Collines','Borgou','Alibori','Atacora','Donga'];

// Dictionnaire simple pour lier les communes de ta base de données aux départements
const MAP_COMMUNE_VERS_DEPARTEMENT = {
  'cotonou': 'Littoral',
  'abomey-calavi': 'Atlantique', 'calavi': 'Atlantique', 'allada': 'Atlantique', 'ouidah': 'Atlantique',
  'porto-novo': 'Ouémé', 'porto': 'Ouémé', 'semè-podji': 'Ouémé', 'seme': 'Ouémé',
  'lokossa': 'Mono', 'grand-popo': 'Mono',
  'aplahoué': 'Couffo',
  'abomey': 'Zou', 'bohicon': 'Zou',
  'dassa': 'Collines', 'savalou': 'Collines',
  'parakou': 'Borgou',
  'kandi': 'Alibori',
  'natitingou': 'Atacora',
  'djougou': 'Donga'
};

const MESSAGES_PREDEFINIS = {
  info:      { icon:'ℹ️', label:'Info',      color:'#1a56db', bg:'#eff6ff', border:'#93c5fd', message:'⚠️ Vigilance météo - Fortes pluies attendues dans les prochaines heures. Restez informés via InondoBénin.' },
  vigilance: { icon:'🟡', label:'Vigilance', color:'#ca8a04', bg:'#fefce8', border:'#fde047', message:"🟡 Vigilance orange - Risque modéré d'inondation dans votre zone. Préparez vos documents et chargez vos téléphones." },
  alerte:    { icon:'🟠', label:'Alerte',    color:'#ea580c', bg:'#fff7ed', border:'#fdba74', message:"🟠 ALERTE ORANGE - Risque élevé d'inondation. Évacuez si vous êtes en zone basse. Tenez-vous prêts." },
  urgence:   { icon:'🔴', label:'Urgence',   color:'#dc2626', bg:'#fef2f2', border:'#fca5a5', message:"🔴 ALERTE ROUGE - ÉVACUEZ IMMÉDIATEMENT ! L'eau monte rapidement. Rendez-vous au point de rassemblement le plus proche." },
};

const EnvoiAlertes = () => {
  const navigate = useNavigate();
  const [message, setMessage]           = useState('');
  const [zone, setZone]                 = useState('Tous');
  const [niveauUrgence, setNiveauUrgence] = useState('info');
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);
  const [error, setError]               = useState('');
  const [abonnes, setAbonnes]           = useState([]);

  useEffect(() => { fetchAbonnes(); }, []);

  const fetchAbonnes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch('http://localhost:5000/api/autorite/abonnes-email', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // CORRECTION : On extrait le tableau depuis "data.abonnes"
        setAbonnes(data.abonnes || []);
      }
    } catch (e) { 
      console.error("Erreur chargement abonnés:", e); 
    }
  };

  const appliquerMessage = (type) => {
    setNiveauUrgence(type);
    setMessage(MESSAGES_PREDEFINIS[type].message);
  };

  const envoyerAlerte = async () => {
    if (!message.trim()) { setError('Veuillez saisir un message'); return; }
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch('http://localhost:5000/api/autorite/alertes/email', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ zone, message, niveauUrgence }),
      });
      const data = await res.json();
      if (res.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 4000); }
      else setError(data.error || "Erreur lors de l'envoi");
    } catch { setError('Erreur de connexion au serveur'); }
    finally { setLoading(false); }
  };

  const cfg = MESSAGES_PREDEFINIS[niveauUrgence];

  // CORRECTION : Attribution de la commune du citoyen au bon département pour l'affichage
  const abonnesParZone = ZONES.reduce((acc, z) => {
    acc[z] = abonnes.filter(a => {
      const communeAbonne = (a.commune || '').toLowerCase().trim();
      const deptTrouve = MAP_COMMUNE_VERS_DEPARTEMENT[communeAbonne] || 'Littoral'; // Par défaut Littoral si non listé
      return deptTrouve === z;
    }).length;
    return acc;
  }, {});

  const destinataires = zone === 'Tous' ? abonnes.length : (abonnesParZone[zone] || 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Sora:wght@400;500&display=swap');
        .ea-page { font-family:'Sora',sans-serif; background:#f1f5f9; min-height:100vh; color:#1e293b; }
        .ea-header {
          background:linear-gradient(135deg,#0a1f44 0%,#1a56db 100%);
          padding:2.5rem 2rem 3rem; position:relative; overflow:hidden; 
          margin-top: -68px; padding-top: calc(6rem + 68px);
        }
        .ea-header::before {
          content:''; position:absolute; inset:0;
          background:radial-gradient(ellipse 60% 80% at 90% 50%,rgba(56,189,248,.15) 0%,transparent 60%);
          pointer-events:none;
        }
        .ea-header-inner { max-width:960px; margin:0 auto; position:relative; }
        .ea-back {
          display:inline-flex; align-items:center; gap:.4rem;
          background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2);
          color:rgba(255,255,255,.85); font-family:'Outfit',sans-serif;
          font-size:.82rem; font-weight:600; padding:.4rem 1rem;
          border-radius:99px; cursor:pointer; margin-bottom:1.2rem;
          transition:background .2s;
        }
        .ea-back:hover { background:rgba(255,255,255,.18); }
        .ea-header-tag {
          display:inline-block; background:rgba(6,182,212,.15);
          border:1px solid rgba(6,182,212,.3); color:#38bdf8;
          font-family:'Outfit',sans-serif; font-size:.75rem; font-weight:700;
          letter-spacing:.1em; text-transform:uppercase;
          padding:.3rem .9rem; border-radius:99px; margin-bottom:.8rem;
        }
        .ea-header h1 {
          font-family:'Outfit',sans-serif; font-size:clamp(1.5rem,3vw,2.2rem);
          font-weight:900; color:#fff; margin-bottom:.3rem;
        }
        .ea-header h1 span {
          background:linear-gradient(90deg,#38bdf8,#06b6d4);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .ea-header p { color:rgba(255,255,255,.7); font-size:.9rem; }
        .ea-wave { position:absolute; bottom:-2px; left:0; width:100%; line-height:0; pointer-events:none; }
        .ea-body { max-width:960px; margin:1.5rem auto 0; padding:0 1.5rem 4rem; position:relative; z-index:2; }
        .ea-grid { display:grid; grid-template-columns:1fr 320px; gap:1.5rem; align-items:start; }
        .ea-form-card {
          background:#fff; border:1px solid #e2e8f0;
          border-radius:18px; overflow:hidden;
          box-shadow:0 2px 12px rgba(0,0,0,.05);
        }
        .ea-form-header {
          background:linear-gradient(135deg,#0a1f44,#1a56db);
          padding:1.1rem 1.5rem; display:flex; align-items:center; gap:.6rem;
        }
        .ea-form-header h2 { font-family:'Outfit',sans-serif; font-weight:800; font-size:1rem; color:#fff; margin:0; }
        .ea-form-body { padding:1.5rem; }
        .ea-predef-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:.6rem; margin-bottom:1.5rem; }
        .ea-predef-btn {
          display:flex; align-items:center; gap:.5rem;
          padding:.65rem 1rem; border-radius:12px; border:2px solid;
          cursor:pointer; font-family:'Outfit',sans-serif;
          font-weight:700; font-size:.85rem;
          transition:transform .15s, box-shadow .15s;
        }
        .ea-predef-btn:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,.1); }
        .ea-predef-btn.active { box-shadow:0 0 0 3px rgba(0,0,0,.15) inset; }
        .ea-field { margin-bottom:1.2rem; }
        .ea-field label {
          display:block; font-family:'Outfit',sans-serif;
          font-weight:700; font-size:.82rem; color:#374151; margin-bottom:.45rem;
        }
        .ea-select, .ea-textarea {
          width:100%; font-family:'Sora',sans-serif; font-size:.9rem;
          color:#1e293b; border-radius:12px; outline:none;
          transition:border-color .2s, box-shadow .2s;
        }
        .ea-select { padding:.65rem 1rem; border:1.5px solid #e2e8f0; background:#f8fafc; cursor:pointer; }
        .ea-select:focus { border-color:#1a56db; box-shadow:0 0 0 3px rgba(26,86,219,.1); }
        .ea-textarea { padding:.75rem 1rem; border:1.5px solid; resize:vertical; min-height:130px; }
        .ea-textarea:focus { box-shadow:0 0 0 3px rgba(26,86,219,.1); }
        .ea-preview { border-radius:12px; padding:1rem 1.2rem; margin-bottom:1.2rem; border:1.5px solid; }
        .ea-preview-title { font-family:'Outfit',sans-serif; font-weight:800; font-size:.85rem; margin-bottom:.4rem; }
        .ea-preview-msg { font-size:.88rem; line-height:1.6; }
        .ea-dest {
          display:flex; align-items:center; justify-content:space-between;
          background:#f0f7ff; border:1px solid #bfdbfe;
          border-radius:10px; padding:.65rem 1rem; margin-bottom:1.2rem;
        }
        .ea-dest-label { font-size:.82rem; color:#475569; }
        .ea-dest-count { font-family:'Outfit',sans-serif; font-weight:900; font-size:1.1rem; color:#1a56db; }
        .ea-success {
          background:#f0fdf4; border:1px solid #86efac; color:#16a34a;
          border-radius:10px; padding:.7rem 1rem; font-size:.88rem; font-weight:600; text-align:center; margin-bottom:1rem;
        }
        .ea-error {
          background:#fef2f2; border:1px solid #fca5a5; color:#dc2626;
          border-radius:10px; padding:.7rem 1rem; font-size:.88rem; text-align:center; margin-bottom:1rem;
        }
        .ea-btn-send {
          width:100%; padding:.9rem 1rem;
          background:linear-gradient(135deg,#dc2626,#ef4444);
          color:#fff; border:none; border-radius:12px;
          font-family:'Outfit',sans-serif; font-weight:900; font-size:1rem;
          cursor:pointer; box-shadow:0 4px 16px rgba(220,38,38,.35);
          transition:transform .2s, box-shadow .2s, opacity .2s;
        }
        .ea-btn-send:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 22px rgba(220,38,38,.45); }
        .ea-btn-send:disabled { opacity:.65; cursor:not-allowed; }
        .ea-hint { font-size:.72rem; color:#94a3b8; text-align:center; margin-top:.8rem; line-height:1.5; }
        .ea-sidebar { display:flex; flex-direction:column; gap:1.2rem; }
        .ea-stats-card {
          background:#fff; border:1px solid #e2e8f0; border-radius:18px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.05);
        }
        .ea-stats-header { background:linear-gradient(135deg,#0a1f44,#1a56db); padding:.9rem 1.2rem; }
        .ea-stats-header h3 { font-family:'Outfit',sans-serif; font-weight:800; font-size:.95rem; color:#fff; margin:0; }
        .ea-stats-body { padding:1rem; }
        .ea-total-row {
          display:flex; align-items:center; justify-content:space-between;
          background:#f0f7ff; border:1px solid #bfdbfe; border-radius:10px; padding:.7rem 1rem; margin-bottom:.75rem;
        }
        .ea-total-label { font-size:.82rem; color:#475569; font-weight:600; }
        .ea-total-num { font-family:'Outfit',sans-serif; font-weight:900; font-size:1.4rem; color:#1a56db; }
        .ea-zone-list { display:flex; flex-direction:column; gap:.4rem; }
        .ea-zone-row {
          display:flex; align-items:center; justify-content:space-between;
          padding:.5rem .7rem; border-radius:8px; background:#f8fafc;
          border:1px solid #f1f5f9; transition:background .15s;
        }
        .ea-zone-row:hover { background:#f0f7ff; }
        .ea-zone-name { font-size:.82rem; color:#475569; font-weight:500; }
        .ea-zone-count {
          font-family:'Outfit',sans-serif; font-weight:700; font-size:.82rem; color:#1a56db;
          background:#eff6ff; padding:.15rem .55rem; border-radius:99px;
        }
        @media (max-width:820px) {
          .ea-grid { grid-template-columns:1fr; }
          .ea-predef-grid { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      <div className="ea-page">
        {/* ── HEADER ── */}
        <div className="ea-header">
          <div className="ea-header-inner">
            <button className="ea-back" onClick={() => navigate(-1)}>← Retour</button>
            <div style={{ marginTop: "1.5rem" }}>
              <div className="ea-header-tag">📧 Espace Autorité</div>
              <h1>Alertes <span>email de masse</span></h1>
              <p>Envoyez des alertes ciblées aux populations abonnées par département</p>
            </div>
          </div>
          <div className="ea-wave">
            <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0,20 C480,50 960,0 1440,25 L1440,50 L0,50 Z" fill="#f1f5f9"/>
            </svg>
          </div>
        </div>

        <div className="ea-body">
          <div className="ea-grid">
            {/* ── FORMULAIRE ── */}
            <div className="ea-form-card">
              <div className="ea-form-header">
                <span style={{ fontSize:'1.2rem' }}>✉️</span>
                <h2>Composer l'alerte</h2>
              </div>
              <div className="ea-form-body">
                {/* Messages prédéfinis */}
                <div className="ea-field">
                  <label>📌 Niveau d'alerte</label>
                  <div className="ea-predef-grid">
                    {Object.entries(MESSAGES_PREDEFINIS).map(([key, val]) => (
                      <button
                        key={key}
                        className={`ea-predef-btn ${niveauUrgence === key ? 'active' : ''}`}
                        style={{ background: niveauUrgence === key ? val.bg : '#f8fafc', color: val.color, borderColor: niveauUrgence === key ? val.color : '#e2e8f0' }}
                        onClick={() => appliquerMessage(key)}
                      >
                        {val.icon} {val.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zone */}
                <div className="ea-field">
                  <label>📍 Zone de diffusion</label>
                  <select className="ea-select" value={zone} onChange={e => setZone(e.target.value)}>
                    <option value="Tous">📌 Tous les départements ({abonnes.length} abonnés)</option>
                    {ZONES.map(z => (
                      <option key={z} value={z}>{z} ({abonnesParZone[z] || 0} abonnés)</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="ea-field">
                  <label>✉️ Message d'alerte</label>
                  <textarea
                    className="ea-textarea"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Saisissez votre message d'alerte ou choisissez un modèle ci-dessus..."
                    style={{ borderColor: cfg.color }}
                  />
                </div>

                {/* Aperçu */}
                {message && (
                  <div className="ea-preview" style={{ background: cfg.bg, borderColor: cfg.border }}>
                    <div className="ea-preview-title" style={{ color: cfg.color }}>
                      {cfg.icon} Aperçu de l'email · {cfg.label}
                    </div>
                    <div className="ea-preview-msg" style={{ color: cfg.color }}>{message}</div>
                  </div>
                )}

                {/* Destinataires */}
                <div className="ea-dest">
                  <span className="ea-dest-label">👥 Destinataires ({zone === 'Tous' ? 'tous les dép.' : zone})</span>
                  <span className="ea-dest-count">{destinataires} abonné{destinataires !== 1 ? 's' : ''}</span>
                </div>

                {/* Feedback */}
                {success && <div className="ea-success">✅ Alerte envoyée avec succès à {destinataires} abonné{destinataires !== 1 ? 's' : ''} !</div>}
                {error   && <div className="ea-error">❌ {error}</div>}

                {/* Bouton */}
                <button className="ea-btn-send" onClick={envoyerAlerte} disabled={loading || !message.trim()}>
                  {loading ? '⏳ Envoi en cours...' : `📧 Envoyer l'alerte à ${destinataires} personne${destinataires !== 1 ? 's' : ''}`}
                </button>

                <p className="ea-hint">
                  💡 Les emails sont envoyés avec un template professionnel incluant le niveau d'alerte et la carte des risques.
                </p>
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <div className="ea-sidebar">
              <div className="ea-stats-card">
                <div className="ea-stats-header">
                  <h3>📊 Abonnés par département</h3>
                </div>
                <div className="ea-stats-body">
                  <div className="ea-total-row">
                    <span className="ea-total-label">Total abonnés</span>
                    <span className="ea-total-num">{abonnes.length}</span>
                  </div>
                  <div className="ea-zone-list">
                    {ZONES.map(z => (
                      <div className="ea-zone-row" key={z}>
                        <span className="ea-zone-name">📍 {z}</span>
                        <span className="ea-zone-count">{abonnesParZone[z] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default EnvoiAlertes;