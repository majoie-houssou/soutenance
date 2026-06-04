import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EMPTY = { dateDebut:'', dateFin:'', zones:'', sinistres:'', ressources:'' };

const GenerationRapports = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const dureeJours = () => {
    if (!formData.dateDebut || !formData.dateFin) return null;
    const d = Math.ceil((new Date(formData.dateFin) - new Date(formData.dateDebut)) / 86400000);
    return d > 0 ? d : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dateDebut || !formData.dateFin) { setError('Veuillez renseigner les dates'); return; }
    if (!formData.zones) { setError('Veuillez renseigner les zones touchées'); return; }
    if (new Date(formData.dateFin) < new Date(formData.dateDebut)) { setError('La date de fin doit être après la date de début'); return; }

    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/autorite/rapports/generer', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          dateDebut: formData.dateDebut,
          dateFin:   formData.dateFin,
          zones:     formData.zones,
          sinistres: formData.sinistres || '0',
          ressources:formData.ressources || 'Non spécifiées',
        }),
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/pdf')) {
          const blob = await response.blob();
          const url  = window.URL.createObjectURL(blob);
          const a    = document.createElement('a');
          a.href     = url;
          a.download = `rapport_crise_${formData.dateDebut}_${formData.dateFin}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 4000);
        } else {
          const data = await response.json();
          if (data.mode === 'simulation') {
            setSuccess(true);
            setError('⚠️ Mode simulation : Chrome non trouvé. Le rapport a été enregistré en base sans PDF.');
            setTimeout(() => setSuccess(false), 5000);
          }
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la génération');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const duree = dureeJours();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Sora:wght@400;500&display=swap');

        .gr-page { font-family:'Sora',sans-serif; background:#f1f5f9; min-height:100vh; color:#1e293b; }

        .gr-header {
          background:linear-gradient(135deg,#0a1f44 0%,#1a56db 100%);
          padding:2.5rem 2rem 3rem; position:relative; overflow:hidden;
        }
        .gr-header::before {
          content:''; position:absolute; inset:0;
          background:radial-gradient(ellipse 60% 80% at 90% 50%,rgba(56,189,248,.15) 0%,transparent 60%);
          pointer-events:none;
        }
        .gr-header-inner { max-width:860px; margin:0 auto; position:relative; }
        .gr-back {
          display:inline-flex; align-items:center; gap:.4rem;
          background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2);
          color:rgba(255,255,255,.85); font-family:'Outfit',sans-serif;
          font-size:.82rem; font-weight:600; padding:.4rem 1rem;
          border-radius:99px; cursor:pointer; margin-bottom:1.5rem;
          transition:background .2s;
        }
        .gr-back:hover { background:rgba(255,255,255,.18); }
        .gr-header-tag {
          display:inline-block; background:rgba(6,182,212,.15);
          border:1px solid rgba(6,182,212,.3); color:#38bdf8;
          font-family:'Outfit',sans-serif; font-size:.75rem; font-weight:700;
          letter-spacing:.1em; text-transform:uppercase;
          padding:.3rem .9rem; border-radius:99px; margin-bottom:.8rem;
        }
        .gr-header h1 {
          font-family:'Outfit',sans-serif; font-size:clamp(1.5rem,3vw,2.2rem);
          font-weight:900; color:#fff; margin-bottom:.3rem;
        }
        .gr-header h1 span {
          background:linear-gradient(90deg,#38bdf8,#06b6d4);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .gr-header p { color:rgba(255,255,255,.7); font-size:.9rem; }
        .gr-wave { position:absolute; bottom:-2px; left:0; width:100%; line-height:0; pointer-events:none; }

        .gr-body { max-width:860px; margin:1.5rem auto 0; padding:0 1.5rem 4rem; }

        /* ── GRID PRINCIPAL ── */
        .gr-grid { display:grid; grid-template-columns:1fr 280px; gap:1.5rem; align-items:start; }

        /* ── FORMULAIRE ── */
        .gr-form-card {
          background:#fff; border:1px solid #e2e8f0;
          border-radius:18px; overflow:hidden;
          box-shadow:0 2px 12px rgba(0,0,0,.05);
        }
        .gr-form-header {
          background:linear-gradient(135deg,#0a1f44,#1a56db);
          padding:1.1rem 1.5rem;
          display:flex; align-items:center; gap:.6rem;
        }
        .gr-form-header h2 { font-family:'Outfit',sans-serif; font-weight:800; font-size:1rem; color:#fff; margin:0; }
        .gr-form-body { padding:1.5rem; }

        /* Dates côte à côte */
        .gr-dates-row { display:grid; grid-template-columns:1fr 1fr; gap:.9rem; margin-bottom:1.1rem; }

        .gr-field { margin-bottom:1.1rem; }
        .gr-field label {
          display:block; font-family:'Outfit',sans-serif; font-weight:700;
          font-size:.82rem; color:#374151; margin-bottom:.4rem;
        }
        .gr-input, .gr-textarea {
          width:100%; font-family:'Sora',sans-serif; font-size:.9rem;
          color:#1e293b; border-radius:12px; outline:none;
          padding:.65rem 1rem; border:1.5px solid #e2e8f0;
          background:#f8fafc; transition:border-color .2s;
        }
        .gr-input:focus, .gr-textarea:focus {
          border-color:#1a56db;
          box-shadow:0 0 0 3px rgba(26,86,219,.1);
        }
        .gr-textarea { resize:vertical; min-height:90px; }

        /* Durée badge */
        .gr-duree {
          display:inline-flex; align-items:center; gap:.4rem;
          background:#eff6ff; color:#1a56db; border:1px solid #bfdbfe;
          font-family:'Outfit',sans-serif; font-weight:700; font-size:.8rem;
          padding:.3rem .8rem; border-radius:99px; margin-bottom:1.1rem;
        }

        /* Feedback */
        .gr-success {
          background:#f0fdf4; border:1px solid #86efac; color:#16a34a;
          border-radius:10px; padding:.75rem 1rem; font-size:.88rem;
          font-weight:600; text-align:center; margin-bottom:1rem;
        }
        .gr-error {
          background:#fef2f2; border:1px solid #fca5a5; color:#dc2626;
          border-radius:10px; padding:.75rem 1rem; font-size:.88rem;
          text-align:center; margin-bottom:1rem;
        }

        /* Boutons */
        .gr-btn-row { display:flex; gap:.7rem; margin-top:.5rem; }
        .gr-btn-submit {
          flex:1; padding:.85rem;
          background:linear-gradient(135deg,#f59e0b,#fbbf24);
          color:#fff; border:none; border-radius:12px;
          font-family:'Outfit',sans-serif; font-weight:900; font-size:.95rem;
          cursor:pointer; box-shadow:0 4px 16px rgba(245,158,11,.35);
          transition:transform .2s, box-shadow .2s, opacity .2s;
        }
        .gr-btn-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 22px rgba(245,158,11,.45); }
        .gr-btn-submit:disabled { opacity:.65; cursor:not-allowed; }
        .gr-btn-reset {
          padding:.85rem 1.2rem;
          background:#f1f5f9; color:#64748b;
          border:1.5px solid #e2e8f0; border-radius:12px;
          font-family:'Outfit',sans-serif; font-weight:600; font-size:.88rem;
          cursor:pointer; transition:background .2s;
        }
        .gr-btn-reset:hover { background:#e2e8f0; }

        /* ── SIDEBAR ── */
        .gr-sidebar { display:flex; flex-direction:column; gap:1.2rem; }

        .gr-info-card {
          background:#fff; border:1px solid #e2e8f0;
          border-radius:16px; overflow:hidden;
          box-shadow:0 2px 8px rgba(0,0,0,.04);
        }
        .gr-info-header {
          background:linear-gradient(135deg,#0a1f44,#1a56db);
          padding:.9rem 1.2rem;
        }
        .gr-info-header h3 { font-family:'Outfit',sans-serif; font-weight:800; font-size:.9rem; color:#fff; margin:0; }
        .gr-info-body { padding:1rem; }

        .gr-check-list { list-style:none; display:flex; flex-direction:column; gap:.5rem; }
        .gr-check-list li {
          display:flex; align-items:flex-start; gap:.6rem;
          font-size:.82rem; color:#475569; line-height:1.4;
          padding:.5rem .7rem; background:#f8fafc;
          border:1px solid #f1f5f9; border-radius:8px;
        }
        .gr-check-list li span { flex-shrink:0; }

        .gr-tip {
          background:#fffbeb; border:1px solid #fde047;
          border-radius:12px; padding:.9rem 1rem;
          font-size:.78rem; color:#92400e; line-height:1.6;
        }

        @media (max-width:720px) {
          .gr-grid { grid-template-columns:1fr; }
          .gr-dates-row { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="gr-page">

        {/* ── HEADER ── */}
        <div className="gr-header">
          <div className="gr-header-inner">
            <button className="gr-back" onClick={() => navigate(-1)}>← Retour</button>

            <div style={{ marginTop:'1.5rem' }}>
              <div className="gr-header-tag">📄 Espace Autorité</div>
              <h1>Génération de <span>rapport PDF</span></h1>
              <p>Générez un rapport officiel de fin de crise téléchargeable</p>
            </div>
          </div>
          <div className="gr-wave">
            <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0,20 C480,50 960,0 1440,25 L1440,50 L0,50 Z" fill="#f1f5f9"/>
            </svg>
          </div>
        </div>

        <div className="gr-body">
          <div className="gr-grid">

            {/* ── FORMULAIRE ── */}
            <div className="gr-form-card">
              <div className="gr-form-header">
                <span style={{ fontSize:'1.2rem' }}>📝</span>
                <h2>Informations du rapport</h2>
              </div>
              <div className="gr-form-body">

                {success && <div className="gr-success">✅ Rapport généré et téléchargé avec succès !</div>}
                {error   && <div className="gr-error">❌ {error}</div>}

                <form onSubmit={handleSubmit}>

                  {/* Dates */}
                  <div className="gr-dates-row">
                    <div className="gr-field" style={{ marginBottom:0 }}>
                      <label>📅 Date de début *</label>
                      <input className="gr-input" type="date" required
                        value={formData.dateDebut} onChange={e => set('dateDebut', e.target.value)} />
                    </div>
                    <div className="gr-field" style={{ marginBottom:0 }}>
                      <label>📅 Date de fin *</label>
                      <input className="gr-input" type="date" required
                        value={formData.dateFin} onChange={e => set('dateFin', e.target.value)} />
                    </div>
                  </div>

                  {/* Badge durée */}
                  {duree && (
                    <div style={{ margin:'.9rem 0' }}>
                      <span className="gr-duree">⏱️ Durée : {duree} jour{duree > 1 ? 's' : ''} de crise</span>
                    </div>
                  )}

                  <div className="gr-field">
                    <label>📍 Zones touchées *</label>
                    <input className="gr-input" type="text" required
                      placeholder="Ex : Cotonou, Grand-Popo, Sèmè-Kraké"
                      value={formData.zones} onChange={e => set('zones', e.target.value)} />
                  </div>

                  <div className="gr-field">
                    <label>👥 Nombre de sinistrés</label>
                    <input className="gr-input" type="number" min="0"
                      placeholder="Ex : 562000"
                      value={formData.sinistres} onChange={e => set('sinistres', e.target.value)} />
                  </div>

                  <div className="gr-field">
                    <label>🚑 Ressources mobilisées</label>
                    <textarea className="gr-textarea"
                      placeholder="Ex : 450 secouristes, 85 véhicules, 50 000 kits d'urgence..."
                      value={formData.ressources} onChange={e => set('ressources', e.target.value)} />
                  </div>

                  <div className="gr-btn-row">
                    <button type="submit" className="gr-btn-submit" disabled={loading}>
                      {loading ? '⏳ Génération en cours...' : '📄 Générer et télécharger le PDF'}
                    </button>
                    <button type="button" className="gr-btn-reset" onClick={() => setFormData(EMPTY)}>
                      🗑️
                    </button>
                  </div>

                </form>
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <div className="gr-sidebar">
              <div className="gr-info-card">
                <div className="gr-info-header"><h3>📋 Contenu du rapport</h3></div>
                <div className="gr-info-body">
                  <ul className="gr-check-list">
                    {[
                      ['📅', 'Période et durée de la crise'],
                      ['📍', 'Zones et départements touchés'],
                      ['👥', 'Nombre de sinistrés déclarés'],
                      ['📊', 'Statistiques des signalements'],
                      ['🚑', 'Ressources mobilisées'],
                      ['💡', 'Recommandations post-crise'],
                      ['✍️', 'Signature de l\'autorité'],
                    ].map(([icon, txt], i) => (
                      <li key={i}><span>{icon}</span> {txt}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="gr-tip">
                💡 Le rapport est généré au format <strong>PDF A4</strong> avec en-tête officiel InondoBénin, statistiques réelles de la base de données et recommandations automatiques.
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default GenerationRapports;