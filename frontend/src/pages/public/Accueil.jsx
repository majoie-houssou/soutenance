import React from 'react';
import { Link } from 'react-router-dom';

// Importer les images locales
import inondation1 from '../../assets/images/inondation1.jpg';
import inondation2 from '../../assets/images/inondation2.jpg';
import inondation3 from '../../assets/images/inondation3.jpg';
import inondation4 from '../../assets/images/inondation4.jpg';

const imagesInondations = [
  { src: inondation1, titre: "Inondation à Cotonou" },
  { src: inondation2, titre: "Inondation à Kétou" },
  { src: inondation3, titre: "Inondation à Ouémé" },
  { src: inondation4, titre: "Inondation à Bohicon" }
];

const Accueil = () => {
  return (
    <div>
      {/* HERO */}
      <div className="hero">
        <h1>🌊 InondoBénin</h1>
        <p>La première plateforme nationale de cartographie, de signalement et d'alerte précoce contre les inondations au Bénin</p>
        <div className="hero-buttons">
          <Link to="/carte" className="btn-carte">🗺️ Explorer la carte</Link>
        </div>
      </div>

      {/* STATISTIQUES */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-number">10+</div>
          <div className="stat-label">Zones à risque</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">562k</div>
          <div className="stat-label">Personnes protégées</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">24/7</div>
          <div className="stat-label">Surveillance continue</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">30-50%</div>
          <div className="stat-label">Réduction des pertes</div>
        </div>
      </div>

      {/* TEXTE DE PRÉSENTATION (objectif général) */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#1e3a8a', marginBottom: '1rem' }}>🎯 Notre objectif</h2>
        <p style={{ color: '#4b5563', lineHeight: '1.7', fontSize: '1.1rem' }}>
          InondoBénin vise à <strong>réduire les pertes humaines et matérielles</strong> causées par les inondations récurrentes au Bénin. 
          Grâce à une <strong>cartographie dynamique</strong>, un <strong>signalement citoyen en temps réel</strong> et un <strong>système d'alerte précoce</strong>, 
          nous permettons aux populations et aux autorités d'anticiper et de réagir efficacement face aux catastrophes naturelles.
        </p>
      </div>

      {/* GALERIE IMAGES INONDATIONS */}
      <div className="galerie">
        <h2>📸 Inondations au Bénin</h2>
        <div className="galerie-grid">
          {imagesInondations.map((item, index) => (
            <div key={index} className="galerie-card">
              <img src={item.src} alt={item.titre} />
              <p>{item.titre}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Accueil;