import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignalerPublic = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [niveauEau, setNiveauEau] = useState('');
  const [description, setDescription] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => alert('Activez la géolocalisation')
      );
    } else {
      alert('Géolocalisation non supportée');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      setError('Veuillez partager votre position');
      return;
    }
    if (!niveauEau) {
      setError('Veuillez sélectionner le niveau d\'eau');
      return;
    }
    if (!telephone) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Créer le compte citoyen + envoyer le signalement
      const response = await fetch('http://localhost:5000/api/public/inscription-signalement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telephone,
          motDePasse: motDePasse || 'citoyen123',
          nom: nom || 'Citoyen',
          latitude: position.lat,
          longitude: position.lng,
          niveau_eau: niveauEau,
          description
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Connexion automatique
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', 'CITOYEN');
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccess(true);
        setTimeout(() => navigate('/citoyen/dashboard'), 2000);
      } else {
        setError(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem' }}>✅</div>
          <h2>Inscription et signalement réussis !</h2>
          <p>Redirection vers votre espace citoyen...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Retour</button>

        <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
          <h1 style={{ color: '#1e3a8a', textAlign: 'center' }}>🚨 Inscription & Signalement</h1>
          <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Créez votre compte citoyen et signalez une inondation en même temps</p>

          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label>📞 Votre numéro de téléphone *</label>
              <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="22990123456" required style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>👤 Votre nom (optionnel)</label>
              <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Jean DJIMASSO" style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>🔑 Mot de passe (optionnel, défaut: citoyen123)</label>
              <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} placeholder="Laissez vide pour un mot de passe automatique" style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
            </div>

            <hr style={{ margin: '1rem 0' }} />

            <div style={{ marginBottom: '1rem' }}>
              <label>📍 Position GPS *</label>
              <button type="button" onClick={getLocation} style={{ width: '100%', background: '#3b82f6', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                {position ? '✓ Position enregistrée' : '📱 Partager ma position'}
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>💧 Niveau d'eau *</label>
              <select value={niveauEau} onChange={(e) => setNiveauEau(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option value="">Sélectionner</option>
                <option value="leger">💧 Chaussée inondée</option>
                <option value="maisons_touchees">🏠 Maisons touchées</option>
                <option value="critique">⚠️ Situation critique</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>📝 Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} placeholder="Décrivez la situation..." />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', background: '#dc2626', color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Inscription en cours...' : '🚨 SIGNALER & S\'INSCRIRE'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
            Déjà un compte ? <a href="/connexion">Connectez-vous</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignalerPublic;