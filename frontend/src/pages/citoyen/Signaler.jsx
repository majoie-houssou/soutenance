import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EXIF from 'exif-js';

const Signaler = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [niveauEau, setNiveauEau] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoGps, setPhotoGps] = useState(null);
  const [extractingGps, setExtractingGps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [locationError, setLocationError] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [adresseRecherche, setAdresseRecherche] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [rechercheLoading, setRechercheLoading] = useState(false);

  const convertDMSToDD = (degrees, minutes, seconds, direction) => {
    let dd = degrees + (minutes / 60) + (seconds / 3600);
    if (direction === 'S' || direction === 'W') dd = dd * -1;
    return dd;
  };

  const extractGpsFromPhoto = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const exifData = EXIF.readFromBinaryFile(e.target.result);
          if (exifData?.GPSLatitude && exifData?.GPSLongitude) {
            resolve({
              lat: convertDMSToDD(exifData.GPSLatitude[0], exifData.GPSLatitude[1], exifData.GPSLatitude[2], exifData.GPSLatitudeRef),
              lng: convertDMSToDD(exifData.GPSLongitude[0], exifData.GPSLongitude[1], exifData.GPSLongitude[2], exifData.GPSLongitudeRef),
            });
          } else resolve(null);
        } catch { resolve(null); }
      };
      reader.readAsBinaryString(file);
    });
  };

  const chercherAdresseOSM = async (texte) => {
    setAdresseRecherche(texte);
    if (texte.length < 3) { setSuggestions([]); return; }
    setRechercheLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texte)}&countrycodes=bj&limit=5`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'InondoBenin-Application-Soutenance' }
      });
      setSuggestions(await res.json());
    } catch { } finally { setRechercheLoading(false); }
  };

  const handleSelectSuggestion = (lieu) => {
    setPosition({ lat: parseFloat(lieu.lat), lng: parseFloat(lieu.lon) });
    setAdresseRecherche(lieu.display_name);
    setSuggestions([]);
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'InondoBenin-Application-Soutenance' }
      });
      const data = await res.json();
      return data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || data.address?.town || data.address?.city || 'Lieu inconnu';
    } catch { return 'Position GPS'; }
  };

  const getLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) { setLocationError("GPS non supporté"); setShowLocationModal(true); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPosition({ lat, lng });
        setShowLocationModal(false);
        setGeocoding(true);
        setAdresseRecherche(`📍 Proche de : ${await getAddressFromCoordinates(lat, lng)}`);
        setGeocoding(false);
      },
      (err) => {
        setLocationError(err.code === 1 ? "❌ Accès GPS refusé. Activez-le dans vos paramètres." : "⚠️ Signal GPS indisponible.");
        setShowLocationModal(true);
      }
    );
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setExtractingGps(true);
    setPhotoGps(await extractGpsFromPhoto(file));
    setExtractingGps(false);
  };

  const usePhotoLocation = async () => {
    if (!photoGps) return;
    setPosition(photoGps);
    setPhotoGps(null);
    setGeocoding(true);
    setAdresseRecherche(`📸 Photo : ${await getAddressFromCoordinates(photoGps.lat, photoGps.lng)}`);
    setGeocoding(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const finalPosition = position || photoGps;
    if (!finalPosition) { alert('Veuillez indiquer une position.'); return; }
    if (!niveauEau) { alert('Veuillez sélectionner un niveau de gravité.'); return; }
    setLoading(true);
    try {
      let lieuFinal = adresseRecherche;
      if (!lieuFinal || lieuFinal.startsWith('📍') || lieuFinal.startsWith('📸')) {
        setGeocoding(true);
        lieuFinal = await getAddressFromCoordinates(finalPosition.lat, finalPosition.lng);
        setGeocoding(false);
      }
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/citoyen/signaler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ latitude: finalPosition.lat, longitude: finalPosition.lng, niveau_eau: niveauEau, description, lieu: lieuFinal, photo_url: photoPreview || null }),
      });
      const data = await res.json();
      if (res.ok) { setSuccess(true); setTimeout(() => navigate('/citoyen/mes-signalements'), 2000); }
      else { setErrorMsg(data.error || "Erreur lors de l'envoi."); setLoading(false); }
    } catch { setErrorMsg('Impossible de joindre le serveur.'); setLoading(false); }
  };

  if (success) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f1f5f9', fontFamily:'Sora,sans-serif' }}>
      <div style={{ textAlign:'center', background:'#fff', padding:'2.5rem', borderRadius:'20px', maxWidth:'360px', width:'90%', boxShadow:'0 10px 40px rgba(0,0,0,.1)' }}>
        <div style={{ fontSize:'3.5rem', marginBottom:'.5rem' }}>✅</div>
        <h2 style={{ fontFamily:'Outfit,sans-serif', color:'#0a1f44', fontWeight:900, marginBottom:'.4rem' }}>Signalement envoyé !</h2>
        <p style={{ color:'#64748b', fontSize:'.9rem' }}>Merci pour votre civisme. Les autorités ont été notifiées.</p>
        <div style={{ width:28, height:28, border:'3px solid #e2e8f0', borderTopColor:'#1a56db', borderRadius:'50%', animation:'sg-spin .9s linear infinite', margin:'1.2rem auto 0' }}></div>
        <style>{`@keyframes sg-spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Sora:wght@400;500&display=swap');
        @keyframes sg-spin { to { transform:rotate(360deg); } }
        @keyframes sg-fadein { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        .sg-page { font-family:'Sora',sans-serif; background:#f1f5f9; min-height:100vh; color:#1e293b; }

        /* ── HEADER ── */
        .sg-header {
          background:linear-gradient(135deg,#0a1f44 0%,#dc2626 100%);
          padding:2.5rem 2rem 3rem; position:relative; overflow:hidden;
        }
        .sg-header::before {
          content:''; position:absolute; inset:0;
          background:radial-gradient(ellipse 60% 80% at 90% 50%,rgba(239,68,68,.15) 0%,transparent 60%);
          pointer-events:none;
        }
        .sg-header-inner { max-width:760px; margin:0 auto; position:relative; }
        .sg-back {
          display:inline-flex; align-items:center; gap:.4rem;
          background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2);
          color:rgba(255,255,255,.85); font-family:'Outfit',sans-serif;
          font-size:.82rem; font-weight:600; padding:.4rem 1rem;
          border-radius:99px; cursor:pointer; margin-bottom:1.5rem;
          transition:background .2s;
        }
        .sg-back:hover { background:rgba(255,255,255,.18); }
        .sg-header-tag {
          display:inline-block; background:rgba(239,68,68,.2);
          border:1px solid rgba(239,68,68,.35); color:#fca5a5;
          font-family:'Outfit',sans-serif; font-size:.75rem; font-weight:700;
          letter-spacing:.1em; text-transform:uppercase;
          padding:.3rem .9rem; border-radius:99px; margin-bottom:.8rem;
        }
        .sg-header h1 {
          font-family:'Outfit',sans-serif; font-size:clamp(1.5rem,3vw,2.2rem);
          font-weight:900; color:#fff; margin-bottom:.3rem;
        }
        .sg-header h1 span {
          background:linear-gradient(90deg,#fca5a5,#f87171);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .sg-header p { color:rgba(255,255,255,.7); font-size:.9rem; }
        .sg-wave { position:absolute; bottom:-2px; left:0; width:100%; line-height:0; pointer-events:none; }

        /* ── BODY ── */
        .sg-body { max-width:760px; margin:1.5rem auto 0; padding:0 1.5rem 4rem; }

        /* ── GRILLE ── */
        .sg-grid { display:grid; grid-template-columns:1fr 300px; gap:1.5rem; align-items:start; }

        /* ── CARTE FORM ── */
        .sg-form-card {
          background:#fff; border:1px solid #e2e8f0;
          border-radius:18px; overflow:hidden;
          box-shadow:0 2px 12px rgba(0,0,0,.05);
        }
        .sg-form-header {
          background:linear-gradient(135deg,#0a1f44,#dc2626);
          padding:1rem 1.5rem; display:flex; align-items:center; gap:.6rem;
        }
        .sg-form-header h2 { font-family:'Outfit',sans-serif; font-weight:800; font-size:1rem; color:#fff; margin:0; }
        .sg-form-body { padding:1.5rem; }

        /* ── FIELD ── */
        .sg-field { margin-bottom:1.1rem; position:relative; }
        .sg-field label {
          display:block; font-family:'Outfit',sans-serif; font-weight:700;
          font-size:.82rem; color:#374151; margin-bottom:.4rem;
        }
        .sg-input, .sg-select, .sg-textarea {
          width:100%; font-family:'Sora',sans-serif; font-size:.9rem;
          color:#1e293b; border-radius:12px; outline:none;
          padding:.65rem 1rem; border:1.5px solid #e2e8f0;
          background:#f8fafc; transition:border-color .2s; box-sizing:border-box;
        }
        .sg-input:focus, .sg-select:focus, .sg-textarea:focus {
          border-color:#dc2626; box-shadow:0 0 0 3px rgba(220,38,38,.1);
        }
        .sg-textarea { resize:vertical; min-height:90px; }

        /* ── SUGGESTIONS ── */
        .sg-suggestions {
          position:absolute; z-index:999; width:100%;
          background:#fff; border:1px solid #e2e8f0;
          border-radius:12px; box-shadow:0 10px 24px rgba(0,0,0,.1);
          margin-top:.25rem; list-style:none; max-height:200px; overflow-y:auto;
        }
        .sg-suggestion-item {
          padding:.65rem 1rem; cursor:pointer; font-size:.82rem; color:#334155;
          border-bottom:1px solid #f1f5f9; transition:background .15s;
          line-height:1.4;
        }
        .sg-suggestion-item:hover { background:#f0f7ff; }
        .sg-suggestion-item:last-child { border-bottom:none; }

        /* ── GPS BUTTON ── */
        .sg-btn-gps {
          width:100%; padding:.7rem 1rem; border:none; border-radius:12px;
          font-family:'Outfit',sans-serif; font-weight:700; font-size:.9rem;
          cursor:pointer; transition:transform .2s, box-shadow .2s;
          display:flex; align-items:center; justify-content:center; gap:.5rem;
        }
        .sg-btn-gps.idle { background:linear-gradient(135deg,#1a56db,#06b6d4); color:#fff; box-shadow:0 4px 14px rgba(26,86,219,.3); }
        .sg-btn-gps.done { background:linear-gradient(135deg,#16a34a,#22c55e); color:#fff; box-shadow:0 4px 14px rgba(22,163,74,.3); }
        .sg-btn-gps:hover { transform:translateY(-1px); }

        /* ── GPS INFO ── */
        .sg-gps-info {
          background:#f0fdf4; border:1px solid #86efac;
          border-radius:10px; padding:.55rem .8rem;
          font-size:.78rem; color:#15803d; font-weight:600;
          margin-top:.5rem;
        }

        /* ── PHOTO ZONE ── */
        .sg-photo-zone {
          border:2px dashed #cbd5e1; border-radius:14px;
          padding:1rem; text-align:center; background:#f8fafc;
          min-height:120px; display:flex; align-items:center;
          justify-content:center; flex-direction:column;
          transition:border-color .2s;
        }
        .sg-photo-zone:hover { border-color:#1a56db; }
        .sg-photo-preview { max-width:100%; max-height:130px; border-radius:10px; object-fit:cover; }

        /* ── BANNERS ── */
        .sg-banner-info { background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:.55rem .8rem; font-size:.78rem; color:#1d4ed8; margin-top:.5rem; }
        .sg-banner-warn { background:#fffbeb; border:1px solid #fde047; border-radius:10px; padding:.55rem .8rem; font-size:.78rem; color:#92400e; margin-top:.5rem; }
        .sg-banner-exif { background:#dbeafe; border:1px solid #93c5fd; border-radius:10px; padding:.7rem .9rem; margin-top:.5rem; }

        /* ── NIVEAUX ── */
        .sg-niveaux { display:flex; flex-direction:column; gap:.5rem; }
        .sg-niveau-btn {
          display:flex; align-items:center; gap:.7rem;
          padding:.75rem 1rem; border-radius:12px; border:2px solid;
          cursor:pointer; font-family:'Sora',sans-serif; font-size:.85rem;
          font-weight:500; transition:all .2s; background:#fff;
          text-align:left;
        }
        .sg-niveau-btn:hover { transform:translateX(4px); }
        .sg-niveau-btn.selected { font-weight:700; }
        .sg-niveau-icon { font-size:1.2rem; flex-shrink:0; }
        .sg-niveau-text h4 { font-family:'Outfit',sans-serif; font-weight:800; font-size:.85rem; margin-bottom:.1rem; }
        .sg-niveau-text p { font-size:.72rem; opacity:.75; margin:0; }

        /* ── SUBMIT ── */
        .sg-btn-submit {
          width:100%; padding:.9rem;
          background:linear-gradient(135deg,#dc2626,#ef4444);
          color:#fff; border:none; border-radius:12px;
          font-family:'Outfit',sans-serif; font-weight:900; font-size:1rem;
          cursor:pointer; box-shadow:0 4px 18px rgba(220,38,38,.4);
          transition:transform .2s, box-shadow .2s, opacity .2s;
          margin-top:.5rem;
        }
        .sg-btn-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 24px rgba(220,38,38,.5); }
        .sg-btn-submit:disabled { opacity:.6; cursor:not-allowed; }

        /* ── SIDEBAR ── */
        .sg-sidebar { display:flex; flex-direction:column; gap:1rem; }
        .sg-map-card {
          background:#fff; border:1px solid #e2e8f0; border-radius:16px;
          overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.04);
        }
        .sg-map-header { background:linear-gradient(135deg,#0a1f44,#1a56db); padding:.8rem 1rem; }
        .sg-map-header span { font-family:'Outfit',sans-serif; font-weight:800; font-size:.88rem; color:#fff; }
        .sg-map-body { padding:.8rem; }
        .sg-map-placeholder {
          background:linear-gradient(135deg,#dbeafe,#e0f2fe);
          border-radius:10px; height:160px; display:flex;
          flex-direction:column; align-items:center; justify-content:center;
          gap:.4rem; color:#1d4ed8; position:relative;
        }
        .sg-map-pin { font-size:2rem; }
        .sg-map-text { font-family:'Outfit',sans-serif; font-size:.78rem; font-weight:700; }
        .sg-map-coords { font-size:.68rem; color:#475569; margin-top:.3rem; text-align:center; }

        .sg-tips-card {
          background:#fff; border:1px solid #e2e8f0; border-radius:16px;
          padding:1rem; box-shadow:0 2px 8px rgba(0,0,0,.04);
        }
        .sg-tips-title { font-family:'Outfit',sans-serif; font-weight:800; font-size:.82rem; color:#0a1f44; margin-bottom:.6rem; }
        .sg-tip { display:flex; align-items:flex-start; gap:.5rem; font-size:.78rem; color:#475569; margin-bottom:.4rem; line-height:1.45; }

        /* ── ERROR ── */
        .sg-error { background:#fef2f2; border:1px solid #fca5a5; color:#dc2626; border-radius:10px; padding:.7rem 1rem; font-size:.85rem; margin-bottom:1rem; text-align:center; }

        /* ── MODAL ── */
        .sg-overlay { position:fixed; inset:0; background:rgba(10,31,68,.55); backdrop-filter:blur(4px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:1.5rem; }
        .sg-modal { background:#fff; border-radius:20px; padding:2rem; width:100%; max-width:380px; text-align:center; box-shadow:0 24px 64px rgba(0,0,0,.2); animation:sg-fadein .25s ease; }
        .sg-modal-icon { font-size:2.5rem; margin-bottom:.7rem; }
        .sg-modal h3 { font-family:'Outfit',sans-serif; font-weight:800; font-size:1.1rem; color:#0a1f44; margin-bottom:.4rem; }
        .sg-modal p { font-size:.85rem; color:#64748b; line-height:1.6; margin-bottom:1.2rem; }
        .sg-modal-btns { display:flex; gap:.7rem; justify-content:center; }
        .sg-modal-cancel { padding:.5rem 1.3rem; background:#f1f5f9; color:#64748b; border:none; border-radius:99px; cursor:pointer; font-family:'Outfit',sans-serif; font-weight:600; font-size:.85rem; }
        .sg-modal-retry  { padding:.5rem 1.3rem; background:linear-gradient(135deg,#1a56db,#06b6d4); color:#fff; border:none; border-radius:99px; cursor:pointer; font-family:'Outfit',sans-serif; font-weight:700; font-size:.85rem; }

        @media (max-width:720px) {
          .sg-grid { grid-template-columns:1fr; }
          .sg-sidebar { order:-1; }
        }
      `}</style>

      <div className="sg-page">

        {/* ── MODAL GPS ── */}
        {showLocationModal && (
          <div className="sg-overlay">
            <div className="sg-modal">
              <div className="sg-modal-icon">📍</div>
              <h3>Activer la localisation</h3>
              <p>{locationError || "Pour géolocaliser l'inondation précisément, l'accès au GPS est requis."}</p>
              <div className="sg-modal-btns">
                <button className="sg-modal-cancel" onClick={() => setShowLocationModal(false)}>Annuler</button>
                <button className="sg-modal-retry" onClick={() => { setShowLocationModal(false); getLocation(); }}>🔄 Réessayer</button>
              </div>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="sg-header">
          <div className="sg-header-inner">
            <button className="sg-back" onClick={() => navigate(-1)}>← Retour</button>
            <div style={{ marginTop:'1rem' }}>
              <div className="sg-header-tag">🚨 Signalement citoyen</div>
              <h1>Signaler une <span>inondation</span></h1>
              <p>Aidez à cartographier la montée des eaux en temps réel</p>
            </div>
          </div>
          <div className="sg-wave">
            <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0,20 C480,50 960,0 1440,25 L1440,50 L0,50 Z" fill="#f1f5f9"/>
            </svg>
          </div>
        </div>

        <div className="sg-body">

          {errorMsg && <div className="sg-error">❌ {errorMsg}</div>}

          <div className="sg-grid">

            {/* ── FORMULAIRE ── */}
            <div className="sg-form-card">
              <div className="sg-form-header">
                <span style={{ fontSize:'1.2rem' }}>📝</span>
                <h2>Informations du signalement</h2>
              </div>
              <div className="sg-form-body">
                <form onSubmit={handleSubmit}>

                  {/* Recherche adresse */}
                  <div className="sg-field">
                    <label>🔍 Rechercher une adresse ou un quartier</label>
                    <input
                      className="sg-input"
                      type="text"
                      value={adresseRecherche}
                      onChange={e => chercherAdresseOSM(e.target.value)}
                      placeholder="Ex : Fidjrossè, Akpakpa, Agla, Étoile Rouge..."
                    />
                    {rechercheLoading && <div style={{ fontSize:'.72rem', color:'#94a3b8', marginTop:'.3rem' }}>🔍 Recherche en cours...</div>}
                    {suggestions.length > 0 && (
                      <ul className="sg-suggestions">
                        {suggestions.map(lieu => (
                          <li key={lieu.place_id} className="sg-suggestion-item" onClick={() => handleSelectSuggestion(lieu)}>
                            📍 {lieu.display_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* GPS */}
                  <div className="sg-field">
                    <label>📱 Ou utiliser votre position GPS actuelle</label>
                    <button type="button" className={`sg-btn-gps ${position ? 'done' : 'idle'}`} onClick={getLocation}>
                      {position ? '✅ Position GPS capturée' : '🛰️ Activer mon GPS'}
                    </button>
                    {position && (
                      <div className="sg-gps-info">
                        🎯 Lat : {position.lat.toFixed(5)} · Lng : {position.lng.toFixed(5)}
                      </div>
                    )}
                  </div>

                  {/* Niveau d'eau */}
                  <div className="sg-field">
                    <label>💧 Niveau de gravité *</label>
                    <div className="sg-niveaux">
                      {[
                        { val:'leger',           icon:'⚠️', title:'Léger',   desc:'Chaussée inondée / Voie impraticable',     color:'#ca8a04', bg:'#fefce8', border:'#fde047' },
                        { val:'maisons_touchees',icon:'🏠', title:'Modéré',  desc:'Habitations et cours infiltrées',           color:'#f97316', bg:'#fff7ed', border:'#fdba74' },
                        { val:'critique',        icon:'🚨', title:'Critique',desc:'Crues graves / Évacuation nécessaire',     color:'#dc2626', bg:'#fef2f2', border:'#fca5a5' },
                      ].map(n => (
                        <button
                          key={n.val}
                          type="button"
                          className={`sg-niveau-btn ${niveauEau === n.val ? 'selected' : ''}`}
                          style={{
                            borderColor: niveauEau === n.val ? n.color : '#e2e8f0',
                            background:  niveauEau === n.val ? n.bg : '#fff',
                            color: n.color,
                          }}
                          onClick={() => setNiveauEau(n.val)}
                        >
                          <span className="sg-niveau-icon">{n.icon}</span>
                          <div className="sg-niveau-text">
                            <h4>{n.title}</h4>
                            <p>{n.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="sg-field">
                    <label>📝 Précisions utiles (optionnel)</label>
                    <textarea
                      className="sg-textarea"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Ex : Courant fort, canalisation bouchée, personnes bloquées..."
                    />
                  </div>

                  {/* Photo */}
                  <div className="sg-field">
                    <label>📸 Photo témoin (optionnel)</label>
                    <div className="sg-photo-zone">
                      {photoPreview
                        ? <img src={photoPreview} alt="Aperçu" className="sg-photo-preview" />
                        : <><div style={{ fontSize:'2rem', marginBottom:'.3rem' }}>🖼️</div><p style={{ color:'#94a3b8', fontSize:'.8rem', margin:0 }}>Prenez ou importez une photo</p></>
                      }
                    </div>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ width:'100%', marginTop:'.5rem', fontSize:'.8rem' }} />
                    {extractingGps && <div className="sg-banner-warn">⏳ Analyse des données GPS de la photo...</div>}
                    {photoGps && (
                      <div className="sg-banner-exif">
                        <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'.78rem', color:'#1e40af', marginBottom:'.3rem' }}>📍 Coordonnées GPS trouvées dans la photo !</div>
                        <div style={{ fontSize:'.72rem', color:'#64748b', marginBottom:'.4rem' }}>{photoGps.lat.toFixed(5)}, {photoGps.lng.toFixed(5)}</div>
                        <button type="button" onClick={usePhotoLocation} style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', color:'#fff', border:'none', padding:'.35rem .9rem', borderRadius:'99px', cursor:'pointer', fontSize:'.75rem', fontFamily:'Outfit,sans-serif', fontWeight:700 }}>
                          🗺️ Utiliser cette position
                        </button>
                      </div>
                    )}
                    {photo && !extractingGps && !photoGps && (
                      <div className="sg-banner-warn">⚠️ Aucun GPS trouvé dans cette image. Utilisez la recherche ou le GPS.</div>
                    )}
                  </div>

                  <button type="submit" className="sg-btn-submit" disabled={loading || geocoding}>
                    {geocoding ? '📍 Identification du quartier...' : loading ? '⏳ Envoi en cours...' : '🚨 Envoyer le signalement'}
                  </button>

                </form>
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <div className="sg-sidebar">
              <div className="sg-map-card">
                <div className="sg-map-header"><span>📍 Ma position</span></div>
                <div className="sg-map-body">
                  <div className="sg-map-placeholder">
                    <div className="sg-map-pin">{position ? '📍' : '🗺️'}</div>
                    <div className="sg-map-text">{position ? 'Position capturée' : 'Aucune position'}</div>
                    {position && <div className="sg-map-coords">{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</div>}
                  </div>
                  {adresseRecherche && !adresseRecherche.startsWith('📍') && !adresseRecherche.startsWith('📸') && (
                    <div style={{ marginTop:'.6rem', background:'#f0f7ff', border:'1px solid #bfdbfe', borderRadius:'8px', padding:'.5rem .7rem', fontSize:'.75rem', color:'#1d4ed8', lineHeight:1.4 }}>
                      📌 {adresseRecherche.length > 80 ? adresseRecherche.slice(0,80) + '...' : adresseRecherche}
                    </div>
                  )}
                </div>
              </div>

              <div className="sg-tips-card">
                <div className="sg-tips-title">💡 Conseils de signalement</div>
                <div className="sg-tip"><span>📍</span><span>Précisez votre position le plus exactement possible.</span></div>
                <div className="sg-tip"><span>📸</span><span>Une photo permet de mieux évaluer la gravité.</span></div>
                <div className="sg-tip"><span>📝</span><span>Décrivez si des personnes sont en danger.</span></div>
                <div className="sg-tip"><span>⚡</span><span>Les autorités seront notifiées immédiatement.</span></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Signaler;