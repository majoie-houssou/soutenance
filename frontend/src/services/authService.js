const API_URL = 'http://localhost:5000/api/auth';

export const login = async (identifiant, motDePasse) => {
  try {
    console.log('Envoi requête:', { identifiant, motDePasse });
    
    const response = await fetch(`${API_URL}/connexion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifiant, motDePasse })
    });

    const data = await response.json();
    console.log('Réponse reçue:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Erreur de connexion');
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        nom: data.nom,
        role: data.role
      }));
    }

    return data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
  window.location.href = '/';
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getRole = () => {
  return localStorage.getItem('role');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};