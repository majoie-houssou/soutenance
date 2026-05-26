import React from 'react';

const Fonctionnement = () => {
  return (
    <div className="fonctionnement-container">
      <h1 className="fonctionnement-title">📖 Comment ça marche ?</h1>
      <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>
        InondoBénin en 3 étapes simples pour protéger votre communauté
      </p>

      <div className="steps-grid">
        <div className="step-card">
          <div className="step-icon">📍</div>
          <h3>1. Signalez</h3>
          <p>Signalez en 2 clics une montée des eaux avec votre position GPS. Votre signalement sauve des vies.</p>
        </div>
        <div className="step-card">
          <div className="step-icon">🗺️</div>
          <h3>2. Visualisez</h3>
          <p>Consultez la carte interactive pour voir les zones à risque et les signalements en temps réel.</p>
        </div>
        <div className="step-card">
          <div className="step-icon">📱</div>
          <h3>3. Recevez</h3>
          <p>Abonnez-vous aux alertes SMS et soyez prévenu avant que l'eau n'arrive.</p>
        </div>
      </div>

      {/* À PROPOS DE NOUS (enrichi) */}
      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', color: '#1e3a8a', marginBottom: '1rem' }}>🤝 À propos de nous</h2>
        <p style={{ maxWidth: '800px', margin: '0 auto', color: '#4b5563', lineHeight: '1.7' }}>
          InondoBénin est une plateforme innovante développée par <strong>HOUSSOU Majoie</strong> et <strong>KPARKOUGAN Ikilimatou</strong>, 
          deux étudiantes passionnées dans le cadre d'un projet de fin de 3e année à la <strong>Sonatel Academy</strong>.
        </p>
        <p style={{ maxWidth: '800px', margin: '1rem auto', color: '#4b5563', lineHeight: '1.7' }}>
          Notre mission est de fournir au Bénin un outil de <strong>prévention et de gestion des inondations</strong> accessible à tous, 
          en impliquant citoyens et autorités dans une dynamique participative. Nous croyons que la technologie peut sauver des vies.
        </p>
        <p style={{ maxWidth: '800px', margin: '0 auto', color: '#4b5563', lineHeight: '1.7' }}>
          🌍 Ensemble, construisons un Bénin plus résilient face aux catastrophes naturelles.
        </p>
      </div>
    </div>
  );
};

export default Fonctionnement;