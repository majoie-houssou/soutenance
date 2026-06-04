


import React from 'react';
import { Link } from 'react-router-dom';
 
const steps = [
  {
    number: '01',
    icon: '📍',
    title: 'Signalez',
    desc: 'Signalez en 2 clics une montée des eaux avec votre position GPS. Chaque signalement citoyen enrichit la carte nationale en temps réel et peut sauver des vies.',
    color: '#1a56db',
  },
  {
    number: '02',
    icon: '🗺️',
    title: 'Visualisez',
    desc: 'Consultez la carte interactive pour voir les zones à risque, les signalements en cours et l\'historique des inondations sur tout le territoire béninois.',
    color: '#06b6d4',
  },
  {
    number: '03',
    icon: '🔔',
    title: 'Recevez',
    desc: 'Abonnez-vous aux alertes géolocalisées et soyez prévenu avant que l\'eau n\'arrive dans votre localité. Les autorités émettent des alertes ciblées.',
    color: '#f59e0b',
  },
];
 
const roles = [
  {
    icon: '👤',
    title: 'Le citoyen',
    items: [
      'Signale une inondation depuis son téléphone',
      'Consulte la carte et les alertes de sa zone',
      'Suit l\'historique des inondations',
      'Reçoit des notifications en temps réel',
    ],
    accent: '#1a56db',
  },
  {
    icon: '🏛️',
    title: 'L\'autorité',
    items: [
      'Valide et gère les signalements reçus',
      'Émet des alertes vers les populations',
      'Suit les sinistres en cours',
      'Génère des rapports officiels',
    ],
    accent: '#06b6d4',
  },
];
 
const team = [
  { name: 'HOUSSOU Majoie', role: 'Co-développeuse', emoji: '👩‍💻' },
  { name: 'KPARKOUGAN Ikilimatou', role: 'Co-développeuse', emoji: '👩‍💻' },
];
 
const Fonctionnement = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Sora:wght@400;500&display=swap');
 
        .fn-page {
          font-family: 'Sora', sans-serif;
          color: #1e293b;
          background: #fff;
        }
 
        /* ── HERO ── */
        .fn-hero {
          background: linear-gradient(135deg, #0a1f44 0%, #0d2d6b 60%, #0f3460 100%);
          padding: 5rem 1.5rem 6rem;
          text-align: center;
          position: relative;
          overflow: hidden;

         
  margin-top: -68px;
  padding-top: calc(6rem + 68px);
        }
        .fn-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 110%, rgba(6,182,212,.18) 0%, transparent 65%);
          pointer-events: none;
        }
        .fn-hero-tag {
          display: inline-block;
          background: rgba(6,182,212,.15);
          border: 1px solid rgba(6,182,212,.3);
          color: #38bdf8;
          font-family: 'Outfit', sans-serif;
          font-size: .78rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          padding: .35rem 1rem;
          border-radius: 99px;
          margin-bottom: 1.4rem;
        }
        .fn-hero h1 {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 900;
          color: #fff;
          margin-bottom: 1rem;
          line-height: 1.15;
        }
        .fn-hero h1 span {
          background: linear-gradient(90deg, #38bdf8, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .fn-hero p {
          color: rgba(255,255,255,.72);
          font-size: 1.05rem;
          max-width: 540px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .fn-wave {
          position: absolute;
          bottom: -2px; left: 0;
          width: 100%; line-height: 0;
        }
 
        /* ── SECTION WRAPPER ── */
        .fn-section {
          padding: 5rem 1.5rem;
        }
        .fn-section--alt { background: #f0f7ff; }
 
        .fn-section-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }
        .fn-tag {
          display: inline-block;
          background: rgba(26,86,219,.1);
          color: #1a56db;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: .78rem;
          letter-spacing: .1em;
          text-transform: uppercase;
          padding: .3rem .9rem;
          border-radius: 99px;
          margin-bottom: .9rem;
        }
        .fn-section-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(1.6rem, 3.5vw, 2.2rem);
          font-weight: 800;
          color: #0a1f44;
          margin-bottom: .6rem;
        }
        .fn-section-sub {
          color: #64748b;
          font-size: 1rem;
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.7;
        }
 
        /* ── STEPS ── */
        .fn-steps {
          display: flex;
          flex-direction: column;
          gap: 0;
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }
        .fn-steps::before {
          content: '';
          position: absolute;
          left: 42px; top: 0; bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, #1a56db, #06b6d4, #f59e0b);
          z-index: 0;
        }
 
        .fn-step {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
          padding: 2rem 0;
          position: relative;
          z-index: 1;
        }
 
        .fn-step-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          width: 86px;
        }
        .fn-step-circle {
          width: 56px; height: 56px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          background: #fff;
          border: 3px solid;
          box-shadow: 0 4px 16px rgba(0,0,0,.1);
          position: relative;
          z-index: 2;
        }
        .fn-step-num {
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: .7rem;
          color: #94a3b8;
          margin-top: .5rem;
          letter-spacing: .08em;
        }
 
        .fn-step-body {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.8rem;
          flex: 1;
          box-shadow: 0 2px 12px rgba(0,0,0,.05);
          transition: transform .25s, box-shadow .25s;
        }
        .fn-step-body:hover {
          transform: translateX(6px);
          box-shadow: 0 6px 24px rgba(0,0,0,.1);
        }
        .fn-step-body h3 {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.15rem;
          color: #0a1f44;
          margin-bottom: .5rem;
        }
        .fn-step-body p {
          color: #64748b;
          font-size: .95rem;
          line-height: 1.7;
        }
 
        /* ── RÔLES ── */
        .fn-roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          max-width: 860px;
          margin: 0 auto;
        }
        .fn-role-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 2.2rem;
          box-shadow: 0 2px 16px rgba(0,0,0,.05);
          transition: transform .25s, box-shadow .25s;
        }
        .fn-role-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 32px rgba(0,0,0,.1);
        }
        .fn-role-header {
          display: flex;
          align-items: center;
          gap: .8rem;
          margin-bottom: 1.4rem;
        }
        .fn-role-icon {
          width: 50px; height: 50px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
        }
        .fn-role-header h3 {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          color: #0a1f44;
        }
        .fn-role-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: .7rem;
        }
        .fn-role-list li {
          display: flex;
          align-items: flex-start;
          gap: .6rem;
          font-size: .92rem;
          color: #475569;
          line-height: 1.5;
        }
        .fn-role-list li::before {
          content: '✓';
          font-weight: 800;
          font-size: .85rem;
          flex-shrink: 0;
          margin-top: .05rem;
        }
 
        /* ── À PROPOS ── */
        .fn-about {
          background: linear-gradient(135deg, #0a1f44 0%, #0d2d6b 100%);
          padding: 5rem 1.5rem;
          text-align: center;
        }
        .fn-about .fn-tag {
          background: rgba(6,182,212,.15);
          color: #38bdf8;
        }
        .fn-about .fn-section-title { color: #fff; }
        .fn-about .fn-section-sub { color: rgba(255,255,255,.7); max-width: 700px; }
 
        .fn-team-grid {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin: 2.5rem auto 0;
          max-width: 600px;
        }
        .fn-team-card {
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 14px;
          padding: 1.8rem 2.2rem;
          text-align: center;
          transition: background .2s, transform .2s;
          min-width: 200px;
        }
        .fn-team-card:hover {
          background: rgba(255,255,255,.12);
          transform: translateY(-4px);
        }
        .fn-team-emoji {
          font-size: 2.4rem;
          display: block;
          margin-bottom: .7rem;
        }
        .fn-team-name {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          color: #fff;
          margin-bottom: .3rem;
        }
        .fn-team-role {
          font-size: .83rem;
          color: #38bdf8;
          font-weight: 500;
        }
 
        .fn-school {
          margin-top: 2.5rem;
          color: rgba(255,255,255,.6);
          font-size: .93rem;
          line-height: 1.7;
        }
        .fn-school strong { color: #fff; }
 
        /* ── CTA ── */
        .fn-cta {
          padding: 5rem 1.5rem;
          text-align: center;
          background: #f0f7ff;
        }
        .fn-cta h2 {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 800;
          color: #0a1f44;
          margin-bottom: .8rem;
        }
        .fn-cta p {
          color: #64748b;
          font-size: 1rem;
          margin-bottom: 2rem;
        }
        .fn-cta-btns {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .fn-btn-primary {
          display: inline-flex; align-items: center; gap: .5rem;
          background: linear-gradient(135deg, #1a56db, #06b6d4);
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-weight: 700; font-size: .95rem;
          padding: .8rem 1.8rem;
          border-radius: 99px;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(6,182,212,.35);
          transition: transform .2s, box-shadow .2s;
        }
        .fn-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(6,182,212,.5); }
 
        .fn-btn-ghost {
          display: inline-flex; align-items: center; gap: .5rem;
          background: #fff;
          border: 1.5px solid #cbd5e1;
          color: #0a1f44;
          font-family: 'Outfit', sans-serif;
          font-weight: 600; font-size: .95rem;
          padding: .8rem 1.8rem;
          border-radius: 99px;
          text-decoration: none;
          transition: border-color .2s, transform .2s;
        }
        .fn-btn-ghost:hover { border-color: #1a56db; transform: translateY(-2px); }
 
        @media (max-width: 600px) {
          .fn-steps::before { left: 28px; }
          .fn-step-left { width: 60px; }
          .fn-step-circle { width: 44px; height: 44px; font-size: 1.2rem; }
          .fn-cta-btns { flex-direction: column; align-items: center; }
        }
      `}</style>
 
      <div className="fn-page">
 
        {/* ── HERO ── */}
        <section className="fn-hero">
          <div className="fn-hero-tag">📖 Guide de la plateforme</div>
          <h1>Comment fonctionne<br /><span>InondoBénin ?</span></h1>
          <p>Une plateforme simple, rapide et accessible à tous pour anticiper et gérer les inondations au Bénin.</p>
          <div className="fn-wave">
            <svg viewBox="0 0 1440 55" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0,25 C360,55 1080,0 1440,28 L1440,55 L0,55 Z" fill="#ffffff"/>
            </svg>
          </div>
        </section>
 
        {/* ── ÉTAPES ── */}
        <section className="fn-section">
          <div className="fn-section-header">
            <div className="fn-tag">Processus</div>
            <h2 className="fn-section-title">3 étapes simples</h2>
            <p className="fn-section-sub">De la détection à l'alerte, voici comment la plateforme protège votre communauté.</p>
          </div>
          <div className="fn-steps">
            {steps.map((s, i) => (
              <div className="fn-step" key={i}>
                <div className="fn-step-left">
                  <div className="fn-step-circle" style={{ borderColor: s.color }}>
                    {s.icon}
                  </div>
                  <span className="fn-step-num">{s.number}</span>
                </div>
                <div className="fn-step-body">
                  <h3 style={{ color: s.color }}>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
 
        {/* ── RÔLES ── */}
        <section className="fn-section fn-section--alt">
          <div className="fn-section-header">
            <div className="fn-tag">Qui fait quoi ?</div>
            <h2 className="fn-section-title">Deux profils, une mission</h2>
            <p className="fn-section-sub">Citoyens et autorités collaborent sur la même plateforme pour une réponse coordonnée.</p>
          </div>
          <div className="fn-roles-grid">
            {roles.map((r, i) => (
              <div className="fn-role-card" key={i} style={{ borderTop: `4px solid ${r.accent}` }}>
                <div className="fn-role-header">
                  <div className="fn-role-icon" style={{ background: `${r.accent}18` }}>
                    {r.icon}
                  </div>
                  <h3>{r.title}</h3>
                </div>
                <ul className="fn-role-list">
                  {r.items.map((item, j) => (
                    <li key={j} style={{ '--check-color': r.accent }}>
                      <span style={{ color: r.accent }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
 
        {/* ── À PROPOS ── */}
        <section className="fn-about">
          <div className="fn-tag">À propos de nous</div>
          <h2 className="fn-section-title">L'équipe derrière InondoBénin</h2>
          <p className="fn-section-sub">
            Une initiative étudiante pour un Bénin plus résilient face aux catastrophes naturelles.
          </p>
          <div className="fn-team-grid">
            {team.map((m, i) => (
              <div className="fn-team-card" key={i}>
                <span className="fn-team-emoji">{m.emoji}</span>
                <div className="fn-team-name">{m.name}</div>
                <div className="fn-team-role">{m.role}</div>
              </div>
            ))}
          </div>
          <p className="fn-school">
            Projet de fin de 3e année · <strong>Institut Universitaire Les Cours SONOU</strong><br />
            🌍 Ensemble, construisons un Bénin plus résilient face aux catastrophes naturelles.
          </p>
        </section>
 
        {/* ── CTA ── */}
       
 
      </div>
    </>
  );
};
 
export default Fonctionnement;