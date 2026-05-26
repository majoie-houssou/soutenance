import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const GestionSignalements = () => {
  const navigate = useNavigate();
  const [signalements, setSignalements] = useState([]);
  const [stats, setStats] = useState({ total: 0, enAttente: 0, confirmes: 0, critiques: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchSignalements();
  }, []);

  const fetchSignalements = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/signalements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSignalements(data);
      
      setStats({
        total: data.length,
        enAttente: data.filter(s => s.statut === 'en_attente').length,
        confirmes: data.filter(s => s.statut === 'confirme').length,
        critiques: data.filter(s => s.niveau_eau === 'critique').length
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (id, statut) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/signalements/${id}/statut`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ statut })
      });
      fetchSignalements();
    } catch (error) {
      console.error(error);
    }
  };

  const getNiveauBadge = (niveau) => {
    switch(niveau) {
      case 'critique': return { bg: '#fee2e2', color: '#dc2626', text: '🔴 Critique', icon: '🔴', couleur: '#dc2626' };
      case 'maisons_touchees': return { bg: '#ffedd5', color: '#ea580c', text: '🟠 Maisons touchées', icon: '🟠', couleur: '#f97316' };
      default: return { bg: '#fef9c3', color: '#ca8a04', text: '🟡 Chaussée inondée', icon: '🟡', couleur: '#eab308' };
    }
  };

  const getStatutBadge = (statut) => {
    switch(statut) {
      case 'en_attente': return { bg: '#fef3c7', color: '#d97706', text: '⏳ En attente' };
      case 'confirme': return { bg: '#dcfce7', color: '#16a34a', text: '✅ Confirmé' };
      default: return { bg: '#e2e8f0', color: '#64748b', text: '📌 Autre' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSignalements = signalements.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'en_attente') return s.statut === 'en_attente';
    if (filter === 'confirme') return s.statut === 'confirme';
    if (filter === 'critique') return s.niveau_eau === 'critique';
    return true;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Chargement des signalements...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Bouton retour */}
        <button onClick={() => navigate(-1)} style={{ background: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', marginBottom: '1rem' }}>
          ← Retour
        </button>

        {/* En-tête */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ color: '#1e3a8a', margin: 0 }}>📋 Gestion des signalements</h1>
              <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>{stats.total} signalements reçus au total</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setShowMap(!showMap)} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
                {showMap ? '📋 Voir liste' : '🗺️ Voir sur la carte'}
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>{stats.total}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Total</div>
          </div>
          <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d97706' }}>{stats.enAttente}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>En attente</div>
          </div>
          <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>{stats.confirmes}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Confirmés</div>
          </div>
          <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>{stats.critiques}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Critiques</div>
          </div>
        </div>

        {/* Filtres */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => setFilter('all')} style={{ background: filter === 'all' ? '#1e3a8a' : '#e2e8f0', color: filter === 'all' ? 'white' : '#475569', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '50px', cursor: 'pointer' }}>📌 Tous</button>
            <button onClick={() => setFilter('en_attente')} style={{ background: filter === 'en_attente' ? '#d97706' : '#fef3c7', color: filter === 'en_attente' ? 'white' : '#d97706', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '50px', cursor: 'pointer' }}>⏳ En attente</button>
            <button onClick={() => setFilter('confirme')} style={{ background: filter === 'confirme' ? '#16a34a' : '#dcfce7', color: filter === 'confirme' ? 'white' : '#16a34a', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '50px', cursor: 'pointer' }}>✅ Confirmés</button>
            <button onClick={() => setFilter('critique')} style={{ background: filter === 'critique' ? '#dc2626' : '#fee2e2', color: filter === 'critique' ? 'white' : '#dc2626', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '50px', cursor: 'pointer' }}>🔴 Critiques</button>
          </div>
        </div>

        {/* Carte */}
        {showMap ? (
          <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ background: '#1e3a8a', padding: '1rem', color: 'white' }}>
              <h3 style={{ margin: 0 }}>🗺️ Signalements sur la carte</h3>
            </div>
            <div style={{ padding: '1rem' }}>
              <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                <MapContainer center={[6.37, 2.42]} zoom={9} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {filteredSignalements.map((s) => {
                    if (!s.latitude || !s.longitude) return null;
                    const lat = parseFloat(s.latitude);
                    const lng = parseFloat(s.longitude);
                    if (isNaN(lat) || isNaN(lng)) return null;
                    const niveau = getNiveauBadge(s.niveau_eau);
                    return (
                      <Marker
                        key={s.id}
                        position={[lat, lng]}
                        icon={L.divIcon({
                          html: `<div style="background-color: ${niveau.couleur}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
                          iconSize: [14, 14]
                        })}
                      >
                        <Popup>
                          <div style={{ minWidth: '220px' }}>
                            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: niveau.couleur }}>🚨 {niveau.text}</p>
                            <p style={{ margin: '2px 0' }}><strong>📍 Lieu:</strong> {s.lieu || 'Position inconnue'}</p>
                            <p style={{ margin: '2px 0' }}><strong>📅 Date:</strong> {formatDate(s.date_creation)}</p>
                            <p style={{ margin: '2px 0' }}><strong>⏱️ Statut:</strong> {s.statut === 'en_attente' ? 'En attente' : 'Confirmé'}</p>
                            {s.description && <p style={{ margin: '2px 0' }}><strong>📝 Description:</strong> {s.description}</p>}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#dc2626', borderRadius: '50%', marginRight: '4px' }}></span> Critique</span>
                <span style={{ fontSize: '0.7rem' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#f97316', borderRadius: '50%', marginRight: '4px' }}></span> Maisons touchées</span>
                <span style={{ fontSize: '0.7rem' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#eab308', borderRadius: '50%', marginRight: '4px' }}></span> Chaussée inondée</span>
              </div>
            </div>
          </div>
        ) : (
          /* Liste des signalements */
          <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ background: '#1e3a8a', padding: '1rem', color: 'white' }}>
              <h3 style={{ margin: 0 }}>📋 Liste des signalements</h3>
            </div>
            <div style={{ padding: '1rem' }}>
              {filteredSignalements.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Aucun signalement trouvé</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredSignalements.map(s => {
                    const niveau = getNiveauBadge(s.niveau_eau);
                    const statut = getStatutBadge(s.statut);
                    const lieu = s.lieu || 'Position inconnue';
                    return (
                      <div key={s.id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ background: niveau.bg, color: niveau.color, padding: '0.25rem 0.5rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '500' }}>
                            {niveau.text}
                          </span>
                          <span style={{ background: statut.bg, color: statut.color, padding: '0.25rem 0.5rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '500' }}>
                            {statut.text}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{formatDate(s.date_creation)}</span>
                        </div>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}>
                          <strong>📍 Lieu:</strong> {lieu}
                        </p>
                        {s.description && (
                          <p style={{ margin: '0.25rem 0', fontSize: '0.8rem', color: '#64748b' }}>
                            <strong>📝 Description:</strong> {s.description}
                          </p>
                        )}
                        {s.citoyens && (
                          <p style={{ margin: '0.25rem 0', fontSize: '0.7rem', color: '#94a3b8' }}>
                            👤 Signalé par: {s.citoyens.nom} {s.citoyens.prenom || ''}
                          </p>
                        )}
                        {s.statut === 'en_attente' && (
                          <button 
                            onClick={() => updateStatut(s.id, 'confirme')} 
                            style={{ marginTop: '0.5rem', background: '#22c55e', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem' }}
                          >
                            ✅ Confirmer
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GestionSignalements;