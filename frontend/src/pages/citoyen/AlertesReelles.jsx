import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';

const AlertesReelles = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [alerte, setAlerte] = useState(null);
  const [consignes, setConsignes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commune, setCommune] = useState(user?.commune || 'Cotonou');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const communesBenin = [
    'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Grand-Popo',
    'Sèmè-Kraké', 'Lokossa', 'Bohicon', 'Natitingou', 'Kandi'
  ];

  useEffect(() => {
    fetchAlertes();
    const interval = setInterval(() => {
      fetchAlertes();
      setLastUpdate(new Date());
    }, 30000); // Rafraîchissement toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, [commune]);

  const fetchAlertes = async () => {
    try {
      // Récupérer l'alerte de la commune
      const alerteRes = await fetch(`http://localhost:5000/api/public/alertes/commune/${commune}`);
      if (alerteRes.ok) {
        const alerteData = await alerteRes.json();
        setAlerte(alerteData);
        
        // Récupérer les consignes associées
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
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNiveauStyle = (niveau) => {
    switch(niveau) {
      case 'alerte_rouge':
        return { bg: '#dc2626', color: 'white', text: '🔴 ALERTE ROUGE', level: 'rouge', icon: '🔴', animation: 'pulse 2s infinite' };
      case 'alerte_orange':
        return { bg: '#f97316', color: 'white', text: '🟠 ALERTE ORANGE', level: 'orange', icon: '🟠', animation: 'none' };
      case 'vigilance_renforcee':
        return { bg: '#eab308', color: '#1e293b', text: '🟡 VIGILANCE RENFORCÉE', level: 'jaune', icon: '🟡', animation: 'none' };
      default:
        return { bg: '#22c55e', color: 'white', text: '🟢 VIGILANCE NORMALE', level: 'vert', icon: '🟢', animation: 'none' };
    }
  };

  const handleCommuneChange = (newCommune) => {
    setCommune(newCommune);
    setLoading(true);
  };

  const styleAlerte = alerte ? getNiveauStyle(alerte.niveau_alerte) : getNiveauStyle('vigilance_normale');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Chargement des alertes...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        
        <button onClick={() => navigate(-1)} style={{ background: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', marginBottom: '1rem' }}>
          ← Retour
        </button>

        <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
          
          <div style={{ background: '#1e3a8a', padding: '1.5rem', color: 'white', textAlign: 'center' }}>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              ⚡ Alertes en temps réel
            </h1>
            <p style={{ opacity: 0.9, margin: '0.5rem 0 0', fontSize: '0.8rem' }}>
              Niveau d'alerte actuel dans votre localité
            </p>
          </div>

          <div style={{ padding: '1.5rem' }}>
            
            {/* Sélecteur de commune */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>📍 Votre localité</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <select 
                  value={commune} 
                  onChange={(e) => handleCommuneChange(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #ccc', fontSize: '1rem' }}
                >
                  {communesBenin.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button 
                  onClick={() => { setLoading(true); fetchAlertes(); }}
                  style={{ background: '#1e3a8a', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}
                >
                  🔄 Rafraîchir
                </button>
              </div>
            </div>

            {/* Niveau d'alerte actuel */}
            <div style={{ 
              background: styleAlerte.bg, 
              color: styleAlerte.color, 
              borderRadius: '20px', 
              padding: '2rem', 
              marginBottom: '1.5rem',
              textAlign: 'center',
              animation: styleAlerte.animation,
              transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{styleAlerte.icon}</div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{styleAlerte.text}</h2>
              {alerte ? (
                <>
                  <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{alerte.message}</p>
                  {alerte.consignes && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                      <strong>📋 Consigne :</strong> {alerte.consignes}
                    </div>
                  )}
                </>
              ) : (
                <p>Aucune alerte active pour votre localité actuellement.</p>
              )}
              <p style={{ marginTop: '1rem', fontSize: '0.7rem', opacity: 0.8 }}>
                Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
              </p>
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

            {/* Info rafraîchissement */}
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#dbeafe', borderRadius: '12px', textAlign: 'center', fontSize: '0.7rem', color: '#1e3a8a' }}>
              🔄 Les alertes sont mises à jour automatiquement toutes les 30 secondes
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};

export default AlertesReelles;