import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/authService';

// 🚨 FIX : Définition de menuItems manquante qui faisait crasher l'application
const menuItems = [
  {
    title: "Signaler une inondation",
    desc: "Signalez une zone inondée ou un danger en quelques clics",
    icon: "⚠️",
    path: "/citoyen/signaler",
    bg: "rgba(239, 68, 68, 0.1)",
    accent: "#dc2626"
  },
  {
    title: "Mes Signalements",
    desc: "Consultez l'historique et le suivi de vos signalements envoyés",
    icon: "📋",
    path: "/citoyen/mes-signalements",
    bg: "rgba(30, 58, 138, 0.1)",
    accent: "#1e3a8a"
  },
  {
    title: "Carte interactive",
    desc: "Visualisez les zones à risques et alertes communautaires en temps réel",
    icon: "🗺️",
    path: "/citoyen/carte",
    bg: "rgba(6, 182, 212, 0.1)",
    accent: "#06b6d4"
  },
  {
    title: "Alertes officielles",
    desc: "Consultez les alertes de vigilance émises par les autorités",
    icon: "📢",
    path: "/citoyen/alertes-reelles",
    bg: "rgba(245, 158, 11, 0.1)",
    accent: "#f59e0b"
  },
  {
    title: "Historique des crues",
    desc: "Consultez les données passées et l'historique des inondations",
    icon: "⏳",
    path: "/citoyen/historique",
    bg: "rgba(100, 116, 139, 0.1)",
    accent: "#64748b"
  }
];

const CitoyenDashboard = () => {
  const navigate = useNavigate();
  
  // Récupération dynamique de l'utilisateur pour éviter le crash au chargement
  const [user, setUser] = useState(() => {
    const localUserData = localStorage.getItem('user');
    if (localUserData) {
      try {
        return JSON.parse(localUserData);
      } catch (e) {
        return getCurrentUser(); 
      }
    }
    return getCurrentUser();
  });

  const [subscribed, setSubscribed] = useState(false);
  const [loadingSubscribe, setLoadingSubscribe] = useState(false);

  useEffect(() => {
    // Si pas de token, on redirige vers la connexion
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/connexion');
      return;
    }

    if (!user) {
      const localUserData = localStorage.getItem('user');
      if (localUserData) {
        setUser(JSON.parse(localUserData));
      }
    }

    checkSubscription();
  }, [user, navigate]);

  const checkSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('http://localhost:5000/api/citoyen/verifier-abonnement-email', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubscribed(!!data.abonne);
    } catch (e) { 
      console.error("Erreur lors de la vérification de l'abonnement :", e); 
    }
  };

  // ABONNEMENT EN UN CLIC
  const handleToggleSubscribe = async () => {
    setLoadingSubscribe(true);
    const token = localStorage.getItem('token');

    try {
      if (!subscribed) {
        // S'ABONNER
        const res = await fetch('http://localhost:5000/api/citoyen/sabonner-alertes', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSubscribed(true);
          alert('🎉 Vous êtes maintenant abonné aux alertes de votre commune !');
        } else {
          alert(`❌ Erreur : ${data.error || "Impossible de s'abonner"}`);
        }
      } else {
        // SE DÉSABONNER
        if (!window.confirm("Voulez-vous vraiment vous désabonner des alertes ?")) return;
        const res = await fetch('http://localhost:5000/api/citoyen/desabonner-alertes', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSubscribed(false);
          alert('🔕 Vous avez été désabonné des alertes.');
        }
      }
    } catch (e) {
      console.error(e);
      alert("❌ Erreur de connexion avec le serveur.");
    } finally {
      setLoadingSubscribe(false);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#1e3a8a', fontWeight: 'bold' }}>
        Chargement de votre espace citoyen...
      </div>
    );
  }

  return (
    <>
      <style>{`
        .cd-page { min-height: 100vh; background: #f8fafc; padding: 2rem 1rem; font-family: 'Segoe UI', Roboto, sans-serif; }
        .cd-banner { background: linear-gradient(135deg, #0a1f44, #1e3a8a); color: white; border-radius: 20px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .cd-banner-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; }
        .cd-banner-avatar { width: 55px; height: 55px; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; }
        .cd-banner-left h2 { margin: 0 0 0.25rem 0; font-size: 1.6rem; }
        .cd-banner-left p { margin: 0; opacity: 0.8; font-size: 0.95rem; }
        .cd-banner-right { display: flex; gap: 1rem; flex-wrap: wrap; }
        .cd-btn-subscribe { border: none; padding: 0.75rem 1.25rem; border-radius: 50px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
        .cd-btn-subscribe.off { background: #e0f2fe; color: #0369a1; }
        .cd-btn-subscribe.off:hover { background: #bae6fd; }
        .cd-btn-subscribe.on { background: #10b981; color: white; }
        .cd-btn-subscribe.on:hover { background: #059669; }
        .cd-btn-logout { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.75rem 1.25rem; border-radius: 50px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        .cd-btn-logout:hover { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); }
        .cd-sub-banner { background: #fff; border-left: 5px solid #0284c7; padding: 1.2rem; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .cd-sub-banner p { margin: 0; color: #334155; font-size: 0.95rem; }
        .cd-sub-link { background: #0284c7; color: white; border: none; padding: 0.5rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .cd-sub-link:hover { background: #0369a1; }
        .cd-section-label { font-size: 1.1rem; font-weight: 700; color: #0a1f44; margin-bottom: 1.2rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .cd-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .cd-card { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; cursor: pointer; transition: all 0.25s ease; position: relative; display: flex; flex-direction: column; }
        .cd-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.06); border-color: #e2e8f0; }
        .cd-card-icon-wrap { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 1.2rem; }
        .cd-card h3 { margin: 0 0 0.5rem 0; font-size: 1.15rem; font-weight: 700; }
        .cd-card p { margin: 0; color: #64748b; font-size: 0.9rem; line-height: 1.4; padding-right: 1.5rem; flex-grow: 1; }
        .cd-card-arrow { position: absolute; bottom: 1.5rem; right: 1.5rem; color: #cbd5e1; font-weight: bold; transition: 0.2s; font-size: 1.1rem; }
        .cd-card:hover .cd-card-arrow { color: #1e3a8a; transform: translateX(3px); }
      `}</style>

      <div className="cd-page">
        {/* ── BANNER ── */}
        <div className="cd-banner">
          <div className="cd-banner-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="cd-banner-avatar">{(user?.nom?.[0] || 'C').toUpperCase()}</div>
              <div className="cd-banner-left">
                <h2>{greeting}, <span style={{ color: '#38bdf8' }}>{user?.prenom ? `${user.prenom} ${user.nom}` : user.nom}</span> 👋</h2>
                <p>Espace Citoyen · <strong>{user?.commune || 'Bénin'}</strong></p>
              </div>
            </div>
            <div className="cd-banner-right">
              <button
                className={`cd-btn-subscribe ${subscribed ? 'on' : 'off'}`}
                onClick={handleToggleSubscribe}
                disabled={loadingSubscribe}
              >
                {loadingSubscribe ? 'Patientez...' : subscribed ? '🔔 Abonné aux alertes' : '🔕 S\'abonner aux alertes'}
              </button>
              <button className="cd-btn-logout" onClick={() => { logout(); window.location.href = '/'; }}>
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="cd-body">
          {!subscribed && (
            <div className="cd-sub-banner">
              <p>🔕 Vous n'êtes pas encore abonné aux alertes. <strong>Activez les notifications</strong> en un clic pour être prévenu en cas d'inondation.</p>
              <button className="cd-sub-link" onClick={handleToggleSubscribe} disabled={loadingSubscribe}>
                {loadingSubscribe ? 'Activation...' : 'Activer les alertes'}
              </button>
            </div>
          )}

          <div className="cd-section-label">Mes fonctionnalités</div>
          <div className="cd-grid">
            {menuItems.map((item, i) => (
              <div key={i} className="cd-card" onClick={() => navigate(item.path)}>
                <div className="cd-card-icon-wrap" style={{ background: item.bg }}>{item.icon}</div>
                <h3 style={{ color: item.accent === '#dc2626' ? '#991b1b' : '#0a1f44' }}>{item.title}</h3>
                <p>{item.desc}</p>
                <span className="cd-card-arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CitoyenDashboard;