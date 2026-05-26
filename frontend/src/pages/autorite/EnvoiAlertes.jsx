import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EnvoiAlertes = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [zone, setZone] = useState('Littoral');
  const [niveauUrgence, setNiveauUrgence] = useState('info');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [abonnes, setAbonnes] = useState([]);

  const zones = ['Littoral', 'Atlantique', 'Ouémé', 'Mono', 'Couffo', 'Zou', 'Collines', 'Borgou', 'Alibori', 'Atacora', 'Donga'];

  const messagesPredefinis = {
    info: { 
      titre: 'ℹ️ Information', 
      message: '⚠️ Vigilance météo - Fortes pluies attendues dans les prochaines heures. Restez informés via InondoBénin.', 
      couleur: '#3b82f6' 
    },
    vigilance: { 
      titre: '🟡 Vigilance renforcée', 
      message: '🟡 Vigilance orange - Risque modéré d\'inondation dans votre zone. Préparez vos documents et chargez vos téléphones.', 
      couleur: '#eab308' 
    },
    alerte: { 
      titre: '🟠 Alerte orange', 
      message: '🟠 ALERTE ORANGE - Risque élevé d\'inondation. Évacuez si vous êtes en zone basse. Tenez-vous prêts.', 
      couleur: '#f97316' 
    },
    urgence: { 
      titre: '🔴 URGENCE - Alerte rouge', 
      message: '🔴 ALERTE ROUGE - ÉVACUEZ IMMÉDIATEMENT ! L\'eau monte rapidement. Rendez-vous au point de rassemblement le plus proche.', 
      couleur: '#dc2626' 
    }
  };

  useEffect(() => {
    fetchAbonnes();
  }, []);

  const fetchAbonnes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/autorite/abonnes-email', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAbonnes(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const appliquerMessage = (type) => {
    setNiveauUrgence(type);
    setMessage(messagesPredefinis[type].message);
  };

  const envoyerAlerte = async () => {
    if (!message.trim()) {
      setError('Veuillez saisir un message');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/autorite/alertes/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ zone, message, niveauUrgence })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const getStyle = () => {
    switch(niveauUrgence) {
      case 'urgence': return { bg: '#dc2626', color: 'white' };
      case 'alerte': return { bg: '#f97316', color: 'white' };
      case 'vigilance': return { bg: '#eab308', color: '#1e293b' };
      default: return { bg: '#3b82f6', color: 'white' };
    }
  };

  const style = getStyle();

  const abonnesParZone = zones.reduce((acc, z) => {
    acc[z] = abonnes.filter(a => a.departement === z).length;
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <button onClick={() => navigate(-1)} style={{ background: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', marginBottom: '1rem' }}>
          ← Retour
        </button>

        <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
          
          <div style={{ background: '#1e3a8a', padding: '1.5rem', color: 'white', textAlign: 'center' }}>
            <h1 style={{ margin: 0 }}>📧 Alertes Email de masse</h1>
            <p style={{ opacity: 0.9, margin: '0.25rem 0 0' }}>Envoyez des alertes aux populations par email</p>
          </div>

          <div style={{ padding: '1.5rem' }}>
            
            {/* Messages prédéfinis */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>📌 Messages prédéfinis</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => appliquerMessage('info')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>ℹ️ Info</button>
                <button onClick={() => appliquerMessage('vigilance')} style={{ background: '#eab308', color: '#1e293b', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>🟡 Vigilance</button>
                <button onClick={() => appliquerMessage('alerte')} style={{ background: '#f97316', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>🟠 Alerte</button>
                <button onClick={() => appliquerMessage('urgence')} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>🔴 Urgence</button>
              </div>
            </div>

            {/* Zone */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>📍 Zone de diffusion</label>
              <select value={zone} onChange={(e) => setZone(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option value="Tous">📌 Tous les départements ({abonnes.length} abonnés)</option>
                {zones.map(z => <option key={z} value={z}>{z} ({abonnesParZone[z] || 0} abonnés)</option>)}
              </select>
            </div>

            {/* Message */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>✉️ Message d'alerte</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="5"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: `2px solid ${style.bg}`, fontSize: '1rem' }}
                placeholder="Saisissez votre message d'alerte..."
              />
            </div>

            {/* Aperçu */}
            {message && (
              <div style={{ background: style.bg, color: style.color, padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
                <strong>Aperçu de l'email</strong>
                <p style={{ margin: '0.5rem 0 0' }}>{message}</p>
              </div>
            )}

            {/* Messages */}
            {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>✅ Alerte email envoyée avec succès !</div>}
            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>❌ {error}</div>}

            {/* Bouton */}
            <button
              onClick={envoyerAlerte}
              disabled={loading}
              style={{ width: '100%', background: '#dc2626', color: 'white', padding: '1rem', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '⏳ Envoi en cours...' : '📧 ENVOYER L\'ALERTE EMAIL'}
            </button>

            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.7rem', color: '#64748b', textAlign: 'center' }}>
              💡 Les emails sont envoyés avec un template professionnel incluant le niveau d'alerte et la carte des risques.
            </div>
          </div>
        </div>

        {/* Statistiques des abonnés */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1rem', marginTop: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e3a8a' }}>📊 Statistiques des abonnés email</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
            <div style={{ textAlign: 'center', padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3a8a' }}>{abonnes.length}</div>
              <div style={{ fontSize: '0.7rem' }}>Total abonnés</div>
            </div>
            {Object.entries(abonnesParZone).slice(0, 6).map(([zoneName, count]) => (
              <div key={zoneName} style={{ textAlign: 'center', padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{zoneName}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{count} abonnés</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvoiAlertes;