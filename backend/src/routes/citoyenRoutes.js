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

// 1. Vérifier si le citoyen est abonné (Correction : Recherche par EMAIL unique du compte connecté)
router.get('/verifier-abonnement-email', estCitoyen, async (req, res) => {
  try {
    const citoyen = await prisma.citoyens.findUnique({
      where: { id: req.utilisateur.id }
    });

    if (!citoyen || !citoyen.email) {
      return res.json({ abonne: false });
    }

    const abonne = await prisma.abonnes_email.findFirst({
      where: { 
        email: citoyen.email,
        actif: true 
      }
    });

    return res.json({ abonne: !!abonne });
  } catch (error) {
    console.error('❌ Erreur vérification:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. S'abonner ou modifier (URL synchronisée avec React : /sabonner-alertes)
// 2. S'abonner ou modifier (Réservé aux citoyens connectés)
router.post('/sabonner-alertes', estCitoyen, async (req, res) => {
  try {
    // 1. On récupère les infos réelles du citoyen connecté
    const citoyen = await prisma.citoyens.findUnique({
      where: { id: req.utilisateur.id }
    });

    if (!citoyen || !citoyen.email) {
      return res.status(400).json({ error: "Votre compte citoyen ne possède pas d'adresse email." });
    }

    const nomComplet = `${citoyen.nom} ${citoyen.prenom || ''}`.trim();
    const communeCible = citoyen.commune || 'Cotonou';

    // Déduction automatique du département
    let departementAuto = 'Littoral'; 
    const communeLower = communeCible.toLowerCase();
    if (['porto-novo', 'akpro-missérété', 'avrankou', 'adjarra', 'semè-podji'].includes(communeLower)) departementAuto = 'Ouémé';
    else if (['abomey-calavi', 'so-ava', 'ouidah', 'allada', 'toffo', 'zè'].includes(communeLower)) departementAuto = 'Atlantique';

    // 2. On cherche si un abonnement existe déjà pour cet email
    const abonnementExistant = await prisma.abonnes_email.findUnique({
      where: { email: citoyen.email }
    });

    let abonne;
    if (abonnementExistant) {
      abonne = await prisma.abonnes_email.update({
        where: { id: abonnementExistant.id },
        data: { actif: true, commune: communeCible, departement: departementAuto }
      });
    } else {
      abonne = await prisma.abonnes_email.create({
        data: {
          email: citoyen.email,
          telephone: citoyen.telephone || null,
          commune: communeCible,
          departement: departementAuto,
          nom: nomComplet,
          actif: true
        }
      });
    }

    console.log(`🎉 Abonnement automatique activé pour : ${citoyen.email}`);
    res.json({ success: true, abonne });
  } catch (error) {
    console.error('❌ Erreur abonnement:', error);
    res.status(500).json({ error: error.message });
  }
});
// 3. Se désabonner (Sécurisé par Email)
router.delete('/desabonner-alertes', estCitoyen, async (req, res) => {
  try {
    const citoyen = await prisma.citoyens.findUnique({
      where: { id: req.utilisateur.id }
    });

    if (!citoyen) {
      return res.status(404).json({ error: "Citoyen introuvable" });
    }

    // On cherche l'abonnement lié à l'email unique de ce compte citoyen
    const abonne = await prisma.abonnes_email.findUnique({
      where: { email: citoyen.email }
    });

    if (!abonne) {
      return res.status(444).json({ error: "Aucun abonnement trouvé pour votre adresse email" });
    }

    await prisma.abonnes_email.update({
      where: { id: abonne.id },
      data: { actif: false }
    });

    console.log('🔕 Désabonnement réussi pour l\'email :', citoyen.email);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur désabonnement:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;