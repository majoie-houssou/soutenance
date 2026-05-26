import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AlertesLocalite = () => {
  const navigate = useNavigate();
  const [commune, setCommune] = useState('');
  const [searchCommune, setSearchCommune] = useState('');
  const [alerte, setAlerte] = useState(null);
  const [signalements, setSignalements] = useState([]);
  const [consignes, setConsignes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const communesBenin = [
    'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Grand-Popo',
    'Sèmè-Kraké', 'Lokossa', 'Bohicon', 'Natitingou', 'Kandi'
  ];

  const getNiveauAlerteStyle = (niveau) => {
    switch(niveau) {
      case 'alerte_rouge':
        return { bg: '#dc2626', color: 'white', text: '🔴 ALERTE ROUGE', level: 'rouge' };
      case 'alerte_orange':
        return { bg: '#f97316', color: 'white', text: '🟠 ALERTE ORANGE', level: 'orange' };
      case 'vigilance_renforcee':
        return { bg: '#eab308', color: '#1e293b', text: '🟡 VIGILANCE RENFORCÉE', level: 'jaune' };
      default:
        return { bg: '#22c55e', color: 'white', text: '🟢 VIGILANCE NORMALE', level: 'vert' };
    }
  };

  const rechercherAlerte = async () => {
    if (!searchCommune) {
      setError('Veuillez entrer une commune');
      return;
    }

    setLoading(true);
    setError('');
    setCommune(searchCommune);

    try {
      const token = localStorage.getItem('token');
      
      // Récupérer l'alerte pour cette commune
      const alerteRes = await fetch(`http://localhost:5000/api/public/alertes/commune/${searchCommune}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (alerteRes.ok) {
        const alerteData = await alerteRes.json();
        setAlerte(alerteData);
        
        // Récupérer les consignes selon le niveau d'alerte
        if (alerteData && alerteData.niveau_alerte) {
          const consignesRes = await fetch(`http://localhost:5000/api/public/consignes/${alerteData.niveau_alerte}`);
          if (consignesRes.ok) {
            const consignesData = await consignesRes.json();
            setConsignes(consignesData);
          }
        }
      } else {
        setAlerte(null);
        setConsignes([]);
      }
      
      // Récupérer les signalements récents dans cette zone  
      const signalementsRes = await fetch(`http://localhost:5000/api/signalements/commune/${searchCommune}`);
      if (signalementsRes.ok) {
        const signalementsData = await signalementsRes.json();
        setSignalements(signalementsData);
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const styleAlerte = alerte ? getNiveauAlerteStyle(alerte.niveau_alerte) : null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <button onClick={() => navigate(-1)} style={{ background: '#e2e8f0', border: 'none', color: '#1e3a8a', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', marginBottom: '1.5rem' }}>
          ← Retour
        </button>

        <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ background: '#1e3a8a', padding: '1.5rem', textAlign: 'center', color: 'white' }}>
            <h1 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              ⚠️ Alertes par localité
            </h1>
            <p style={{ opacity: 0.9, margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
              Consultez la situation dans votre commune
            </p>
          </div>

          <div style={{ padding: '1.5rem' }}>
            
            {/* Barre de recherche */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Entrez le nom de votre commune"
                  value={searchCommune}
                  onChange={(e) => setSearchCommune(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                  onKeyPress={(e) => e.key === 'Enter' && rechercherAlerte()}
                />
                <button
                  onClick={rechercherAlerte}
                  style={{ background: '#1e3a8a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                >
                  🔍 Rechercher
                </button>
              </div>
              
              {/* Suggestions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {communesBenin.map(c => (
                  <button
                    key={c}
                    onClick={() => { setSearchCommune(c); rechercherAlerte(); }}
                    style={{ background: '#f1f5f9', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                <p>Chargement des informations...</p>
              </div>
            )}

            {error && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                ❌ {error}
              </div>
            )}

            {!loading && commune && (
              <>
                {/* Niveau d'alerte */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>📍 Commune : <strong>{commune}</strong></h3>
                  {alerte ? (
                    <div style={{ background: styleAlerte.bg, color: styleAlerte.color, padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{styleAlerte.text}</div>
                      <p style={{ marginTop: '0.5rem' }}>{alerte.message}</p>
                    </div>
                  ) : (
                    <div style={{ background: '#e2e8f0', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                      Aucune alerte active pour cette commune actuellement.
                    </div>
                  )}
                </div>

                {/* Signalements récents */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ marginBottom: '0.75rem', color: '#1e293b' }}>📋 Signalements récents dans le secteur</h3>
                  {signalements.length === 0 ? (
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
                      Aucun signalement récent dans cette zone.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {signalements.slice(0, 5).map(s => (
                        <div key={s.id} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '600' }}>
                              {s.niveau_eau === 'critique' ? '🔴' : s.niveau_eau === 'maisons_touchees' ? '🟠' : '🟡'} {s.niveau_eau === 'critique' ? 'Critique' : s.niveau_eau === 'maisons_touchees' ? 'Maisons touchées' : 'Chaussée inondée'}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(s.date_creation).toLocaleString()}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{s.description || 'Aucune description'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Consignes de sécurité */}
                {consignes.length > 0 && (
                  <div>
                    <h3 style={{ marginBottom: '0.75rem', color: '#1e293b' }}>📖 Consignes de sécurité</h3>
                    <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                      {consignes.map(c => (
                        <p key={c.id} style={{ marginBottom: '0.5rem' }}>✅ {c.contenu}</p>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {!loading && !commune && !error && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <p>Entrez le nom de votre commune pour voir les alertes</p>
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

export default AlertesLocalite;