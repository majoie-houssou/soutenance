import React from 'react';

const ChartsStats = ({ signalements }) => {
  const statsByMonth = () => {
    const months = {};
    signalements.forEach(s => {
      const month = new Date(s.date_creation).toLocaleString('fr-FR', { month: 'long' });
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months).slice(0, 6);
  };

  const niveauDistribution = () => {
    const dist = { leger: 0, maisons_touchees: 0, critique: 0 };
    signalements.forEach(s => {
      if (s.niveau_eau === 'leger') dist.leger++;
      else if (s.niveau_eau === 'maisons_touchees') dist.maisons_touchees++;
      else if (s.niveau_eau === 'critique') dist.critique++;
    });
    return dist;
  };

  const dist = niveauDistribution();
  const total = signalements.length;

  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '1rem', marginBottom: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem', color: '#1e3a8a' }}>📊 Statistiques avancées</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div>
          <h4 style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Distribution par niveau</h4>
          <div style={{ background: '#fef9c3', height: '8px', borderRadius: '4px', marginBottom: '0.25rem', width: `${(dist.leger / total) * 100}%`, maxWidth: '100%' }}></div>
          <div style={{ fontSize: '0.7rem' }}>🟡 Chaussée inondée: {dist.leger}</div>
          <div style={{ background: '#ffedd5', height: '8px', borderRadius: '4px', marginBottom: '0.25rem', width: `${(dist.maisons_touchees / total) * 100}%`, maxWidth: '100%' }}></div>
          <div style={{ fontSize: '0.7rem' }}>🟠 Maisons touchées: {dist.maisons_touchees}</div>
          <div style={{ background: '#fee2e2', height: '8px', borderRadius: '4px', marginBottom: '0.25rem', width: `${(dist.critique / total) * 100}%`, maxWidth: '100%' }}></div>
          <div style={{ fontSize: '0.7rem' }}>🔴 Critique: {dist.critique}</div>
        </div>
        <div>
          <h4 style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Tendance des 6 derniers mois</h4>
          {statsByMonth().map(([month, count]) => (
            <div key={month} style={{ marginBottom: '0.25rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{month}</div>
              <div style={{ background: '#3b82f6', height: '6px', borderRadius: '3px', width: `${(count / total) * 100}%` }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartsStats;