import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Inscription = () => {
  const navigate = useNavigate();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [commune, setCommune] = useState('Cotonou'); // Valeur par défaut initiale
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nom || !email || !telephone || !motDePasse) {
      setError('Veuillez remplir tous les champs obligatoires (*).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: email.toLowerCase().trim(),
          telephone: telephone.trim(),
          commune: commune,
          motDePasse
        })
      });

      const data = await response.json();

      if (response.ok) {
        // 🚨 FIX : Stockage complet de la session pour satisfaire les Routes Protégées et le Dashboard
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role || 'CITOYEN');
        
        // On construit l'objet complet attendu par React
        localStorage.setItem('user', JSON.stringify({
          id: data.id,
          nom: data.nom || nom,
          prenom: data.prenom || prenom,
          email: data.email || email
        }));
        
        // Redirection vers le tableau de bord
        navigate('/citoyen/dashboard');
      } else {
        setError(data.message || data.error || "Une erreur est survenue lors de l'inscription.");
      }
    } catch (err) {
      console.error(err);
      setError('Erreur de connexion au serveur. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '500px', width: '100%', margin: '0 auto' }}>
        
        <button 
          onClick={() => navigate(-1)} 
          style={{ marginBottom: '1rem', background: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', fontWeight: '500', color: '#1e3a8a' }}
        >
          ← Retour
        </button>

        <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
          <h1 style={{ color: '#1e3a8a', textAlign: 'center', margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>🔐 Créer un compte Citoyen</h1>
          <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#64748b', fontSize: '0.95rem' }}>
            Rejoignez la plateforme **Inondo** pour suivre les alertes et gérer vos abonnements.
          </p>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: '500' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.4rem', color: '#334155' }}>Nom *</label>
              <input 
                type="text" 
                value={nom} 
                onChange={(e) => setNom(e.target.value)} 
                placeholder="ex: HOUSSOU" 
                required 
                style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }} 
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.4rem', color: '#334155' }}>Prénom</label>
              <input 
                type="text" 
                value={prenom} 
                onChange={(e) => setPrenom(e.target.value)} 
                placeholder="ex: Marie-Joie" 
                style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }} 
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.4rem', color: '#334155' }}>Adresse Email *</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="ex: mariejoie@gmail.com" 
                required 
                style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }} 
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.4rem', color: '#334155' }}>Numéro de téléphone *</label>
              <input 
                type="tel" 
                value={telephone} 
                onChange={(e) => setTelephone(e.target.value)} 
                placeholder="ex: +229 90 00 00 00" 
                required 
                style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }} 
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.4rem', color: '#334155' }}>Commune de résidence</label>
              <select 
                value={commune} 
                onChange={(e) => setCommune(e.target.value)} 
                style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', outline: 'none', fontSize: '1rem' }}
              >
                <option value="Cotonou">Cotonou</option>
                <option value="Abomey-Calavi">Abomey-Calavi</option>
                <option value="Sô-Ava">Sô-Ava</option>
                <option value="Ouidah">Ouidah</option>
                <option value="Grand-Popo">Grand-Popo</option>
                <option value="Malanville">Malanville</option>
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.4rem', color: '#334155' }}>Mot de passe *</label>
              <input 
                type="password" 
                value={motDePasse} 
                onChange={(e) => setMotDePasse(e.target.value)} 
                placeholder="Créer un mot de passe sécurisé" 
                required 
                style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }} 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{ width: '100%', background: '#1e3a8a', color: 'white', padding: '0.85rem', borderRadius: '10px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', border: 'none', fontSize: '1.05rem', opacity: loading ? 0.7 : 1, transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)' }}
            >
              {loading ? 'Création de votre compte...' : "S'INSCRIRE"}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
            Vous avez déjà un compte ? <a href="/connexion" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>Connectez-vous</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Inscription;