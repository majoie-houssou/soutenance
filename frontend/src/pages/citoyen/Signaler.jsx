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

  // Styles modernes
  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '2rem 1rem'
    },
    card: {
      maxWidth: '700px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '24px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    cardHeader: {
      background: '#1e3a8a',
      padding: '1.5rem',
      textAlign: 'center',
      color: 'white'
    },
    cardBody: {
      padding: '2rem'
    },
    backBtn: {
      background: '#e2e8f0',
      border: 'none',
      color: '#1e3a8a',
      padding: '0.5rem 1rem',
      borderRadius: '50px',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: '500',
      transition: 'all 0.3s',
      marginBottom: '1.5rem'
    },
    label: {
      fontWeight: '600',
      display: 'block',
      marginBottom: '0.5rem',
      color: '#1e293b'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      fontSize: '1rem',
      transition: 'all 0.3s',
      outline: 'none'
    },
    btnPrimary: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '600',
      color: 'white',
      transition: 'all 0.3s'
    },
    btnDanger: {
      background: '#dc2626',
      color: 'white',
      padding: '0.75rem 1rem',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '600',
      width: '100%',
      transition: 'all 0.3s'
    },
    photoFrame: {
      border: '2px dashed #cbd5e1',
      borderRadius: '16px',
      padding: '1rem',
      textAlign: 'center',
      background: '#f8fafc',
      minHeight: '180px',
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      flexDirection: 'column',
      transition: 'all 0.3s'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    },
    modalContent: {
      background: 'white',
      borderRadius: '24px',
      padding: '2rem',
      maxWidth: '400px',
      width: '100%',
      textAlign: 'center'
    },
    errorBox: {
      background: '#fee2e2',
      color: '#dc2626',
      padding: '0.75rem',
      borderRadius: '12px',
      marginBottom: '1rem',
      fontSize: '0.85rem',
      textAlign: 'center'
    }
  };

  // Convertir les degrés/minutes/secondes en décimal
  const convertDMSToDD = (degrees, minutes, seconds, direction) => {
    let dd = degrees + (minutes / 60) + (seconds / 3600);
    if (direction === 'S' || direction === 'W') {
      dd = dd * -1;
    }
    return dd;
  };

  // Extraire les coordonnées GPS d'une photo
  const extractGpsFromPhoto = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryString = e.target.result;
        try {
          const exifData = EXIF.readFromBinaryFile(binaryString);
          if (exifData && exifData.GPSLatitude && exifData.GPSLongitude) {
            const lat = convertDMSToDD(
              exifData.GPSLatitude[0],
              exifData.GPSLatitude[1],
              exifData.GPSLatitude[2],
              exifData.GPSLatitudeRef
            );
            const lng = convertDMSToDD(
              exifData.GPSLongitude[0],
              exifData.GPSLongitude[1],
              exifData.GPSLongitude[2],
              exifData.GPSLongitudeRef
            );
            resolve({ lat, lng });
          } else {
            resolve(null);
          }
        } catch (err) {
          console.error("Erreur lecture EXIF", err);
          resolve(null);
        }
      };
      reader.readAsBinaryString(file);
    });
  };

  // Obtenir le lieu (quartier/arrondissement) via reverse geocoding OpenStreetMap
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      const quartier = data.address?.suburb || 
                       data.address?.neighbourhood || 
                       data.address?.city_district ||
                       data.address?.town ||
                       data.address?.city ||
                       'Lieu inconnu';
      
      return quartier;
    } catch (error) {
      console.error('Erreur géocodage Nominatim:', error);
      return 'Position GPS'; // Fallback par sécurité
    }
  };

  // Demander la localisation actuelle de l'appareil
  const getLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Votre navigateur ne supporte pas la géolocalisation");
      setShowLocationModal(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setShowLocationModal(false);
      },
      (error) => {
        let message = "";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = "❌ Accès à la position refusé. Activez la localisation dans les paramètres.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "⚠️ Position GPS actuelle indisponible.";
            break;
          default:
            message = "Erreur lors de la récupération de la localisation.";
        }
        setLocationError(message);
        setShowLocationModal(true);
      }
    );
  };

  const enableLocation = () => {
    setShowLocationModal(false);
    getLocation();
  };

  // Gérer le téléversement de la photo
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      setExtractingGps(true);
      setPhotoGps(null);
      
      const gps = await extractGpsFromPhoto(file);
      if (gps) {
        setPhotoGps(gps);
      }
      setExtractingGps(false);
    }
  };

  // ✅ UX AMÉLIORÉE : Lie le GPS extrait à l'état de position principale et cache la boîte verte
  const usePhotoLocation = () => {
    if (photoGps) {
      setPosition(photoGps);
      setPhotoGps(null); 
    }
  };

  // Envoyer le signalement complet au backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Si l'utilisateur n'a pas cliqué sur le bouton vert mais qu'une photo GPS existe, on la prend
    const finalPosition = position || photoGps;
    
    if (!finalPosition) {
      alert('Veuillez partager votre position GPS ou charger une photo contenant des données de localisation.');
      return;
    }
    if (!niveauEau) {
      alert('Veuillez sélectionner le niveau d\'eau actuel.');
      return;
    }

    setLoading(true);
    
    try {
      // 🔍 Lancement de la détection automatique du nom du quartier
      setGeocoding(true);
      const lieuAuto = await getAddressFromCoordinates(finalPosition.lat, finalPosition.lng);
      setGeocoding(false);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/citoyen/signaler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: finalPosition.lat,
          longitude: finalPosition.lng,
          niveau_eau: niveauEau,
          description: description,
          lieu: lieuAuto, 
          photo_url: photoPreview || null // Si tu passes par un stockage Cloud (S3/Cloudinary), envoie l'URL finale ici.
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/citoyen/mes-signalements'), 2000);
      } else {
        setErrorMsg(data.error || 'Erreur lors de l\'envoi du signalement.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur soumission signalement:', error);
      setErrorMsg('Erreur de connexion avec le serveur distant.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '2rem', borderRadius: '24px', maxWidth: '350px', width: '90%', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '4rem' }}>✅</div>
          <h2 style={{ color: '#1e3a8a', margin: '0.5rem 0' }}>Signalement envoyé !</h2>
          <p style={{ color: '#6b7280' }}>Merci pour votre civisme. Les autorités locales ont été notifiées.</p>
          <div style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '1rem auto' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      
      {/* Modal d'accès à la géolocalisation */}
      {showLocationModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#1e3a8a' }}>Activer la localisation</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{locationError || "Pour géolocaliser l'inondation précisément, l'accès au capteur GPS de votre appareil est requis."}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setShowLocationModal(false)} style={{ padding: '0.5rem 1.5rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>Annuler</button>
              <button type="button" onClick={enableLocation} style={{ padding: '0.5rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>🔄 Réessayer</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.card}>
        {/* En-tête */}
        <div style={styles.cardHeader}>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>🚨 Signaler une inondation</h1>
          <p style={{ opacity: 0.9, margin: '0.5rem 0 0' }}>Aidez à cartographier la montée des eaux en temps réel</p>
        </div>

        <div style={styles.cardBody}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            ← Retour
          </button>

          {errorMsg && (
            <div style={styles.errorBox}>
              ❌ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            {/* Position GPS */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={styles.label}>📍 Localisation de l'événement</label>
              <button
                type="button"
                onClick={getLocation}
                style={{
                  ...styles.btnPrimary,
                  background: position ? '#10b981' : '#3b82f6',
                  marginBottom: '0.5rem'
                }}
              >
                {position ? '✓ Coordonnées GPS enregistrées' : '📱 Partager ma position actuelle'}
              </button>
              
              {position && (
                <div style={{ background: '#d1fae5', padding: '0.6rem', borderRadius: '12px', fontSize: '0.8rem', color: '#065f46', fontWeight: '500' }}>
                  🎯 Lat: {position.lat.toFixed(6)} · Lng: {position.lng.toFixed(6)}
                </div>
              )}
            </div>

            {/* Téléversement Photo */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={styles.label}>📸 Photo témoin (Optionnel)</label>
              <div style={styles.photoFrame}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Aperçu inondation" style={{ maxWidth: '100%', maxHeight: '140px', borderRadius: '12px', objectFit: 'cover' }} />
                ) : (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🖼️</div>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Glissez ou prenez une photo sur le terrain</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.85rem' }}
              />
              
              {extractingGps && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#fef3c7', borderRadius: '12px', fontSize: '0.75rem', textAlign: 'center', color: '#b45309' }}>
                  ⏳ Analyse des métadonnées EXIF de l'image...
                </div>
              )}
              
              {photoGps && (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#dbeafe', borderRadius: '12px', fontSize: '0.8rem', color: '#1e40af' }}>
                  <p style={{ margin: '0 0 0.25rem 0' }}><strong>📍 Lieu d'ancrage trouvé dans la photo !</strong></p>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem' }}>{photoGps.lat.toFixed(6)}, {photoGps.lng.toFixed(6)}</p>
                  <button type="button" onClick={usePhotoLocation} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.35rem 1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
                    🗺️ Appliquer cette position au signalement
                  </button>
                </div>
              )}
              
              {photo && !extractingGps && !photoGps && (
                <p style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.4rem', lineHeight: '1.3' }}>
                  ⚠️ Aucun tag GPS trouvé sur cette image. Nous utiliserons la géolocalisation de votre téléphone.
                </p>
              )}
            </div>

            {/* Niveau de gravité de l'eau */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={styles.label}>💧 Gravité de la situation</label>
              <select
                value={niveauEau}
                onChange={(e) => setNiveauEau(e.target.value)}
                required
                style={styles.input}
              >
                <option value="">-- Évaluer la hauteur d'eau --</option>
                <option value="leger">⚠️ Léger : Voie impraticable / Chaussée inondée</option>
                <option value="maisons_touchees">🏠 Modéré : Habitations et cours infiltrées</option>
                <option value="critique">🚨 Grave : Crues critiques / Évacuation nécessaire</option>
              </select>
            </div>

            {/* Description contextuelle */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={styles.label}>📝 Précisions utiles</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                style={styles.input}
                placeholder="Ex: Courant fort, canalisation bouchée, personnes bloquées à l'étage..."
              />
            </div>

            {/* Bouton de soumission global */}
            <button
              type="submit"
              disabled={loading || geocoding}
              style={{
                ...styles.btnDanger,
                opacity: (loading || geocoding) ? 0.6 : 1,
                cursor: (loading || geocoding) ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px 0 rgba(220, 38, 38, 0.3)'
              }}
            >
              {geocoding ? '📍 Identification du quartier...' : loading ? '⏳ Envoi du rapport...' : '🚨 ENVOYER LE SIGNALEMENT'}
            </button>
          </form>
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

export default Signaler;