import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';

const Connexion = () => {
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(identifiant, motDePasse);
      
      // Redirection selon le rôle
      if (data.role === 'CITOYEN') {
        navigate('/citoyen/dashboard');
      } else if (data.role === 'AUTORITE') {
        navigate('/autorite/dashboard');
      }
    } catch (err) {
      setError(err.message || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-title">
          <span>🔐</span>
          <h1>Connexion</h1>
          <p>Accédez à votre espace citoyen ou autorités</p>
        </div>
        
        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.8rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Téléphone (citoyen) ou Email (autorité)" 
            value={identifiant} 
            onChange={(e) => setIdentifiant(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Mot de passe" 
            value={motDePasse} 
            onChange={(e) => setMotDePasse(e.target.value)} 
            required 
          />
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' }}>
          Vous n'avez pas de compte citoyen ? 
          <a href="/signaler" style={{ color: '#1e3a8a', marginLeft: '0.3rem' }}>Inscrivez-vous via votre premier signalement</a>
        </p>
      </div>
    </div>
  );
};

export default Connexion;