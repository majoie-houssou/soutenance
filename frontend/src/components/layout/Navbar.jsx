import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getRole, logout } from '../../services/authService';
 
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authenticated = isAuthenticated();
  const role = getRole();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
 
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
 
  // Fermer le menu mobile à chaque changement de route
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
 
  const handleLogout = () => {
    logout();
    navigate('/');
  };
 
  const isActive = (path) => location.pathname === path;
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Sora:wght@400;500&display=swap');
 
        .ib-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          transition: background .3s, box-shadow .3s, padding .3s;
          padding: 0 2rem;
          font-family: 'Sora', sans-serif;
        }
 
        /* transparent sur le hero, solide après scroll */
        .ib-nav.ib-nav--top {
          background: rgba(10, 31, 68, 0.97);
  backdrop-filter: blur(12px);
        }
        .ib-nav.ib-nav--scrolled {
         background: rgba(10, 31, 68, 0.97);
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 24px rgba(0,0,0,.25);
        }
 
        .ib-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
 
        /* ── LOGO ── */
        .ib-nav-logo {
          display: flex;
          align-items: center;
          gap: .55rem;
          text-decoration: none;
          flex-shrink: 0;
        }
        .ib-nav-logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #1a56db, #06b6d4);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 2px 10px rgba(6,182,212,.4);
          flex-shrink: 0;
        }
        .ib-nav-logo-text {
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: 1.25rem;
          color: #fff;
          letter-spacing: -.02em;
        }
        .ib-nav-logo-text span {
          color: #38bdf8;
        }
 
        /* ── LIENS ── */
        .ib-nav-links {
          display: flex;
          align-items: center;
          gap: .25rem;
          list-style: none;
        }
 
        .ib-nav-links a {
          position: relative;
          color: rgba(255,255,255,.78);
          text-decoration: none;
          font-size: .92rem;
          font-weight: 500;
          padding: .45rem .85rem;
          border-radius: 8px;
          transition: color .2s, background .2s;
          white-space: nowrap;
        }
        .ib-nav-links a:hover {
          color: #fff;
          background: rgba(255,255,255,.08);
        }
        .ib-nav-links a.ib-active {
          color: #38bdf8;
          background: rgba(56,189,248,.1);
          font-weight: 600;
        }
 
        /* séparateur visuel */
        .ib-nav-sep {
          width: 1px;
          height: 22px;
          background: rgba(255,255,255,.15);
          margin: 0 .5rem;
          flex-shrink: 0;
        }
 
        /* ── BOUTONS DROITE ── */
        .ib-nav-actions {
          display: flex;
          align-items: center;
          gap: .6rem;
          flex-shrink: 0;
        }
 
        .ib-btn-dash {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.2);
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: .88rem;
          padding: .5rem 1.1rem;
          border-radius: 99px;
          text-decoration: none;
          transition: background .2s, transform .2s;
          white-space: nowrap;
        }
        .ib-btn-dash:hover {
          background: rgba(255,255,255,.18);
          transform: translateY(-1px);
        }
 
        .ib-btn-cnx {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          background: linear-gradient(135deg, #1a56db, #06b6d4);
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: .88rem;
          padding: .5rem 1.3rem;
          border-radius: 99px;
          text-decoration: none;
          box-shadow: 0 2px 12px rgba(6,182,212,.35);
          transition: transform .2s, box-shadow .2s;
          white-space: nowrap;
        }
        .ib-btn-cnx:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 18px rgba(6,182,212,.5);
        }
 
        .ib-btn-logout {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          background: rgba(239,68,68,.12);
          border: 1px solid rgba(239,68,68,.3);
          color: #fca5a5;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: .88rem;
          padding: .5rem 1.1rem;
          border-radius: 99px;
          cursor: pointer;
          transition: background .2s, transform .2s;
          white-space: nowrap;
        }
        .ib-btn-logout:hover {
          background: rgba(239,68,68,.22);
          transform: translateY(-1px);
        }
 
        /* ── BURGER (mobile) ── */
        .ib-burger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: .4rem;
          background: none;
          border: none;
          z-index: 1010;
        }
        .ib-burger span {
          display: block;
          width: 24px;
          height: 2px;
          background: #fff;
          border-radius: 2px;
          transition: transform .3s, opacity .3s;
        }
        .ib-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .ib-burger.open span:nth-child(2) { opacity: 0; }
        .ib-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
 
        /* ── MENU MOBILE ── */
        .ib-mobile-menu {
          display: none;
          position: fixed;
          top: 68px; left: 0; right: 0;
          background: rgba(10,31,68,.97);
          backdrop-filter: blur(12px);
          padding: 1.5rem 2rem 2rem;
          flex-direction: column;
          gap: .5rem;
          border-top: 1px solid rgba(255,255,255,.1);
          box-shadow: 0 8px 32px rgba(0,0,0,.3);
          z-index: 999;
        }
        .ib-mobile-menu.open { display: flex; }
 
        .ib-mobile-menu a,
        .ib-mobile-menu button {
          color: rgba(255,255,255,.85);
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          padding: .75rem 1rem;
          border-radius: 10px;
          transition: background .2s, color .2s;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: 'Sora', sans-serif;
          width: 100%;
        }
        .ib-mobile-menu a:hover,
        .ib-mobile-menu button:hover {
          background: rgba(255,255,255,.08);
          color: #fff;
        }
        .ib-mobile-menu a.ib-active {
          color: #38bdf8;
          background: rgba(56,189,248,.1);
        }
        .ib-mobile-menu .ib-mob-sep {
          height: 1px;
          background: rgba(255,255,255,.1);
          margin: .5rem 0;
        }
        .ib-mobile-menu .ib-mob-cnx {
          background: linear-gradient(135deg, #1a56db, #06b6d4);
          color: #fff !important;
          font-weight: 700 !important;
          text-align: center !important;
          border-radius: 99px !important;
          margin-top: .5rem;
        }
        .ib-mobile-menu .ib-mob-logout {
          color: #fca5a5 !important;
        }
 
        /* ── SPACER pour compenser le fixed ── */
        .ib-nav-spacer { height: 68px; }
 
        @media (max-width: 820px) {
          .ib-nav-links, .ib-nav-sep, .ib-nav-actions { display: none; }
          .ib-burger { display: flex; }
        }
      `}</style>
 
      <nav className={`ib-nav ${scrolled ? 'ib-nav--scrolled' : 'ib-nav--top'}`}>
        <div className="ib-nav-inner">
 
          {/* Logo */}
          <Link to="/" className="ib-nav-logo">
            <div className="ib-nav-logo-icon">🌊</div>
            <span className="ib-nav-logo-text">Inondo<span>Bénin</span></span>
          </Link>
 
          {/* Liens centre */}
          <ul className="ib-nav-links">
            <li><Link to="/" className={isActive('/') ? 'ib-active' : '' }> Accueil </Link></li>
            <li><Link to="/fonctionnement" className={isActive('/fonctionnement') ? 'ib-active' : ''}>Fonctionnement</Link></li>
            <li><Link to="/carte" className={isActive('/carte') ? 'ib-active' : ''}>🗺️ Carte</Link></li>
            
          </ul>
 
          <div className="ib-nav-sep" />
 
          {/* Actions droite */}
          <div className="ib-nav-actions">
            {!authenticated ? (
              <Link to="/connexion" className="ib-btn-cnx">🔐 Connexion</Link>
            ) : (
              <>
                {role === 'CITOYEN' && (
                  <Link to="/citoyen/dashboard" className="ib-btn-dash">👤 Mon espace</Link>
                )}
                {role === 'AUTORITE' && (
                  <Link to="/autorite/dashboard" className="ib-btn-dash">🏛️ Administration</Link>
                )}
                <button onClick={handleLogout} className="ib-btn-logout">🚪 Déconnexion</button>
              </>
            )}
          </div>
 
          {/* Burger mobile */}
          <button
            className={`ib-burger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
 
        </div>
      </nav>
 
      {/* Menu mobile déroulant */}
      <div className={`ib-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/" className={isActive('/') ? 'ib-active' : ''}>🏠 Accueil</Link>
        <Link to="/fonctionnement" className={isActive('/fonctionnement') ? 'ib-active' : ''}>ℹ️ Fonctionnement</Link>
        <Link to="/carte" className={isActive('/carte') ? 'ib-active' : ''}>🗺️ Carte interactive</Link>
       
        <div className="ib-mob-sep" />
        {!authenticated ? (
          <Link to="/connexion" className="ib-mob-cnx">🔐 Connexion / Inscription</Link>
        ) : (
          <>
            {role === 'CITOYEN' && <Link to="/citoyen/dashboard">👤 Mon espace citoyen</Link>}
            {role === 'AUTORITE' && <Link to="/autorite/dashboard">🏛️ Administration</Link>}
            <button onClick={handleLogout} className="ib-mob-logout">🚪 Déconnexion</button>
          </>
        )}
      </div>
 
      {/* Spacer pour ne pas masquer le contenu sous le header fixe */}
      <div className="ib-nav-spacer" />
    </>
  );
};
 
export default Navbar;