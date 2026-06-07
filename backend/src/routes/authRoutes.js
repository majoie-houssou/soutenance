const express = require('express');
const router = express.Router();
// 🚨 Importation de 'inscription' en plus de 'connexion'
const { connexion, inscription } = require('../controllers/authController');

// Routes publiques
router.post('/connexion', connexion);

// 🚨 Ajout de la route d'inscription pour les citoyens
router.post('/inscription', inscription);

module.exports = router;