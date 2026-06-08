import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STATUT_CONFIG = {
  en_attente:     { bg:'#fffbeb', color:'#d97706', border:'#fcd34d', text:'En attente',     icon:'⏳' },
  pris_en_charge:{ bg:'#f0fdf4', color:'#16a34a', border:'#86efac', text:'Pris en charge',icon:'✅' },
  reloge:         { bg:'#eff6ff', color:'#2563eb', border:'#93c5fd', text:'Relogé',         icon:'🏠' },
};

const BESOINS_CONFIG = {
  abri:       { icon:'🏠', label:"Besoin d'abri",       bg:'#eff6ff', color:'#2563eb' },
  nourriture: { icon:'🍲', label:'Besoin de nourriture', bg:'#fefce8', color:'#ca8a04' },
  soins:      { icon:'🏥', label:'Soins médicaux',       bg:'#fef2f2', color:'#dc2626' },
};

const FILTERS = [
  { key:'all',           label:'Tous',           icon:'📌' },
  { key:'en_attente',    label:'En attente',     icon:'⏳' },
  { key:'pris_en_charge',label:'Pris en charge', icon:'✅' },
  { key:'reloge',        label:'Relogés',        icon:'🏠' },
];

// Mise à jour de l'état initial avec la ville et le quartier à la place du GPS
const EMPTY_FORM = { nom_famille:'', nombre_personnes:'', besoins:'', telephone:'', heberge_dans:'', ville:'', quartier:'' };

const SuiviSinistres = () => {
  const navigate = useNavigate();
  const [sinistres, setSinistres]       = useState([]);
  const [stats, setStats]               = useState({ total:0, enAttente:0, prisEnCharge:0, reloge:0 });
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [editingId, setEditingId]       = useState(null);
  const [filterStatut, setFilterStatut] = useState('all');

  useEffect(() => { fetchSinistres(); }, []);

  const fetchSinistres = async () => {
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch('http://localhost:5000/api/sinistres', {
        headers: { Authorization:`Bearer ${token}` },
      });
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setSinistres(data);
        setStats({
          total:        data.length,
          enAttente:    data.filter(s => s.statut === 'en_attente').length,
          prisEnCharge: data.filter(s => s.statut === 'pris_en_charge').length,
          reloge:       data.filter(s => s.statut === 'reloge').length,
        });
      }
    } catch(e) { 
      console.error("Erreur lors de la récupération des sinistres :", e); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Sécurisation des types de données pour éviter le rejet du Backend (Prisma)
      const payload = {
        ...formData,
        nombre_personnes: parseInt(formData.nombre_personnes, 10) || 0
      };

      console.log("📤 Envoi des données sinistré au backend :", payload);

      const url = editingId ? `http://localhost:5000/api/sinistres/${editingId}` : 'http://localhost:5000/api/sinistres';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'enregistrement");
      }

      setShowForm(false); 
      setEditingId(null); 
      setFormData(EMPTY_FORM);
      // Recharger immédiatement la liste à jour
      fetchSinistres();
    } catch(e) { 
      console.error("Erreur soumission formulaire :", e);
      alert(`Impossible d'enregistrer : ${e.message}`);
    }
  };

  const updateStatut = async (id, statut) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/sinistres/${id}/statut`, {
        method:'PUT',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ statut }),
      });
      fetchSinistres();
    } catch(e) { console.error(e); }
  };

  const deleteSinistre = async (id) => {
    if (!window.confirm('Supprimer ce sinistré ?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/sinistres/${id}`, {
        method:'DELETE', headers:{ Authorization:`Bearer ${token}` },
      });
      fetchSinistres();
    } catch(e) { console.error(e); }
  };

  const filtered = filterStatut === 'all' ? sinistres : sinistres.filter(s => s.statut === filterStatut);

  const totalPersonnes = sinistres.reduce((acc, s) => acc + (parseInt(s.nombre_personnes) || 0), 0);

  if (loading) return (
    <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem', fontFamily:'Sora,sans-serif' }}>
      <div style={{ width:44, height:44, border:'4px solid #e2e8f0', borderTopColor:'#1a56db', borderRadius:'50%', animation:'ss-spin .9s linear infinite' }} />
      <p style={{ color:'#64748b', fontWeight:600 }}>Chargement des sinistrés...</p>
      <style>{`@keyframes ss-spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Sora:wght@400;500&display=swap');
        @keyframes ss-spin { to { transform:rotate(360deg); } }
        @keyframes ss-slidein { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

        .ss-page { font-family:'Sora',sans-serif; background:#f1f5f9; min-height:100vh; color:#1e293b; }

        /* ── HEADER ── */
        .ss-header {
          background:linear-gradient(135deg,#0a1f44 0%,#1a56db 100%);
          padding:2.5rem 2rem 3rem; position:relative; overflow:hidden;
          margin-top: -68px;
          padding-top: calc(6rem + 68px);
        }
        .ss-header::before {
          content:''; position:absolute; inset:0;
          background:radial-gradient(ellipse 60% 80% at 90% 50%,rgba(56,189,248,.15) 0%,transparent 60%);
          pointer-events:none;
        }
        .ss-header-inner { max-width:1200px; margin:0 auto; position:relative; }
        .ss-back {
          display:inline-flex; align-items:center; gap:.4rem;
          background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2);
          color:rgba(255,255,255,.85); font-family:'Outfit',sans-serif;
          font-size:.82rem; font-weight:600; padding:.4rem 1rem;
          border-radius:99px; cursor:pointer; margin-bottom:1.5rem;
          transition:background .2s;
        }
        .ss-back:hover { background:rgba(255,255,255,.18); }
        .ss-header-top {
          display:flex; align-items:flex-end; justify-content:space-between;
          flex-wrap:wrap; gap:1rem;
        }
        .ss-header-tag {
          display:inline-block; background:rgba(6,182,212,.15);
          border:1px solid rgba(6,182,212,.3); color:#38bdf8;
          font-family:'Outfit',sans-serif; font-size:.75rem; font-weight:700;
          letter-spacing:.1em; text-transform:uppercase;
          padding:.3rem .9rem; border-radius:99px; margin-bottom:.8rem;
        }
        .ss-header h1 {
          font-family:'Outfit',sans-serif; font-size:clamp(1.5rem,3vw,2.2rem);
          font-weight:900; color:#fff; margin-bottom:.3rem;
        }
        .ss-header h1 span {
          background:linear-gradient(90deg,#38bdf8,#06b6d4);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .ss-header p { color:rgba(255,255,255,.7); font-size:.9rem; }
        .ss-btn-add {
          display:inline-flex; align-items:center; gap:.5rem;
          background:linear-gradient(135deg,#16a34a,#22c55e);
          color:#fff; font-family:'Outfit',sans-serif;
          font-weight:700; font-size:.9rem;
          padding:.65rem 1.4rem; border-radius:99px; border:none;
          cursor:pointer; white-space:nowrap;
          box-shadow:0 4px 14px rgba(22,163,74,.4);
          transition:transform .2s, box-shadow .2s;
        }
        .ss-btn-add:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(22,163,74,.5); }
        .ss-wave { position:absolute; bottom:-2px; left:0; width:100%; line-height:0; pointer-events:none; }

        /* ── BODY ── */
        .ss-body { max-width:1200px; margin:1.5rem auto 0; padding:0 1.5rem 4rem; }
        .ss-label {
          font-family:'Outfit',sans-serif; font-weight:700; font-size:.75rem;
          letter-spacing:.1em; text-transform:uppercase; color:#94a3b8;
          margin-bottom:.9rem; margin-top:2rem;
        }

        /* ── STATS ── */
        .ss-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:1rem; }
        .ss-stat {
          background:#fff; border:1px solid #e2e8f0; border-radius:14px;
          padding:1.2rem 1rem; text-align:center;
          box-shadow:0 2px 8px rgba(0,0,0,.04); transition:transform .2s;
        }
        .ss-stat:hover { transform:translateY(-3px); }
        .ss-stat-icon { font-size:1.4rem; margin-bottom:.3rem; display:block; }
        .ss-stat-num { font-family:'Outfit',sans-serif; font-size:2rem; font-weight:900; line-height:1; margin-bottom:.25rem; }
        .ss-stat-label { font-size:.75rem; color:#64748b; font-weight:500; }

        /* ── TOOLBAR ── */
        .ss-toolbar {
          background:#fff; border:1px solid #e2e8f0; border-radius:14px;
          padding:.85rem 1.2rem;
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:.8rem;
        }
        .ss-filters { display:flex; gap:.5rem; flex-wrap:wrap; }
        .ss-filter-btn {
          display:inline-flex; align-items:center; gap:.35rem;
          padding:.38rem .9rem; border-radius:99px;
          border:1.5px solid #e2e8f0; background:#fff;
          font-family:'Outfit',sans-serif; font-size:.82rem; font-weight:600;
          color:#475569; cursor:pointer; transition:all .2s;
        }
        .ss-filter-btn:hover { border-color:#16a34a; color:#16a34a; }
        .ss-filter-btn.active { background:#0a1f44; border-color:#0a1f44; color:#fff; }
        .ss-count { font-family:'Outfit',sans-serif; font-size:.82rem; font-weight:600; color:#64748b; }

        /* ── LISTE ── */
        .ss-list { display:flex; flex-direction:column; gap:.85rem; }
        .ss-card {
          background:#fff; border:1px solid #e2e8f0; border-radius:16px;
          overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.04);
          transition:transform .25s, box-shadow .25s;
        }
        .ss-card:hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(0,0,0,.09); }

        .ss-card-header {
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:.6rem;
          padding:.9rem 1.2rem; border-bottom:1px solid #f1f5f9;
        }
        .ss-card-left { display:flex; align-items:center; gap:.7rem; }
        .ss-card-name { font-family:'Outfit',sans-serif; font-weight:800; font-size:1rem; color:#0a1f44; }
        .ss-pers-badge {
          background:#f1f5f9; color:#475569; border:1px solid #e2e8f0;
          font-family:'Outfit',sans-serif; font-weight:700; font-size:.75rem;
          padding:.2rem .65rem; border-radius:99px;
        }
        .ss-card-actions { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; }
        .ss-statut-badge {
          font-family:'Outfit',sans-serif; font-size:.72rem; font-weight:700;
          padding:.22rem .7rem; border-radius:99px; border:1px solid;
        }
        .ss-btn-icon {
          width:30px; height:30px; border-radius:8px; border:none;
          display:flex; align-items:center; justify-content:center;
          font-size:.85rem; cursor:pointer; transition:transform .15s;
        }
        .ss-btn-icon:hover { transform:scale(1.1); }

        .ss-card-body { padding:1rem 1.2rem; display:flex; flex-wrap:wrap; gap:.6rem; }
        .ss-info-chip {
          display:inline-flex; align-items:center; gap:.35rem;
          font-size:.82rem; padding:.3rem .75rem; border-radius:99px;
          font-weight:500;
        }

        .ss-card-footer {
          padding:.7rem 1.2rem; background:#f8fafc; border-top:1px solid #f1f5f9;
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:.6rem;
        }
        .ss-coords { font-size:.82rem; color:#64748b; font-weight:600; }
        .ss-action-btns { display:flex; gap:.5rem; flex-wrap:wrap; }
        .ss-btn-action {
          display:inline-flex; align-items:center; gap:.35rem;
          font-family:'Outfit',sans-serif; font-weight:700; font-size:.78rem;
          padding:.38rem .9rem; border-radius:99px; border:none;
          cursor:pointer; transition:transform .15s, box-shadow .15s;
        }
        .ss-btn-action:hover { transform:translateY(-1px); }

        .ss-empty {
          background:#fff; border:1px solid #e2e8f0; border-radius:16px;
          padding:3rem; text-align:center; color:#94a3b8; font-size:.9rem;
        }

        /* ── MODAL ── */
        .ss-overlay {
          position:fixed; inset:0; background:rgba(10,31,68,.55);
          backdrop-filter:blur(4px); z-index:1000;
          display:flex; align-items:center; justify-content:center; padding:1.5rem;
        }
        .ss-modal {
          background:#fff; border-radius:20px; padding:2rem;
          width:100%; max-width:480px; max-height:90vh; overflow-y:auto;
          box-shadow:0 24px 64px rgba(0,0,0,.2);
          animation:ss-slidein .25s ease;
        }
        .ss-modal-header {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:1.5rem;
        }
        .ss-modal-header h2 {
          font-family:'Outfit',sans-serif; font-weight:800; font-size:1.1rem; color:#0a1f44; margin:0;
        }
        .ss-modal-close {
          width:32px; height:32px; border-radius:50%; border:none;
          background:#f1f5f9; color:#64748b; font-size:1.1rem;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:background .2s;
        }
        .ss-modal-close:hover { background:#e2e8f0; }

        .ss-field { margin-bottom:1rem; }
        .ss-field label { display:block; font-family:'Outfit',sans-serif; font-weight:700; font-size:.82rem; color:#374151; margin-bottom:.4rem; }
        .ss-input, .ss-mselect {
          width:100%; padding:.65rem 1rem;
          border:1.5px solid #e2e8f0; border-radius:10px;
          font-family:'Sora',sans-serif; font-size:.9rem; color:#1e293b;
          outline:none; transition:border-color .2s;
          background:#f8fafc;
          box-sizing: border-box;
        }
        .ss-input:focus, .ss-mselect:focus { border-color:#16a34a; }

        .ss-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:.6rem; }

        .ss-modal-submit {
          width:100%; padding:.8rem; margin-top:.5rem;
          background:linear-gradient(135deg,#16a34a,#22c55e);
          color:#fff; border:none; border-radius:12px;
          font-family:'Outfit',sans-serif; font-weight:800; font-size:.95rem;
          cursor:pointer; box-shadow:0 4px 14px rgba(22,163,74,.35);
          transition:transform .2s, box-shadow .2s;
        }
        .ss-modal-submit:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(22,163,74,.45); }

        @media (max-width:768px) {
          .ss-stats { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      <div className="ss-page">

        {/* ── HEADER ── */}
        <div className="ss-header">
          <div className="ss-header-inner">
            <button className="ss-back" onClick={() => navigate(-1)}>← Retour</button>
            <div className="ss-header-top">
              <div>
                <div className="ss-header-tag">👨‍👩‍👧‍👦 Espace Autorité</div>
                <h1>Suivi des <span>sinistrés</span></h1>
                <p>Gestion des familles touchées par les inondations</p>
              </div>
              <button className="ss-btn-add" onClick={() => { setShowForm(true); setEditingId(null); setFormData(EMPTY_FORM); }}>
                + Nouveau sinistré
              </button>
            </div>
          </div>
          <div className="ss-wave">
            <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0,20 C480,50 960,0 1440,25 L1440,50 L0,50 Z" fill="#f1f5f9"/>
            </svg>
          </div>
        </div>

        <div className="ss-body">

          {/* ── STATS ── */}
          <div className="ss-label">Vue d'ensemble</div>
          <div className="ss-stats">
            {[
              { icon:'👨‍👩‍👧‍👦', num:stats.total,        color:'#0a1f44', border:'#1a56db', label:'Familles'       },
              { icon:'👥',       num:totalPersonnes,   color:'#7c3aed', border:'#7c3aed', label:'Personnes'      },
              { icon:'⏳',       num:stats.enAttente,  color:'#d97706', border:'#f59e0b', label:'En attente'     },
              { icon:'✅',       num:stats.prisEnCharge,color:'#16a34a', border:'#16a34a', label:'Pris en charge' },
              { icon:'🏠',       num:stats.reloge,      color:'#2563eb', border:'#2563eb', label:'Relogés'        },
            ].map((s,i) => (
              <div className="ss-stat" key={i} style={{ borderTop:`4px solid ${s.border}` }}>
                <span className="ss-stat-icon">{s.icon}</span>
                <div className="ss-stat-num" style={{ color:s.color }}>{s.num}</div>
                <div className="ss-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── TOOLBAR ── */}
          <div className="ss-label">Filtres</div>
          <div className="ss-toolbar">
            <div className="ss-filters">
              {FILTERS.map(f => (
                <button key={f.key} className={`ss-filter-btn ${filterStatut === f.key ? 'active' : ''}`} onClick={() => setFilterStatut(f.key)}>
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
            <span className="ss-count">{filtered.length} famille{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* ── LISTE ── */}
          <div className="ss-label">Liste des familles</div>
          <div className="ss-list">
            {filtered.length === 0 ? (
              <div className="ss-empty">Aucune famille enregistrée pour ce filtre.</div>
            ) : filtered.map(s => {
              const sc  = STATUT_CONFIG[s.statut] || STATUT_CONFIG.en_attente;
              const bc  = BESOINS_CONFIG[s.besoins];
              return (
                <div className="ss-card" key={s.id}>
                  <div className="ss-card-header">
                    <div className="ss-card-left">
                      <span className="ss-card-name">{s.nom_famille}</span>
                      <span className="ss-pers-badge">👥 {s.nombre_personnes} pers.</span>
                    </div>
                    <div className="ss-card-actions">
                      <span className="ss-statut-badge" style={{ background:sc.bg, color:sc.color, borderColor:sc.border }}>
                        {sc.icon} {sc.text}
                      </span>
                      <button className="ss-btn-icon" style={{ background:'#eff6ff', color:'#2563eb' }}
                        onClick={() => { setEditingId(s.id); setFormData(s); setShowForm(true); }}>✏️</button>
                      <button className="ss-btn-icon" style={{ background:'#fef2f2', color:'#dc2626' }}
                        onClick={() => deleteSinistre(s.id)}>🗑️</button>
                    </div>
                  </div>

                  <div className="ss-card-body">
                    {bc && (
                      <span className="ss-info-chip" style={{ background:bc.bg, color:bc.color }}>
                        {bc.icon} {bc.label}
                      </span>
                    )}
                    {s.heberge_dans && (
                      <span className="ss-info-chip" style={{ background:'#f0fdf4', color:'#16a34a' }}>
                        🏠 {s.heberge_dans}
                      </span>
                    )}
                    {s.telephone && (
                      <span className="ss-info-chip" style={{ background:'#f8fafc', color:'#475569' }}>
                        📞 {s.telephone}
                      </span>
                    )}
                  </div>

                  <div className="ss-card-footer">
                    <span className="ss-coords">
                      📍 Loc : {s.quartier && s.ville ? `${s.quartier} (${s.ville})` : s.quartier || s.ville || 'Non renseignée'}
                    </span>
                    {s.statut === 'en_attente' && (
                      <div className="ss-action-btns">
                        <button className="ss-btn-action" style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', color:'#fff', boxShadow:'0 2px 8px rgba(22,163,74,.3)' }}
                          onClick={() => updateStatut(s.id, 'pris_en_charge')}>
                          ✅ Prendre en charge
                        </button>
                        <button className="ss-btn-action" style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)', color:'#fff', boxShadow:'0 2px 8px rgba(37,99,235,.3)' }}
                          onClick={() => updateStatut(s.id, 'reloge')}>
                          🏠 Marquer relogé
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MODAL FORMULAIRE ── */}
      {showForm && (
        <div className="ss-overlay" onClick={() => setShowForm(false)}>
          <div className="ss-modal" onClick={e => e.stopPropagation()}>
            <div className="ss-modal-header">
              <h2>{editingId ? '✏️ Modifier le sinistré' : '➕ Nouveau sinistré'}</h2>
              <button className="ss-modal-close" onClick={() => { setShowForm(false); setEditingId(null); }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="ss-field">
                <label>👨‍👩‍👧‍👦 Nom de la famille *</label>
                <input className="ss-input" type="text" placeholder="Ex: Famille AHOUNOU" required
                  value={formData.nom_famille} onChange={e => setFormData({...formData, nom_famille:e.target.value})} />
              </div>
              <div className="ss-field">
                <label>👥 Nombre de personnes *</label>
                <input className="ss-input" type="number" placeholder="Ex: 5" required
                  value={formData.nombre_personnes} onChange={e => setFormData({...formData, nombre_personnes:e.target.value})} />
              </div>
              <div className="ss-field">
                <label>🆘 Besoins prioritaires</label>
                <select className="ss-mselect" value={formData.besoins} onChange={e => setFormData({...formData, besoins:e.target.value})}>
                  <option value="">Sélectionner un besoin</option>
                  <option value="abri">🏠 Abri</option>
                  <option value="nourriture">🍲 Nourriture</option>
                  <option value="soins">🏥 Soins médicaux</option>
                </select>
              </div>
              <div className="ss-field">
                <label>📞 Téléphone</label>
                <input className="ss-input" type="tel" placeholder="+229 ..."
                  value={formData.telephone} onChange={e => setFormData({...formData, telephone:e.target.value})} />
              </div>
              <div className="ss-field">
                <label>🏠 Hébergé dans</label>
                <input className="ss-input" type="text" placeholder="Centre d'hébergement ou famille d'accueil"
                  value={formData.heberge_dans} onChange={e => setFormData({...formData, heberge_dans:e.target.value})} />
              </div>
              
              {/* Remplacement du GPS par les champs Ville et Quartier en ligne */}
              <div className="ss-field">
                <label>📍 Zone géographique</label>
                <div className="ss-grid-2">
                  <input className="ss-input" type="text" placeholder="Ville (Ex: Cotonou)" required
                    value={formData.ville} onChange={e => setFormData({...formData, ville:e.target.value})} />
                  <input className="ss-input" type="text" placeholder="Quartier (Ex: Agla)" required
                    value={formData.quartier} onChange={e => setFormData({...formData, quartier:e.target.value})} />
                </div>
              </div>

              <button type="submit" className="ss-modal-submit">
                {editingId ? '💾 Mettre à jour' : '✅ Enregistrer le sinistré'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SuiviSinistres;