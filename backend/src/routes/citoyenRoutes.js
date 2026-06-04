const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { estCitoyen } = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

// Récupérer tous les signalements du citoyen connecté
router.get('/mes-signalements', estCitoyen, async (req, res) => {
  try {
    const signalements = await prisma.signalements.findMany({
      where: { citoyen_id: req.utilisateur.id },
      orderBy: { date_creation: 'desc' }
    });
    res.json(signalements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un nouveau signalement
router.post('/signaler', estCitoyen, async (req, res) => {
  try {
    const { latitude, longitude, niveau_eau, description, lieu, photo_url } = req.body;

    if (!latitude || !longitude || !niveau_eau) {
      return res.status(400).json({ error: 'Latitude, longitude et niveau d\'eau requis' });
    }

    const signalement = await prisma.signalements.create({
      data: {
        citoyens: {
          connect: { id: req.utilisateur.id }
        },
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        niveau_eau: niveau_eau,
        description: description || null,
        lieu: lieu || null,
        photo_url: photo_url || null,
        statut: 'en_attente'
      }
    });

    console.log('✅ Signalement créé:', signalement.id, 'Lieu:', lieu);
    res.status(201).json({ success: true, signalement });
  } catch (error) {
    console.error('❌ Erreur création signalement:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ABONNEMENT EMAIL ====================

// Vérifier si le citoyen est abonné
router.get('/verifier-abonnement-email', estCitoyen, async (req, res) => {
  try {
    const abonne = await prisma.abonnes_email.findFirst({
      where: { email: req.utilisateur.email }
    });
    res.json({ abonne: !!abonne, abonneData: abonne });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/s-abonner-email', estCitoyen, async (req, res) => {
  try {
    const { email, telephone, commune } = req.body;

    console.log('📧 Tentative abonnement:', { email, telephone, commune });

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    const abonne = await prisma.abonnes_email.upsert({
      where: { email },
      update: {
        telephone: telephone || null,
        commune: commune || 'Cotonou',
        actif: true
      },
      create: {
        email,
        telephone: telephone || null,
        commune: commune || 'Cotonou',
        nom: req.utilisateur.nom || 'Citoyen',
        actif: true
      }
    });

    console.log('✅ Abonnement réussi pour:', email);
    res.json({ success: true, abonne });
  } catch (error) {
    console.error('❌ Erreur abonnement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Se désabonner des alertes email
router.post('/se-desabonner-email', estCitoyen, async (req, res) => {
  try {
    await prisma.abonnes_email.update({
      where: { email: req.utilisateur.email },
      data: { actif: false }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;