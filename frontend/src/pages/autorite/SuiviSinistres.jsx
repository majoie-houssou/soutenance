import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SuiviSinistres = () => {
  const navigate = useNavigate();
  const [sinistres, setSinistres] = useState([]);
  const [stats, setStats] = useState({ total: 0, enAttente: 0, prisEnCharge: 0, reloge: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nom_famille: '',
    nombre_personnes: '',
    besoins: '',
    telephone: '',
    heberge_dans: '',
    latitude: '',
    longitude: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    fetchSinistres();
  }, []);

  const fetchSinistres = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/sinistres', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSinistres(data);
      
      // Calculer les statistiques
      setStats({
        total: data.length,
        enAttente: data.filter(s => s.statut === 'en_attente').length,
        prisEnCharge: data.filter(s => s.statut === 'pris_en_charge').length,
        reloge: data.filter(s => s.statut === 'reloge').length
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `http://localhost:5000/api/sinistres/${editingId}`
        : 'http://localhost:5000/api/sinistres';
      
      const method = editingId ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ nom_famille: '', nombre_personnes: '', besoins: '', telephone: '', heberge_dans: '', latitude: '', longitude: '' });
      fetchSinistres();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const updateStatut = async (id, statut) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/sinistres/${id}/statut`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ statut })
      });
      fetchSinistres();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const deleteSinistre = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce sinistré ?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/sinistres/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchSinistres();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData({
            ...formData,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6)
          });
          setShowLocationModal(false);
        },
        () => alert('Activez la géolocalisation')
      );
    } else {
      alert('Géolocalisation non supportée');
    }
  };

  const getBesoinsIcon = (besoins) => {
    switch(besoins) {
      case 'abri': return '🏠';
      case 'nourriture': return '🍲';
      case 'soins': return '🏥';
      default: return '📦';
    }
  };

  const getStatutBadge = (statut) => {
    switch(statut) {
      case 'en_attente': return { bg: '#fef3c7', color: '#d97706', text: '⏳ En attente' };
      case 'pris_en_charge': return { bg: '#dcfce7', color: '#16a34a', text: '✅ Pris en charge' };
      case 'reloge': return { bg: '#dbeafe', color: '#2563eb', text: '🏠 Relogé' };
      default: return { bg: '#e2e8f0', color: '#64748b', text: '📌 Autre' };
    }
  };

  const filtrerParStatut = (statut) => {
    if (statut === 'all') return sinistres;
    return sinistres.filter(s => s.statut === statut);
  };

  const [filterStatut, setFilterStatut] = useState('all');
  const sinistresFiltres = filtrerParStatut(filterStatut);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Chargement des sinistrés...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Bouton retour */}
        <button onClick={() => navigate(-1)} style={{ background: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', marginBottom: '1rem' }}>
          ← Retour
        </button>

        {/* En-tête */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ color: '#1e3a8a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                👨‍👩‍👧‍👦 Suivi des sinistrés
              </h1>
              <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>Gestion des familles touchées par les inondations</p>
            </div>
            <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ nom_famille: '', nombre_personnes: '', besoins: '', telephone: '', heberge_dans: '', latitude: '', longitude: '' }); }} style={{ background: '#1e3a8a', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
              + Nouveau sinistré
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>{stats.total}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Total familles</div>
          </div>
          <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d97706' }}>{stats.enAttente}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>En attente</div>
          </div>
          <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>{stats.prisEnCharge}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Pris en charge</div>
          </div>
          <div style={{ background: '#dbeafe', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{stats.reloge}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Relogés</div>
          </div>
        </div>

        {/* Filtres */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => setFilterStatut('all')} style={{ background: filterStatut === 'all' ? '#1e3a8a' : '#e2e8f0', color: filterStatut === 'all' ? 'white' : '#475569', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '50px', cursor: 'pointer' }}>📌 Tous</button>
            <button onClick={() => setFilterStatut('en_attente')} style={{ background: filterStatut === 'en_attente' ? '#d97706' : '#fef3c7', color: filterStatut === 'en_attente' ? 'white' : '#d97706', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '50px', cursor: 'pointer' }}>⏳ En attente</button>
            <button onClick={() => setFilterStatut('pris_en_charge')} style={{ background: filterStatut === 'pris_en_charge' ? '#16a34a' : '#dcfce7', color: filterStatut === 'pris_en_charge' ? 'white' : '#16a34a', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '50px', cursor: 'pointer' }}>✅ Pris en charge</button>
            <button onClick={() => setFilterStatut('reloge')} style={{ background: filterStatut === 'reloge' ? '#2563eb' : '#dbeafe', color: filterStatut === 'reloge' ? 'white' : '#2563eb', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '50px', cursor: 'pointer' }}>🏠 Relogés</button>
          </div>
        </div>

        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '24px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, color: '#1e3a8a' }}>{editingId ? '✏️ Modifier' : '➕ Nouveau sinistré'}</h2>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Nom de la famille *" value={formData.nom_famille} onChange={(e) => setFormData({...formData, nom_famille: e.target.value})} required style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                <input type="number" placeholder="Nombre de personnes *" value={formData.nombre_personnes} onChange={(e) => setFormData({...formData, nombre_personnes: e.target.value})} required style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                <select value={formData.besoins} onChange={(e) => setFormData({...formData, besoins: e.target.value})} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option value="">Besoins</option>
                  <option value="abri">🏠 Abri</option>
                  <option value="nourriture">🍲 Nourriture</option>
                  <option value="soins">🏥 Soins médicaux</option>
                </select>
                <input type="tel" placeholder="Téléphone" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                <input type="text" placeholder="Hébergé dans (centre/famille)" value={formData.heberge_dans} onChange={(e) => setFormData({...formData, heberge_dans: e.target.value})} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <input type="text" placeholder="Latitude" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input type="text" placeholder="Longitude" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <button type="button" onClick={getCurrentLocation} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>📍</button>
                </div>
                <button type="submit" style={{ width: '100%', background: '#22c55e', color: 'white', padding: '0.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  {editingId ? '💾 Mettre à jour' : '✅ Enregistrer'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Liste des sinistrés */}
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ background: '#1e3a8a', padding: '1rem', color: 'white' }}>
            <h3 style={{ margin: 0 }}>📋 Liste des familles sinistrées</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            {sinistresFiltres.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Aucune famille enregistrée</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sinistresFiltres.map(s => {
                  const statutBadge = getStatutBadge(s.statut);
                  return (
                    <div key={s.id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '1rem' }}>{s.nom_famille}</strong>
                          <span style={{ marginLeft: '0.5rem', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '50px', fontSize: '0.7rem' }}>
                            👥 {s.nombre_personnes} pers.
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ background: statutBadge.bg, color: statutBadge.color, padding: '0.2rem 0.5rem', borderRadius: '50px', fontSize: '0.7rem' }}>
                            {statutBadge.text}
                          </span>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button onClick={() => { setEditingId(s.id); setFormData(s); setShowForm(true); }} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' }}>✏️</button>
                            <button onClick={() => deleteSinistre(s.id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' }}>🗑️</button>
                          </div>
                        </div>
                      </div>
                      <div>
                        {s.besoins && <span style={{ marginRight: '0.5rem', fontSize: '0.8rem' }}>{getBesoinsIcon(s.besoins)} {s.besoins === 'abri' ? 'Besoin d\'abri' : s.besoins === 'nourriture' ? 'Besoin de nourriture' : s.besoins === 'soins' ? 'Besoin de soins' : ''}</span>}
                        {s.heberge_dans && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>🏠 Hébergé: {s.heberge_dans}</span>}
                        {s.telephone && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>📞 {s.telephone}</span>}
                      </div>
                      {s.latitude && s.longitude && (
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>📍 {parseFloat(s.latitude).toFixed(4)}, {parseFloat(s.longitude).toFixed(4)}</div>
                      )}
                      {s.statut === 'en_attente' && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => updateStatut(s.id, 'pris_en_charge')} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' }}>✅ Prendre en charge</button>
                          <button onClick={() => updateStatut(s.id, 'reloge')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' }}>🏠 Marquer comme relogé</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SuiviSinistres;