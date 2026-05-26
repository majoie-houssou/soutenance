import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/authService';

const CitoyenDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [commune, setCommune] = useState(user?.commune || 'Cotonou');
  const [subscribed, setSubscribed] = useState(false);
  const [loadingSubscribe, setLoadingSubscribe] = useState(false);

  const communesBenin = [
    'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Grand-Popo',
    'Sèmè-Kraké', 'Lokossa', 'Bohicon', 'Natitingou', 'Kandi'
  ];

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/citoyen/verifier-abonnement-email', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSubscribed(data.abonne);
      if (data.abonne && data.abonneData?.email) {
        setEmail(data.abonneData.email);
        setCommune(data.abonneData.commune || user?.commune || 'Cotonou');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!email) {
      alert('Veuillez entrer votre adresse email');
      return;
    }

    setLoadingSubscribe(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/citoyen/s-abonner-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email,
          telephone,
          commune
        })
      });

      if (res.ok) {
        setSubscribed(true);
        setShowSubscribeModal(false);
        alert('✅ Vous êtes maintenant abonné aux alertes email !');
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de l\'abonnement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion au serveur');
    } finally {
      setLoadingSubscribe(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (window.confirm('Voulez-vous vraiment vous désabonner des alertes email ?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:5000/api/citoyen/se-desabonner-email', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSubscribed(false);
        alert('✅ Vous êtes désabonné des alertes email');
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const menuItems = [
    { path: '/citoyen/signaler', icon: '🚨', title: 'Signaler', desc: 'Signalez une montée des eaux', color: '#ef4444' },
    { path: '/citoyen/mes-signalements', icon: '📋', title: 'Mes signalements', desc: 'Suivez vos alertes', color: '#3b82f6' },
    { path: '/citoyen/alertes-reelles', icon: '⚡', title: 'Alertes en temps réel', desc: 'Niveau d\'alerte actuel', color: '#f97316' },
    { path: '/citoyen/alertes', icon: '🔍', title: 'Alertes par localité', desc: 'Alertes de votre commune', color: '#8b5cf6' },
    { path: '/citoyen/historique', icon: '📜', title: 'Historique', desc: 'Inondations passées', color: '#8b5cf6' },
    { path: '/citoyen/carte', icon: '🗺️', title: 'Carte des risques', desc: 'Zones vulnérables', color: '#10b981' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
        
        {/* ========== EN-TÊTE ========== */}
        <div style={{
          background: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ color: '#1e3a8a', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem' }}>👤</span> Espace Citoyen
              </h1>
              <p style={{ color: '#4b5563', margin: '0.25rem 0 0' }}>
                Bienvenue, <strong>{user?.nom || 'Citoyen'}</strong> !
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {subscribed ? (
                <button 
                  onClick={handleUnsubscribe} 
                  style={{ background: '#22c55e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  📧 Abonné aux alertes ✅
                </button>
              ) : (
                <button 
                  onClick={() => setShowSubscribeModal(true)} 
                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  📧 Recevoir les alertes email
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========== STATISTIQUES RAPIDES ========== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem' }}>📍</div>
            <div style={{ fontWeight: 'bold', color: '#1e3a8a' }}>10+</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Zones à risque</div>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem' }}>📧</div>
            <div style={{ fontWeight: 'bold', color: '#1e3a8a' }}>Alertes email</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Recevez les alertes</div>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem' }}>⚡</div>
            <div style={{ fontWeight: 'bold', color: '#1e3a8a' }}>2 clics</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Signalement rapide</div>
          </div>
        </div>

        {/* Modal d'abonnement */}
        {showSubscribeModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', maxWidth: '450px', width: '90%' }}>
              <h2 style={{ color: '#1e3a8a', marginBottom: '0.5rem' }}>📧 Recevoir les alertes email</h2>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>Recevez les alertes d'inondation directement par email</p>
              
              <input
                type="email"
                placeholder="Votre adresse email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #ccc', marginBottom: '1rem' }}
                required
              />
              <input
                type="tel"
                placeholder="Votre numéro de téléphone (optionnel)"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #ccc', marginBottom: '1rem' }}
              />
              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #ccc', marginBottom: '1rem' }}
              >
                {communesBenin.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '1rem' }}>
                📍 Vous recevrez les alertes concernant votre commune et votre département.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowSubscribeModal(false)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Annuler</button>
                <button onClick={handleSubscribe} disabled={loadingSubscribe} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
                  {loadingSubscribe ? 'Abonnement...' : 'S\'abonner'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== MENU PRINCIPAL ========== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem'
        }}>
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              style={{
                background: 'white',
                padding: '1.5rem 1rem',
                borderRadius: '1rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                borderTop: `4px solid ${item.color}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2.5rem' }}>{item.icon}</div>
              <h3 style={{ margin: '0.5rem 0', color: '#1e3a8a' }}>{item.title}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* ========== BANDEAU INFO ========== */}
        <div style={{
          marginTop: '2rem',
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
          borderRadius: '1rem',
          padding: '1rem 1.5rem',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📢</span>
            <span>Urgence Protection Civile : <strong>118</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CitoyenDashboard;