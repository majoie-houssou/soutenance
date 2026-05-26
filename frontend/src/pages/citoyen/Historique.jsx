import React from 'react';
import { useNavigate } from 'react-router-dom';

const Historique = () => {
  const navigate = useNavigate();

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
      couleur: "#dc2626"
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
      couleur: "#f97316"
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
      couleur: "#dc2626"
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
      couleur: "#f97316"
    }
  ];

  const formatNombre = (nb) => {
    return nb.toLocaleString('fr-FR');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <button onClick={() => navigate(-1)} style={{ background: '#e2e8f0', border: 'none', color: '#1e3a8a', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', marginBottom: '1.5rem' }}>
          ← Retour
        </button>

        <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ background: '#1e3a8a', padding: '1.5rem', textAlign: 'center', color: 'white' }}>
            <h1 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              📜 Historique des inondations
            </h1>
            <p style={{ opacity: 0.9, margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
              Mémoire collective des catastrophes passées
            </p>
          </div>

          <div style={{ padding: '1.5rem' }}>
            
            {/* Introduction */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Cette section recense les principales inondations survenues au Bénin. 
                Comprendre le passé pour mieux anticiper l'avenir.
              </p>
            </div>

            {/* Liste des inondations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {historiqueData.map((item) => (
                <div 
                  key={item.id} 
                  style={{ 
                    background: '#f8fafc', 
                    borderRadius: '20px', 
                    overflow: 'hidden',
                    borderLeft: `5px solid ${item.couleur}`,
                    transition: 'all 0.3s'
                  }}
                >
                  {/* Entête de l'année */}
                  <div style={{ 
                    background: item.couleur, 
                    color: 'white', 
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                      🌊 Inondations de {item.annee}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                      Source : {item.source}
                    </div>
                  </div>

                  {/* Corps */}
                  <div style={{ padding: '1rem' }}>
                    <p style={{ color: '#475569', marginBottom: '1rem', lineHeight: '1.5' }}>
                      {item.description}
                    </p>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '0.75rem',
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Zones touchées</div>
                        <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{item.zones}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Départements</div>
                        <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{item.departements}</div>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                      gap: '0.75rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ textAlign: 'center', padding: '0.5rem', background: '#fef3c7', borderRadius: '10px' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#d97706' }}>{formatNombre(item.victimes)}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Victimes</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '0.5rem', background: '#fee2e2', borderRadius: '10px' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc2626' }}>{formatNombre(item.maisonsDetruites)}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Maisons détruites</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '0.5rem', background: '#dcfce7', borderRadius: '10px' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#16a34a' }}>{formatNombre(item.hectaresSubmerges)}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Hectares submergés</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message de prévention */}
            <div style={{ 
              marginTop: '2rem', 
              background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', 
              borderRadius: '16px', 
              padding: '1.5rem',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💡</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Leçon à retenir</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.95 }}>
                Les inondations au Bénin sont récurrentes mais prévisibles. 
                La préparation et l'alerte précoce peuvent réduire de <strong>30 à 50%</strong> les pertes humaines.
              </p>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Historique;