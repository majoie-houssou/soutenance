import React from 'react';
import { useNavigate } from 'react-router-dom';
 
const historiqueData = [
  {
    id: 1,
    annee: 2010,
    zones: "Cotonou, Sèmè-Kraké, Grand-Popo, Porto-Novo",
    departements: "Littoral, Ouémé, Mono, Atlantique",
    victimes: 680000,
    maisonsDetruites: 55000,
    hectaresSubmerges: 200000,
    description: "Inondations historiques ayant touché une grande partie du pays. Considérée comme la pire catastrophe naturelle de l'histoire récente du Bénin.",
    source: "OCHA 2010",
    niveau: "critique",
  },
  {
    id: 2,
    annee: 2019,
    zones: "Cotonou, Abomey-Calavi",
    departements: "Littoral, Atlantique",
    victimes: 150000,
    maisonsDetruites: 10000,
    hectaresSubmerges: 45000,
    description: "Fortes pluies ayant provoqué des inondations urbaines dans la capitale économique et ses environs.",
    source: "DGEC 2019",
    niveau: "modere",
  },
  {
    id: 3,
    annee: 2022,
    zones: "10 départements du Bénin",
    departements: "Littoral, Ouémé, Atlantique, Mono, Couffo, Zou, Collines, Borgou, Alibori, Donga",
    victimes: 562000,
    maisonsDetruites: 25000,
    hectaresSubmerges: 80000,
    description: "Inondations majeures ayant causé 56 décès et détruit des milliers d'hectares de cultures. Une des pires années.",
    source: "DGEC 2022",
    niveau: "critique",
  },
  {
    id: 4,
    annee: 2023,
    zones: "Littoral, Ouémé, Mono",
    departements: "Littoral, Ouémé, Mono",
    victimes: 200000,
    maisonsDetruites: 8000,
    hectaresSubmerges: 35000,
    description: "Saison des pluies exceptionnelle ayant touché les zones côtières et fluviales.",
    source: "Direction Générale de l'Eau 2023",
    niveau: "modere",
  },
  {
    id: 5,
    annee: 2024,
    zones: "Cotonou, Porto-Novo, Abomey-Calavi, Sèmè-Podji et 28 autres communes",
    departements: "Littoral, Ouémé, Atlantique, Alibori, Atacora, Borgou, Mono, Collines, Donga, Zou, Couffo, Plateau",
    victimes: 182803,
    maisonsDetruites: 12000,
    hectaresSubmerges: 50000,
    description: "Inondations survenues de juillet à décembre dans 32 communes placées en état de catastrophe. Bilan officiel : 46 décès, 182 803 sinistrés, 211 écoles et 29 centres de santé endommagés, importantes pertes agricoles.",
    source: "Ministère de l'Intérieur 2024",
    niveau: "critique",
  },
  {
    id: 6,
    annee: 2026,
    zones: "Cotonou (plusieurs arrondissements)",
    departements: "Littoral",
    victimes: 400000,
    maisonsDetruites: 3000,
    hectaresSubmerges: 8000,
    description: "Fortes précipitations du 6 mai 2026 ayant paralysé la circulation dans plusieurs quartiers de Cotonou. La mairie a déclenché des mesures d'urgence et déployé des équipes techniques. La SIRAT a tenu une conférence de presse pour expliquer les causes des stagnations d'eau.",
    source: "SIRAT / Mairie de Cotonou 2026",
    niveau: "critique",
  },
];
 
const niveauConfig = {
  critique: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Critique' },
  modere:   { color: '#f97316', bg: '#fff7ed', border: '#fdba74', label: 'Modéré'   },
};
 
const fmt = (n) => n.toLocaleString('fr-FR');
 
const Historique = () => {
  const navigate = useNavigate();
 
  const totalVictimes  = historiqueData.reduce((s, d) => s + d.victimes, 0);
  const totalMaisons   = historiqueData.reduce((s, d) => s + d.maisonsDetruites, 0);
  const totalHectares  = historiqueData.reduce((s, d) => s + d.hectaresSubmerges, 0);
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Sora:wght@400;500&display=swap');
 
        .hi-page {
          font-family: 'Sora', sans-serif;
          background: #f1f5f9;
          min-height: 100vh;
          color: #1e293b;
        }
 
        .hi-header {
          background: linear-gradient(135deg, #0a1f44 0%, #1a56db 100%);
          padding: 3rem 2rem 4.5rem;
          position: relative;
          overflow: hidden;
        }
        .hi-header::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 90% 50%, rgba(56,189,248,.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .hi-header-inner { max-width: 1000px; margin: 0 auto; position: relative; }
 
        .hi-back {
          display: inline-flex; align-items: center; gap: .4rem;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.2);
          color: rgba(255,255,255,.85);
          font-family: 'Outfit', sans-serif;
          font-size: .82rem; font-weight: 600;
          padding: .4rem 1rem; border-radius: 99px;
          cursor: pointer;
          transition: background .2s;
          margin-bottom: 1.5rem;
        }
        .hi-back:hover { background: rgba(255,255,255,.18); }
 
        .hi-header-tag {
          display: inline-block;
          background: rgba(6,182,212,.15);
          border: 1px solid rgba(6,182,212,.3);
          color: #38bdf8;
          font-family: 'Outfit', sans-serif;
          font-size: .75rem; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          padding: .3rem .9rem; border-radius: 99px;
          margin-bottom: 1rem;
        }
        .hi-header h1 {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 900; color: #fff;
          margin-bottom: .6rem; line-height: 1.15;
        }
        .hi-header h1 span {
          background: linear-gradient(90deg, #38bdf8, #06b6d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hi-header p { color: rgba(255,255,255,.7); font-size: .95rem; }
        .hi-wave { position: absolute; bottom: -2px; left: 0; width: 100%; line-height: 0; pointer-events: none; }
 
        .hi-body {
          max-width: 1000px;
          margin: -2rem auto 0;
          padding: 0 1.5rem 4rem;
          position: relative; z-index: 2;
        }
 
        .hi-totals {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .hi-total-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.3rem 1rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,.04);
          transition: transform .2s;
        }
        .hi-total-card:hover { transform: translateY(-3px); }
        .hi-total-num {
          font-family: 'Outfit', sans-serif;
          font-size: 1.7rem; font-weight: 900;
          line-height: 1; margin-bottom: .3rem;
        }
        .hi-total-label { font-size: .78rem; color: #64748b; font-weight: 500; }
 
        /* TIMELINE */
        .hi-timeline {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .hi-timeline::before {
          content: '';
          position: absolute;
          left: 52px; top: 0; bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, #dc2626, #f97316, #dc2626, #f97316);
          z-index: 0;
        }
 
        .hi-item {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem 0;
          position: relative; z-index: 1;
        }
 
        .hi-year-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          width: 106px;
        }
        .hi-year-bubble {
          width: 64px; height: 64px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Outfit', sans-serif;
          font-weight: 900; font-size: 1rem;
          color: #fff;
          border: 3px solid #fff;
          box-shadow: 0 4px 16px rgba(0,0,0,.15);
          position: relative; z-index: 2;
          flex-shrink: 0;
        }
        .hi-niveau-badge {
          margin-top: .5rem;
          font-family: 'Outfit', sans-serif;
          font-size: .65rem; font-weight: 700;
          letter-spacing: .06em; text-transform: uppercase;
          padding: .2rem .6rem; border-radius: 99px;
        }
 
        .hi-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          flex: 1;
          box-shadow: 0 2px 12px rgba(0,0,0,.05);
          transition: transform .25s, box-shadow .25s;
        }
        .hi-card:hover {
          transform: translateX(5px);
          box-shadow: 0 8px 28px rgba(0,0,0,.1);
        }
 
        .hi-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: .9rem 1.2rem;
          flex-wrap: wrap; gap: .5rem;
        }
        .hi-card-header-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 800; font-size: 1rem; color: #fff;
        }
        .hi-card-source {
          font-size: .75rem;
          color: rgba(255,255,255,.85);
          background: rgba(255,255,255,.15);
          padding: .2rem .7rem; border-radius: 99px;
          white-space: nowrap;
        }
 
        .hi-card-body { padding: 1.2rem; }
 
        .hi-desc {
          color: #475569;
          font-size: .9rem;
          line-height: 1.65;
          margin-bottom: 1rem;
        }
 
        .hi-zones {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: .75rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: .9rem 1rem;
          margin-bottom: 1rem;
        }
        .hi-zone-item label {
          display: block;
          font-size: .7rem; color: #94a3b8;
          text-transform: uppercase; letter-spacing: .06em;
          margin-bottom: .2rem;
        }
        .hi-zone-item span { font-size: .85rem; font-weight: 600; color: #1e293b; }
 
        .hi-chiffres {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: .75rem;
        }
        .hi-chiffre {
          text-align: center;
          padding: .8rem .5rem;
          border-radius: 10px;
        }
        .hi-chiffre-num {
          font-family: 'Outfit', sans-serif;
          font-weight: 900; font-size: 1.1rem;
          line-height: 1; margin-bottom: .25rem;
        }
        .hi-chiffre-label { font-size: .7rem; color: #64748b; font-weight: 500; }
 
        .hi-lecon {
          margin-top: 2.5rem;
          background: linear-gradient(135deg, #0a1f44 0%, #1a56db 100%);
          border-radius: 18px;
          padding: 2.2rem;
          text-align: center;
          box-shadow: 0 8px 32px rgba(10,31,68,.2);
        }
        .hi-lecon-icon { font-size: 2.5rem; margin-bottom: .8rem; }
        .hi-lecon h3 {
          font-family: 'Outfit', sans-serif;
          font-weight: 800; font-size: 1.2rem;
          color: #fff; margin-bottom: .6rem;
        }
        .hi-lecon p {
          color: rgba(255,255,255,.8);
          font-size: .92rem; line-height: 1.7;
          max-width: 560px; margin: 0 auto;
        }
        .hi-lecon p strong { color: #38bdf8; }
 
        @media (max-width: 640px) {
          .hi-timeline::before { left: 32px; }
          .hi-year-col { width: 70px; }
          .hi-year-bubble { width: 48px; height: 48px; font-size: .85rem; }
          .hi-totals { grid-template-columns: 1fr; }
          .hi-zones { grid-template-columns: 1fr; }
          .hi-chiffres { grid-template-columns: 1fr; }
        }
      `}</style>
 
      <div className="hi-page">
 
        <div className="hi-header">
          <div className="hi-header-inner">
            <button className="hi-back" onClick={() => navigate(-1)}>← Retour</button>
          
            <h1>Historique des <span>inondations</span></h1>
            <p>Comprendre le passé pour mieux anticiper l'avenir au Bénin</p>
          </div>
          <div className="hi-wave">
            <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0,20 C480,50 960,0 1440,25 L1440,50 L0,50 Z" fill="#f1f5f9"/>
            </svg>
          </div>
        </div>
 
        <div className="hi-body">
 
          <div className="hi-totals">
            <div className="hi-total-card">
              <div className="hi-total-num" style={{ color: '#f97316' }}>{fmt(totalVictimes)}</div>
              <div className="hi-total-label">👥 Victimes cumulées</div>
            </div>
            <div className="hi-total-card">
              <div className="hi-total-num" style={{ color: '#dc2626' }}>{fmt(totalMaisons)}</div>
              <div className="hi-total-label">🏚️ Maisons détruites</div>
            </div>
            <div className="hi-total-card">
              <div className="hi-total-num" style={{ color: '#0891b2' }}>{fmt(totalHectares)}</div>
              <div className="hi-total-label">🌾 Hectares submergés</div>
            </div>
          </div>
 
          <div className="hi-timeline">
            {historiqueData.map((item) => {
              const cfg = niveauConfig[item.niveau];
              return (
                <div className="hi-item" key={item.id}>
                  <div className="hi-year-col">
                    <div className="hi-year-bubble" style={{ background: cfg.color }}>
                      {item.annee}
                    </div>
                    <span
                      className="hi-niveau-badge"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                    >
                      {cfg.label}
                    </span>
                  </div>
 
                  <div className="hi-card">
                    <div className="hi-card-header" style={{ background: cfg.color }}>
                      <span className="hi-card-header-title">🌊 Inondations de {item.annee}</span>
                      <span className="hi-card-source">Source : {item.source}</span>
                    </div>
                    <div className="hi-card-body">
                      <p className="hi-desc">{item.description}</p>
                      <div className="hi-zones">
                        <div className="hi-zone-item">
                          <label>Zones touchées</label>
                          <span>{item.zones}</span>
                        </div>
                        <div className="hi-zone-item">
                          <label>Départements</label>
                          <span>{item.departements}</span>
                        </div>
                      </div>
                      <div className="hi-chiffres">
                        <div className="hi-chiffre" style={{ background: '#fffbeb' }}>
                          <div className="hi-chiffre-num" style={{ color: '#d97706' }}>{fmt(item.victimes)}</div>
                          <div className="hi-chiffre-label">Victimes</div>
                        </div>
                        <div className="hi-chiffre" style={{ background: '#fef2f2' }}>
                          <div className="hi-chiffre-num" style={{ color: '#dc2626' }}>{fmt(item.maisonsDetruites)}</div>
                          <div className="hi-chiffre-label">Maisons détruites</div>
                        </div>
                        <div className="hi-chiffre" style={{ background: '#ecfeff' }}>
                          <div className="hi-chiffre-num" style={{ color: '#0891b2' }}>{fmt(item.hectaresSubmerges)}</div>
                          <div className="hi-chiffre-label">Hectares submergés</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
 
          <div className="hi-lecon">
           
            <p>
              Les inondations au Bénin sont récurrentes mais prévisibles.
              La préparation et l'alerte précoce peuvent réduire de <strong>30 à 50%</strong> les pertes humaines et matérielles.
            </p>
          </div>
 
        </div>
      </div>
    </>
  );
};
 
export default Historique;