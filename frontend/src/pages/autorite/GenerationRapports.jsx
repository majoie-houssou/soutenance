import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GenerationRapports = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dateDebut: '',
    dateFin: '',
    zones: '',
    sinistres: '',
    ressources: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.dateDebut || !formData.dateFin) {
      setError('Veuillez renseigner les dates');
      return;
    }
    if (!formData.zones) {
      setError('Veuillez renseigner les zones touchées');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/autorite/rapports/generer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dateDebut: formData.dateDebut,
          dateFin: formData.dateFin,
          zones: formData.zones,
          sinistres: formData.sinistres || '0',
          ressources: formData.ressources || 'Non spécifiées'
        })
      });

      if (response.ok) {
        // Récupérer le PDF et le télécharger
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = `rapport_crise_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la génération');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      dateDebut: '',
      dateFin: '',
      zones: '',
      sinistres: '',
      ressources: ''
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer' }}>
            ← Retour
          </button>
          <button onClick={handleReset} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer' }}>
            🗑️ Réinitialiser
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
          
          <div style={{ background: '#1e3a8a', padding: '1.5rem', color: 'white', textAlign: 'center' }}>
            <h1 style={{ margin: 0 }}>📄 Rapport de crise PDF</h1>
            <p style={{ opacity: 0.9, margin: '0.25rem 0 0' }}>Générez un rapport automatique de fin de crise</p>
          </div>

          <div style={{ padding: '1.5rem' }}>
            
            {success && (
              <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
                ✅ Rapport généré et téléchargé avec succès !
              </div>
            )}
            
            {error && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>📅 Date de début *</label>
                <input
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>📅 Date de fin *</label>
                <input
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>📍 Zones touchées *</label>
                <input
                  type="text"
                  placeholder="Ex: Cotonou, Grand-Popo, Sèmè-Kraké"
                  value={formData.zones}
                  onChange={(e) => setFormData({ ...formData, zones: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>👥 Nombre de sinistrés</label>
                <input
                  type="number"
                  placeholder="Ex: 562000"
                  value={formData.sinistres}
                  onChange={(e) => setFormData({ ...formData, sinistres: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>🚑 Ressources mobilisées</label>
                <textarea
                  placeholder="Ex: 450 secouristes, 85 véhicules, 50 000 kits d'urgence"
                  value={formData.ressources}
                  onChange={(e) => setFormData({ ...formData, ressources: e.target.value })}
                  rows="3"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#f59e0b',
                  color: 'white',
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {loading ? '⏳ Génération en cours...' : '📄 GÉNÉRER ET TÉLÉCHARGER LE PDF'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e3a8a' }}>📋 Le rapport contiendra :</h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                <li>✓ Zones touchées et départements concernés</li>
                <li>✓ Nombre de sinistrés et victimes</li>
                <li>✓ Durée de la crise</li>
                <li>✓ Ressources mobilisées (secouristes, véhicules, kits)</li>
                <li>✓ Recommandations post-crise</li>
              </ul>
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: '12px', fontSize: '0.7rem', color: '#92400e' }}>
              💡 Le rapport sera automatiquement téléchargé au format PDF après génération.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationRapports;