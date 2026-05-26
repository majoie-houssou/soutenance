const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET; // ← plus de fallback

const estConnecte = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "Connexion requise" });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.utilisateur = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Session expirée" });
  }
};

const estAutorite = (req, res, next) => {
  estConnecte(req, res, () => {
    if (req.utilisateur.role !== 'AUTORITE') {
      return res.status(403).json({ message: "Accès réservé aux autorités" });
    }
    next();
  });
};

const estCitoyen = (req, res, next) => {
  estConnecte(req, res, () => {
    if (req.utilisateur.role !== 'CITOYEN') {
      return res.status(403).json({ message: "Accès réservé aux citoyens" });
    }
    next();
  });
};

module.exports = { estConnecte, estAutorite, estCitoyen };