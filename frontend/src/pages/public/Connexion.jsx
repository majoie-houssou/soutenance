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
      
      // 🚨 FIX : On s'assure que les données de session sont bien stockées localement
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      
      // On recrée l'objet user attendu par ton dashboard pour éviter les erreurs "undefined"
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        nom: data.nom || 'Citoyen',
        email: data.email || (identifiant.includes('@') ? identifiant : '')
      }));

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
  <div className="ib-login-page">
    <style>{`
      .ib-login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        padding: 2rem;
      }

      .ib-login-card {
        width: 100%;
        max-width: 420px;
        background: linear-gradient(135deg, #0a1f44, #1a56db);
        border: 1px solid rgba(56, 189, 248, 0.25);
        backdrop-filter: blur(12px);
        border-radius: 16px;
        padding: 2.5rem 2rem;
        box-shadow: 0 10px 40px rgba(0,0,0,0.35);
        color: #fff;
      }

      .ib-login-title {
        text-align: center;
        margin-bottom: 1.8rem;
      }

      .ib-login-title span {
        font-size: 2rem;
      }

      .ib-login-title h1 {
        font-family: 'Outfit', sans-serif;
        font-size: 1.8rem;
        margin: 0.5rem 0;
      }

      .ib-login-title p {
        font-size: 0.9rem;
        opacity: 0.75;
      }

      .ib-login-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .ib-login-form input {
        padding: 0.9rem 1rem;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.2);
        background: rgba(255,255,255,0.05);
        color: #fff;
        outline: none;
        transition: 0.2s;
      }

      .ib-login-form input::placeholder {
        color: rgba(255,255,255,0.6);
      }

      .ib-login-form input:focus {
        border-color: #06b6d4;
        background: rgba(255,255,255,0.08);
      }

      .ib-login-btn {
        padding: 0.9rem;
        border: none;
        border-radius: 999px;
        background: linear-gradient(135deg, #1a56db, #06b6d4);
        color: #fff;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .ib-login-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(6,182,212,0.4);
      }

      .ib-login-error {
        background: rgba(239,68,68,0.15);
        color: #fca5a5;
        padding: 0.8rem;
        border-radius: 10px;
        text-align: center;
        margin-bottom: 1rem;
        border: 1px solid rgba(239,68,68,0.3);
      }

      .ib-login-footer {
        margin-top: 1.5rem;
        font-size: 0.85rem;
        text-align: center;
        opacity: 0.8;
      }

      .ib-login-footer a {
        color: #38bdf8;
        text-decoration: none;
        font-weight: 600;
      }
    `}</style>

    <div className="ib-login-card">
      <div className="ib-login-title">
        <span>🔐</span>
        <h1>Connexion</h1>
        <p>Accédez à votre espace citoyen ou autorité</p>
      </div>

      {error && <div className="ib-login-error">{error}</div>}

      <form className="ib-login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Téléphone ou Email"
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

        <button type="submit" className="ib-login-btn" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="ib-login-footer">
        Vous n’avez pas de compte ?{' '}
        <a href="/inscription">Inscrivez-vous ici</a> {/* Mis à jour vers ta route pure inscription */}
      </div>
    </div>
  </div>
);
};

export default Connexion;