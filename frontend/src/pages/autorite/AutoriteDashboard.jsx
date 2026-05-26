import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/authService';
import MeteoWidget from '../../components/MeteoWidget';
import MapSignalements from '../../components/MapSignalements';

const AutoriteDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [stats, setStats] = useState({ total: 0, enAttente: 0, confirmes: 0, critiques: 0 });
  const [recentSignals, setRecentSignals] = useState([]);
  const [signalements, setSignalements] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [signalsRes, zonesRes] = await Promise.all([
          fetch('http://localhost:5000/api/signalements', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/api/public/zones')
        ]);
        
        const signals = await signalsRes.json();
        const zonesData = await zonesRes.json();
        
        setSignalements(signals);
        setZones(zonesData);
        setStats({
          total: signals.length,
          enAttente: signals.filter(s => s.statut === 'en_attente').length,
          confirmes: signals.filter(s => s.statut === 'confirme').length,
          critiques: signals.filter(s => s.niveau_eau === 'critique').length
        });
        setRecentSignals(signals.slice(0, 10));
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const menuItems = [
    { path: '/autorite/signalements', icon: '📋', title: 'Signalements', desc: 'Tous les signalements', color: '#3b82f6' },
    { path: '/autorite/alertes', icon: '📱', title: 'Alertes EMAIL', desc: 'Envoi de masse', color: '#ef4444' },
    { path: '/autorite/sinistres', icon: '👨‍👩‍👧‍👦', title: 'Sinistrés', desc: 'Suivi des familles', color: '#10b981' },
    { path: '/autorite/rapports', icon: '📄', title: 'Rapports PDF', desc: 'Génération', color: '#f59e0b' },
    { action: 'map', icon: '🗺️', title: 'Carte signalements', desc: 'Voir sur la carte', color: '#8b5cf6' }
  ];

  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.action === 'map') {
      setShowMap(true);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* En-tête */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ color: '#1e3a8a', margin: 0 }}>🏛️ Tableau de bord - Autorités</h1>
              <p>Bienvenue, <strong>{user?.nom || 'Autorité'}</strong></p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a' }}>{stats.total}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total signalements</div>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f97316' }}>{stats.enAttente}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>En attente</div>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e' }}>{stats.confirmes}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Confirmés</div>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>{stats.critiques}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Critiques</div>
          </div>
        </div>

        {/* Menu + Météo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {menuItems.map((item, index) => (
              <div 
                key={index} 
                onClick={() => handleMenuClick(item)} 
                style={{ background: 'white', padding: '1rem', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', borderTop: `4px solid ${item.color}`, transition: '0.3s' }} 
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} 
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '2rem' }}>{item.icon}</div>
                <h3 style={{ margin: '0.5rem 0 0.25rem', fontSize: '0.9rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <MeteoWidget ville="Cotonou" />
        </div>

        {/* Derniers signalements */}
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ background: '#1e3a8a', padding: '1rem', color: 'white' }}>
            <h3 style={{ margin: 0 }}>📋 Derniers signalements reçus</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            {recentSignals.length === 0 ? <p>Aucun signalement</p> : recentSignals.map(s => (
              <div key={s.id} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', marginBottom: '0.5rem', borderLeft: s.niveau_eau === 'critique' ? '4px solid #dc2626' : 'none' }}>
                <p style={{ margin: 0, fontSize: '0.8rem' }}><strong>📍 {s.latitude}, {s.longitude}</strong></p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: '#64748b' }}>{s.description || 'Aucune description'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de la carte */}
      {showMap && (
        <MapSignalements 
          signalements={signalements} 
          zones={zones} 
          onClose={() => setShowMap(false)} 
        />
      )}
    </div>
  );
};

export default AutoriteDashboard;