import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const getNiveauConfig = (niveau) => {
  switch (niveau) {
    case 'critique':        return { bg:'#fef2f2', color:'#dc2626', border:'#fca5a5', text:'Critique',         couleur:'#dc2626' };
    case 'maisons_touchees':return { bg:'#fff7ed', color:'#ea580c', border:'#fdba74', text:'Maisons touchées', couleur:'#f97316' };
    default:                return { bg:'#fefce8', color:'#ca8a04', border:'#fde047', text:'Chaussée inondée', couleur:'#eab308' };
  }
};

const getStatutConfig = (statut) => {
  switch (statut) {
    case 'en_attente': return { bg:'#fffbeb', color:'#d97706', border:'#fcd34d', text:'En attente' };
    case 'confirme':   return { bg:'#f0fdf4', color:'#16a34a', border:'#86efac', text:'Confirmé'   };
    default:           return { bg:'#f1f5f9', color:'#64748b', border:'#cbd5e1', text: statut      };
  }
};

const formatDate = (d) => new Date(d).toLocaleString('fr-FR', {
  day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
});

const FILTERS = [
  { key:'all',       label:'Tous',        icon:'📌' },
  { key:'en_attente',label:'En attente',  icon:'⏳' },
  { key:'confirme',  label:'Confirmés',   icon:'✅' },
  { key:'critique',  label:'Critiques',   icon:'🚨' },
];

const GestionSignalements = () => {
  const navigate = useNavigate();
  const [signalements, setSignalements] = useState([]);
  const [stats, setStats] = useState({ total: 0, enAttente: 0, confirmes: 0, critiques: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);

  useEffect(() => { fetchSignalements(); }, []);

  const fetchSignalements = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Récupération signalements...');
      const res   = await fetch('http://localhost:5000/api/signalements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`Erreur HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log('✅ Données brutes reçues:', data);
      console.log('Type de data:', Array.isArray(data) ? 'Array' : typeof data);
      
      // S'assurer que data est un array
      const signalementsList = Array.isArray(data) ? data : data.data || [];
      console.log('📊 Nombre de signalements:', signalementsList.length);
      
      setSignalements(signalementsList);
      setStats({
        total:     signalementsList.length,
        enAttente: signalementsList.filter(s => s.statut === 'en_attente').length,
        confirmes: signalementsList.filter(s => s.statut === 'confirme').length,
        critiques: signalementsList.filter(s => s.niveau_eau === 'critique').length,
      });
    } catch (e) { 
      console.error('❌ Erreur complète:', e);
      console.error('Stack:', e.stack);
      setError(e.message);
    }
    finally { setLoading(false); }
  };

  const updateStatut = async (id, statut) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/signalements/${id}/statut`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ statut }),
      });
      fetchSignalements();
    } catch (e) { console.error(e); }
  };

  const filtered = signalements.filter(s => {
    if (filter === 'all')        return true;
    if (filter === 'en_attente') return s.statut === 'en_attente';
    if (filter === 'confirme')   return s.statut === 'confirme';
    if (filter === 'critique')   return s.niveau_eau === 'critique';
    return true;
  });

  if (loading) return (
    <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem', fontFamily:'Sora,sans-serif' }}>
      <div style={{ width:44, height:44, border:'4px solid #e2e8f0', borderTopColor:'#1a56db', borderRadius:'50%', animation:'spin .9s linear infinite' }} />
      <p style={{ color:'#64748b', fontWeight:600 }}>Chargement des signalements...</p>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fee2e2', padding:'2rem' }}>
      <div style={{ background:'white', padding:'2rem', borderRadius:'12px', maxWidth:'500px', textAlign:'center' }}>
        <h2 style={{ color:'#dc2626' }}>❌ Erreur</h2>
        <p>{error}</p>
        <button onClick={() => fetchSignalements()} style={{ background:'#3b82f6', color:'white', border:'none', padding:'0.5rem 1rem', borderRadius:'6px', cursor:'pointer' }}>
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background:'#f1f5f9', minHeight:'100vh', padding:'1rem' }}>
      <style>{`
        @media (min-width: 640px) {
          body { padding: 1.5rem; }
        }
        @media (min-width: 1024px) {
          body { padding: 2rem; }
        }
      `}</style>
      <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
        
        {/* HEADER */}
        <div style={{ background:'white', padding:'1rem', borderRadius:'12px', marginBottom:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
          <button onClick={() => navigate(-1)} style={{ background:'#e2e8f0', border:'none', color:'#1e3a8a', padding:'0.5rem 1rem', borderRadius:'50px', cursor:'pointer', marginBottom:'1rem', fontSize:'0.9rem' }}>
            ← Retour
          </button>
          <h1 style={{ color:'#1e3a8a', margin:'0 0 0.5rem', fontSize:'clamp(1.5rem, 5vw, 2rem)' }}>📋 Gestion des signalements</h1>
          <p style={{ color:'#64748b', margin:0, fontSize:'0.9rem' }}>{stats.total} signalements au total</p>
        </div>

        {/* STATS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:'0.75rem', marginBottom:'1.5rem' }}>
          {[
            { icon:'📊', num:stats.total,     label:'Total' },
            { icon:'⏳', num:stats.enAttente, label:'En attente' },
            { icon:'✅', num:stats.confirmes, label:'Confirmés' },
            { icon:'🚨', num:stats.critiques, label:'Critiques' },
          ].map((item, i) => (
            <div key={i} style={{ background:'white', padding:'1rem', borderRadius:'12px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
              <div style={{ fontSize:'1.5rem', marginBottom:'0.25rem' }}>{item.icon}</div>
              <div style={{ fontSize:'clamp(1.3rem, 4vw, 1.8rem)', fontWeight:'bold', color:'#0a1f44', marginBottom:'0.25rem' }}>{item.num}</div>
              <div style={{ fontSize:'0.75rem', color:'#64748b' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* FILTRES */}
        <div style={{ background:'white', padding:'0.75rem', borderRadius:'12px', marginBottom:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,.04)', overflowX:'auto' }}>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', justifyContent:'center' }}>
            {[
              { key:'all', label:'Tous', icon:'📌' },
              { key:'en_attente', label:'En attente', icon:'⏳' },
              { key:'confirme', label:'Confirmés', icon:'✅' },
              { key:'critique', label:'Critiques', icon:'🚨' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding:'0.4rem 0.8rem',
                  borderRadius:'50px',
                  border: filter === f.key ? 'none' : '1px solid #e2e8f0',
                  background: filter === f.key ? '#0a1f44' : 'white',
                  color: filter === f.key ? 'white' : '#475569',
                  cursor:'pointer',
                  fontWeight:'600',
                  fontSize:'0.8rem',
                  whiteSpace:'nowrap'
                }}
              >
                {f.icon} <span style={{ display:'none' }}>{f.label}</span><span style={{ display:'inline' }}>{f.label}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop:'0.75rem', color:'#64748b', fontSize:'0.85rem', textAlign:'center' }}>
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* LISTE DES SIGNALEMENTS */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ background:'white', padding:'2rem', borderRadius:'12px', textAlign:'center', color:'#94a3b8', fontSize:'0.9rem' }}>
              Aucun signalement trouvé pour ce filtre.
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {filtered.map(s => (
                <div key={s.id} style={{ background:'white', padding:'1rem', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem', flexWrap:'wrap', gap:'0.5rem' }}>
                    <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                      <span style={{ background:'#fef3c7', color:'#d97706', padding:'0.2rem 0.5rem', borderRadius:'50px', fontSize:'0.65rem', fontWeight:'600', whiteSpace:'nowrap' }}>
                        {s.niveau_eau === 'critique' ? '🚨 Critique' : s.niveau_eau === 'maisons_touchees' ? '🟠 Maisons' : '🟡 Chaussée'}
                      </span>
                      <span style={{ background: s.statut === 'en_attente' ? '#fffbeb' : '#f0fdf4', color: s.statut === 'en_attente' ? '#d97706' : '#16a34a', padding:'0.2rem 0.5rem', borderRadius:'50px', fontSize:'0.65rem', fontWeight:'600', whiteSpace:'nowrap' }}>
                        {s.statut === 'en_attente' ? '⏳ Attente' : '✅ OK'}
                      </span>
                    </div>
                    <span style={{ fontSize:'0.65rem', color:'#94a3b8', whiteSpace:'nowrap' }}>
                      {new Date(s.date_creation).toLocaleString('fr-FR', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })}
                    </span>
                  </div>

                  <div style={{ marginBottom:'1rem', color:'#475569', fontSize:'0.8rem' }}>
                    <p style={{ margin:'0.25rem 0' }}><strong>📍</strong> {s.lieu || 'Position inconnue'}</p>
                    {s.description && <p style={{ margin:'0.25rem 0' }}><strong>📝</strong> {s.description.substring(0, 80)}...</p>}
                    <p style={{ margin:'0.25rem 0' }}><strong>👤</strong> {s.citoyens ? `${s.citoyens.nom} ${s.citoyens.prenom || ''}` : 'Anonyme'}</p>
                  </div>

                  {s.statut === 'en_attente' && (
                    <button 
                      onClick={() => updateStatut(s.id, 'confirme')}
                      style={{ background:'#16a34a', color:'white', border:'none', padding:'0.4rem 0.8rem', borderRadius:'6px', cursor:'pointer', fontWeight:'600', fontSize:'0.8rem', width:'100%' }}
                    >
                      ✅ Confirmer
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionSignalements;