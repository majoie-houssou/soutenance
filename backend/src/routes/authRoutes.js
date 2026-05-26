const express = require('express');
const router = express.Router();
const { connexion } = require('../controllers/authController');

// Routes publiques
router.post('/connexion', connexion);

module.exports = router;