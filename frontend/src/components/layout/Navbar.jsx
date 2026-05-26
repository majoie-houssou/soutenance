import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getRole, logout } from '../../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const role = getRole();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span>🌊</span>
        <span>InondoBénin</span>
      </Link>
      
      <div className="nav-links">
        <Link to="/">Accueil</Link>
        <Link to="/fonctionnement">Fonctionnement</Link>
        <Link to="/carte">Carte</Link>
        
        {!authenticated ? (
          <Link to="/connexion" className="btn-connexion">🔐 Connexion</Link>
        ) : (
          <>
            {role === 'CITOYEN' && (
              <Link to="/citoyen/dashboard" className="btn-connexion">👤 Dashboard</Link>
            )}
            {role === 'AUTORITE' && (
              <Link to="/autorite/dashboard" className="btn-connexion">🏛️ Dashboard</Link>
            )}
            <button onClick={handleLogout} className="btn-deconnexion">🚪 Déconnexion</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;