import React, { useEffect, useRef, useState } from 'react';
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
  { src: inondation4, titre: "Inondation à Bohicon" },
];
 
/* ── compteur animé ── */
function useCounter(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}
 
const stats = [
  { value: 10, suffix: '+', label: 'Zones à risque', icon: '📍' },
  { value: 562, suffix: 'k', label: 'Personnes protégées', icon: '🛡️' },
  { value: 24, suffix: '/7', label: 'Surveillance continue', icon: '👁️' },
  { value: 50, suffix: '%', label: 'Réduction des pertes', icon: '📉' },
];
 
function StatCard({ value, suffix, label, icon, animate }) {
  const count = useCounter(value, 1600, animate);
  return (
    <div className="ib-stat-card">
      <span className="ib-stat-icon">{icon}</span>
      <div className="ib-stat-number">
        {animate ? count : 0}{suffix}
      </div>
      <div className="ib-stat-label">{label}</div>
    </div>
  );
}
 
const features = [
  {
    icon: '🗺️',
    title: 'Cartographie dynamique',
    desc: 'Visualisez en temps réel les zones inondées sur une carte interactive couvrant l\'ensemble du territoire béninois.',
  },
  {
    icon: '📡',
    title: 'Signalement citoyen',
    desc: 'Tout citoyen peut signaler une inondation depuis son téléphone. Chaque signalement enrichit la carte nationale.',
  },
  {
    icon: '🔔',
    title: 'Alertes précoces',
    desc: 'Les autorités émettent des alertes géolocalisées qui parviennent instantanément aux populations concernées.',
  },
  {
    icon: '📊',
    title: 'Rapports & analyses',
    desc: 'Générez des rapports détaillés pour orienter les décisions des gestionnaires de crise et des élus.',
  },
];
 
const Accueil = () => {
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
 
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&family=Sora:wght@300;400;600&display=swap');
 
        :root {
          --ib-navy:    #0a1f44;
          --ib-blue:    #1a56db;
          --ib-cyan:    #06b6d4;
          --ib-water:   #38bdf8;
          --ib-danger:  #f59e0b;
          --ib-light:   #f0f7ff;
          --ib-white:   #ffffff;
          --ib-gray:    #64748b;
          --ib-text:    #1e293b;
          --ib-radius:  14px;
          --ib-shadow:  0 8px 32px rgba(10,31,68,.12);
        }
 
        * { box-sizing: border-box; margin: 0; padding: 0; }
 
        body {
          font-family: 'Sora', sans-serif;
          color: var(--ib-text);
          background: var(--ib-white);
        }
 
        /* ── HERO ── */
        .ib-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin-top: -68px;
          padding: calc(68px + 4rem) 1.5rem 4rem;
          overflow: hidden;
          background: linear-gradient(135deg, var(--ib-navy) 0%, #0d2d6b 50%, #0f3460 100%);
        }
 
        /* vagues animées en fond */
        .ib-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(6,182,212,.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(26,86,219,.25) 0%, transparent 55%);
          pointer-events: none;
        }
 
        .ib-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          background: rgba(6,182,212,.15);
          border: 1px solid rgba(6,182,212,.35);
          color: var(--ib-cyan);
          font-family: 'Outfit', sans-serif;
          font-size: .8rem;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: .4rem 1rem;
          border-radius: 99px;
          margin-bottom: 1.8rem;
          animation: ib-fadein .8s ease both;
        }
 
        .ib-hero h1 {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(2.6rem, 6vw, 5rem);
          font-weight: 900;
          color: var(--ib-white);
          line-height: 1.1;
          margin-bottom: 1.4rem;
          animation: ib-fadein .9s ease .1s both;
        }
 
        .ib-hero h1 span {
          background: linear-gradient(90deg, var(--ib-cyan), var(--ib-water));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
 
        .ib-hero-sub {
          max-width: 640px;
          font-size: 1.1rem;
          color: rgba(255,255,255,.75);
          line-height: 1.7;
          margin-bottom: 2.5rem;
          animation: ib-fadein 1s ease .2s both;
        }
 
        .ib-hero-btns {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          animation: ib-fadein 1s ease .3s both;
        }
 
        .ib-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          background: linear-gradient(135deg, var(--ib-blue), var(--ib-cyan));
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          padding: .85rem 2rem;
          border-radius: 99px;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(6,182,212,.4);
          transition: transform .2s, box-shadow .2s;
        }
        .ib-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(6,182,212,.55);
        }
 
        .ib-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.25);
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          padding: .85rem 2rem;
          border-radius: 99px;
          text-decoration: none;
          transition: background .2s, transform .2s;
        }
        .ib-btn-ghost:hover {
          background: rgba(255,255,255,.15);
          transform: translateY(-2px);
        }
 
        /* vague décorative bas du hero */
        .ib-wave {
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          line-height: 0;
        }
 
        /* ── STATS ── */
        .ib-stats {
          background: var(--ib-white);
          padding: 4rem 1.5rem;
        }
 
        .ib-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
          max-width: 900px;
          margin: 0 auto;
        }
 
        .ib-stat-card {
          background: var(--ib-light);
          border: 1px solid rgba(26,86,219,.1);
          border-radius: var(--ib-radius);
          padding: 2rem 1.5rem;
          text-align: center;
          transition: transform .25s, box-shadow .25s;
        }
        .ib-stat-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--ib-shadow);
        }
 
        .ib-stat-icon { font-size: 2rem; display: block; margin-bottom: .6rem; }
        .ib-stat-number {
          font-family: 'Outfit', sans-serif;
          font-size: 2.4rem;
          font-weight: 900;
          color: var(--ib-blue);
          line-height: 1;
          margin-bottom: .4rem;
        }
        .ib-stat-label { font-size: .9rem; color: var(--ib-gray); font-weight: 500; }
 
        /* ── OBJECTIF ── */
        .ib-objectif {
          background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
          padding: 5rem 1.5rem;
          text-align: center;
        }
 
        .ib-section-tag {
          display: inline-block;
          background: rgba(26,86,219,.1);
          color: var(--ib-blue);
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: .78rem;
          letter-spacing: .1em;
          text-transform: uppercase;
          padding: .3rem .9rem;
          border-radius: 99px;
          margin-bottom: 1rem;
        }
 
        .ib-section-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(1.7rem, 3.5vw, 2.4rem);
          font-weight: 800;
          color: var(--ib-navy);
          margin-bottom: 1.2rem;
        }
 
        .ib-objectif p {
          max-width: 760px;
          margin: 0 auto;
          font-size: 1.05rem;
          color: var(--ib-gray);
          line-height: 1.8;
        }
 
        /* ── FEATURES ── */
        .ib-features {
          padding: 5rem 1.5rem;
          background: var(--ib-white);
        }
 
        .ib-features-header { text-align: center; margin-bottom: 3rem; }
 
        .ib-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.8rem;
          max-width: 1050px;
          margin: 0 auto;
        }
 
        .ib-feature-card {
          background: var(--ib-white);
          border: 1px solid #e2e8f0;
          border-radius: var(--ib-radius);
          padding: 2rem 1.8rem;
          transition: transform .25s, box-shadow .25s, border-color .25s;
          position: relative;
          overflow: hidden;
        }
        .ib-feature-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--ib-blue), var(--ib-cyan));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform .3s;
        }
        .ib-feature-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--ib-shadow);
          border-color: rgba(26,86,219,.2);
        }
        .ib-feature-card:hover::after { transform: scaleX(1); }
 
        .ib-feature-icon {
          font-size: 2.2rem;
          margin-bottom: 1rem;
          display: block;
        }
        .ib-feature-card h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--ib-navy);
          margin-bottom: .6rem;
        }
        .ib-feature-card p {
          font-size: .92rem;
          color: var(--ib-gray);
          line-height: 1.65;
        }
 
        /* ── GALERIE ── */
        .ib-galerie {
          padding: 5rem 1.5rem;
          background: var(--ib-navy);
          text-align: center;
        }
 
        .ib-galerie .ib-section-title { color: var(--ib-white); }
        .ib-galerie .ib-section-tag {
          background: rgba(6,182,212,.15);
          color: var(--ib-cyan);
        }
 
        .ib-galerie-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.2rem;
          max-width: 1050px;
          margin: 2.5rem auto 0;
        }
 
        .ib-galerie-card {
          position: relative;
          border-radius: var(--ib-radius);
          overflow: hidden;
          aspect-ratio: 4/3;
          cursor: pointer;
        }
        .ib-galerie-card img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform .4s;
        }
        .ib-galerie-card:hover img { transform: scale(1.07); }
 
        .ib-galerie-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,31,68,.85) 0%, transparent 55%);
          display: flex;
          align-items: flex-end;
          padding: 1rem;
        }
        .ib-galerie-overlay p {
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: .95rem;
        }
 
        /* ── CTA ── */
        .ib-cta {
          padding: 6rem 1.5rem;
          background: linear-gradient(135deg, var(--ib-blue) 0%, var(--ib-cyan) 100%);
          text-align: center;
        }
        .ib-cta h2 {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 900;
          color: #fff;
          margin-bottom: 1rem;
        }
        .ib-cta p {
          color: rgba(255,255,255,.85);
          font-size: 1.05rem;
          max-width: 520px;
          margin: 0 auto 2.5rem;
          line-height: 1.7;
        }
        .ib-cta-btns {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .ib-btn-white {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          background: #fff;
          color: var(--ib-blue);
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          padding: .85rem 2rem;
          border-radius: 99px;
          text-decoration: none;
          transition: transform .2s, box-shadow .2s;
          box-shadow: 0 4px 16px rgba(0,0,0,.15);
        }
        .ib-btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }
 
        .ib-btn-outline-white {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          background: transparent;
          border: 2px solid rgba(255,255,255,.6);
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          padding: .8rem 2rem;
          border-radius: 99px;
          text-decoration: none;
          transition: background .2s, transform .2s;
        }
        .ib-btn-outline-white:hover { background: rgba(255,255,255,.15); transform: translateY(-2px); }
 
        /* ── ANIMATION ── */
        @keyframes ib-fadein {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
 
        /* ── RESPONSIVE ── */
        @media (max-width: 600px) {
          .ib-hero-btns { flex-direction: column; align-items: center; }
          .ib-cta-btns  { flex-direction: column; align-items: center; }
        }
      `}</style>
 
      {/* ── HERO ── */}
      <section className="ib-hero">
        <span className="ib-hero-badge">🌊 Plateforme nationale · Bénin</span>
        <h1>
          Anticiper les inondations,<br />
          <span>protéger les vies</span>
        </h1>
        <p className="ib-hero-sub">
          InondoBénin est la première plateforme nationale de cartographie,
          de signalement citoyen et d'alerte précoce contre les inondations au Bénin.
        </p>
        <div className="ib-hero-btns">
          <Link to="/carte" className="ib-btn-primary">🗺️ Explorer la carte</Link>
          <Link to="/signaler" className="ib-btn-ghost">📡 Signaler une inondation</Link>
        </div>
 
        {/* Vague décorative */}
        <div className="ib-wave">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" fill="#ffffff"/>
          </svg>
        </div>
      </section>
 
      {/* ── STATS ── */}
      <section className="ib-stats" ref={statsRef}>
        <div className="ib-stats-grid">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} animate={statsVisible} />
          ))}
        </div>
      </section>
 
      {/* ── OBJECTIF ── */}
      <section className="ib-objectif">
        <span className="ib-section-tag">Notre mission</span>
        <h2 className="ib-section-title">Pourquoi InondoBénin ?</h2>
        <p>
          Les inondations récurrentes au Bénin causent chaque année des <strong>pertes humaines et matérielles</strong> considérables.
          InondoBénin répond à ce défi grâce à une <strong>cartographie dynamique</strong>, un <strong>signalement citoyen en temps réel</strong>
          et un <strong>système d'alerte précoce</strong> permettant aux populations et aux autorités d'<strong>anticiper et de réagir</strong> efficacement.
        </p>
      </section>
 
      {/* ── FEATURES ── */}
      <section className="ib-features">
        <div className="ib-features-header">
          <span className="ib-section-tag">Fonctionnalités clés</span>
          <h2 className="ib-section-title">Une plateforme complète</h2>
        </div>
        <div className="ib-features-grid">
          {features.map((f, i) => (
            <div className="ib-feature-card" key={i}>
              <span className="ib-feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
 
      {/* ── GALERIE ── */}
      <section className="ib-galerie">
        <span className="ib-section-tag">Témoignages visuels</span>
        <h2 className="ib-section-title">Inondations au Bénin</h2>
        <div className="ib-galerie-grid">
          {imagesInondations.map((item, i) => (
            <div className="ib-galerie-card" key={i}>
              <img src={item.src} alt={item.titre} />
              <div className="ib-galerie-overlay"><p>📍 {item.titre}</p></div>
            </div>
          ))}
        </div>
      </section>
 
      {/* ── CTA ── */}
      <section className="ib-cta">
        <h2>Rejoignez la communauté de vigilance</h2>
        <p>Créez un compte citoyen et contribuez à protéger votre communauté contre les inondations.</p>
        <div className="ib-cta-btns">
          <Link to="/connexion" className="ib-btn-white">🚀 Créer un compte</Link>
          
        </div>
      </section>
    </>
  );
};
 
export default Accueil;