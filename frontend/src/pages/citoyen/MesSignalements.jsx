import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MesSignalements = () => {
  const navigate = useNavigate();
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSignalements = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Vous devez être connecté');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/citoyen/mes-signalements', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Données reçues:', data);
          setSignalements(data);
        } else if (response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
        } else {
          setError('Erreur lors du chargement des signalements');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur de connexion au serveur');
      } finally {
        setLoading(false);
      }
    };

    fetchSignalements();
  }, []);

  const getStatusBadge = (statut) => {
    switch(statut) {
      case 'en_attente': return { bg: '#fef3c7', color: '#d97706', text: '⏳ En attente' };
      case 'confirme': return { bg: '#dcfce7', color: '#16a34a', text: '✅ Confirmé' };
      case 'ignore': return { bg: '#fee2e2', color: '#dc2626', text: '❌ Ignoré' };
      default: return { bg: '#e2e8f0', color: '#64748b', text: '📌 Autre' };
    }
  };

  const getNiveauBadge = (niveau) => {
    switch(niveau) {
      case 'critique': return { bg: '#fee2e2', color: '#dc2626', icon: '🔴', text: 'Critique' };
      case 'maisons_touchees': return { bg: '#ffedd5', color: '#ea580c', icon: '🟠', text: 'Maisons touchées' };
      default: return { bg: '#fef9c3', color: '#ca8a04', icon: '🟡', text: 'Chaussée inondée' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour formater les coordonnées (Decimal → Number)
  const formatCoordonnees = (lat, lng) => {
    if (!lat || !lng) return 'Position inconnue';
    const latNum = typeof lat === 'number' ? lat : parseFloat(lat);
    const lngNum = typeof lng === 'number' ? lng : parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) return 'Position inconnue';
    return `${latNum.toFixed(6)}, ${lngNum.toFixed(6)}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#64748b' }}>Chargement de vos signalements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '2rem', borderRadius: '24px', maxWidth: '400px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Erreur</h2>
          <p style={{ color: '#64748b' }}>{error}</p>
          <button onClick={() => navigate('/connexion')} style={{ marginTop: '1rem', background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer' }}>
            Se reconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <button onClick={() => navigate(-1)} style={{ background: '#e2e8f0', border: 'none', color: '#1e3a8a', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', marginBottom: '1.5rem' }}>
          ← Retour
        </button>

        <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ background: '#1e3a8a', padding: '1.5rem', textAlign: 'center', color: 'white' }}>
            <h1 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              📋 Mes signalements
            </h1>
            <p style={{ opacity: 0.9, margin: '0.5rem 0 0', fontSize: '0.85rem' }}>{signalements.length} signalement(s) effectué(s)</p>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {signalements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                <h3 style={{ color: '#1e293b' }}>Aucun signalement</h3>
                <p style={{ color: '#64748b' }}>Vous n'avez pas encore effectué de signalement.</p>
                <button onClick={() => navigate('/citoyen/signaler')} style={{ marginTop: '1rem', background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer' }}>
                  + Faire un signalement
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {signalements.map((s) => {
                  const status = getStatusBadge(s.statut);
                  const niveau = getNiveauBadge(s.niveau_eau);
                  const adresse = formatCoordonnees(s.latitude, s.longitude);
                  
                  return (
                    <div key={s.id} style={{ background: '#f8fafc', borderRadius: '16px', padding: '1rem', border: '1px solid #e2e8f0', transition: 'all 0.3s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ background: niveau.bg, color: niveau.color, padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '500' }}>
                            {niveau.icon} {niveau.text}
                          </span>
                          <span style={{ background: status.bg, color: status.color, padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '500' }}>
                            {status.text}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{formatDate(s.date_creation)}</span>
                      </div>
                      <p style={{ margin: '0 0 0.25rem', fontWeight: '600', color: '#1e293b' }}>📍 {adresse}</p>
                      {s.description && <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>{s.description}</p>}
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

export default MesSignalements;