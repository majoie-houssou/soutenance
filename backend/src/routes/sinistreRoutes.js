const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { estAutorite } = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

// 1. GET : Récupérer tous les sinistrés (Espace Autorité)
router.get('/', estAutorite, async (req, res) => {
  try {
    const sinistres = await prisma.sinistres.findMany({
      orderBy: { id: 'desc' }
    });
    return res.json(sinistres);
  } catch (error) {
    console.error('❌ Erreur GET /api/sinistres:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 2. POST : Enregistrer un nouveau sinistré (Bouton "+ Nouveau sinistré")
router.post('/', estAutorite, async (req, res) => {
  try {
    const { nom_famille, nombre_personnes, besoins, telephone, heberge_dans, latitude, longitude } = req.body;

    console.log("📥 Requête POST reçue pour un sinistré:", req.body);

    const nbPersonnes = parseInt(nombre_personnes, 10);

    const nouveauSinistre = await prisma.sinistres.create({
      data: {
        nom_famille: nom_famille,
        nombre_personnes: isNaN(nbPersonnes) ? 1 : nbPersonnes,
        besoins: besoins || null,
        telephone: telephone || null,
        heberge_dans: heberge_dans || null,
        ville: "Cotonou", // Valeur par défaut de la plateforme
        quartier: "Non précisé",
        statut: "en_attente",
        // Nettoyage des coordonnées géographiques envoyées par React
        latitude: latitude && latitude !== "" ? parseFloat(latitude) : null,
        longitude: longitude && longitude !== "" ? parseFloat(longitude) : null
      }
    });

    console.log("✅ Sinistré créé avec succès. ID:", nouveauSinistre.id);
    return res.status(201).json(nouveauSinistre);
  } catch (error) {
    console.error("❌ Erreur POST /api/sinistres:", error);
    return res.status(500).json({ error: "Erreur lors de la création du sinistré." });
  }
});

// 3. PUT : Modifier un sinistré complet (Icône Crayon ✏️)
router.put('/:id', estAutorite, async (req, res) => {
  try {
    const { id } = req.params;
    const { nom_famille, nombre_personnes, besoins, telephone, heberge_dans, latitude, longitude } = req.body;

    const modifie = await prisma.sinistres.update({
      where: { id: parseInt(id, 10) },
      data: {
        nom_famille,
        nombre_personnes: parseInt(nombre_personnes, 10) || 1,
        besoins: besoins || null,
        telephone: telephone || null,
        heberge_dans: heberge_dans || null,
        latitude: latitude && latitude !== "" ? parseFloat(latitude) : null,
        longitude: longitude && longitude !== "" ? parseFloat(longitude) : null
      }
    });
    return res.json(modifie);
  } catch (error) {
    console.error("❌ Erreur PUT /api/sinistres/:id:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 4. PUT : Modifier le statut (Boutons d'action rapide ✅ et 🏠)
router.put('/:id/statut', estAutorite, async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const statutMisAJour = await prisma.sinistres.update({
      where: { id: parseInt(id, 10) },
      data: { statut }
    });
    return res.json(statutMisAJour);
  } catch (error) {
    console.error("❌ Erreur PUT statut:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 5. DELETE : Supprimer un sinistré (Icône Poubelle 🗑️)
router.delete('/:id', estAutorite, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.sinistres.delete({
      where: { id: parseInt(id, 10) }
    });
    return res.json({ success: true, message: "Sinistré supprimé avec succès." });
  } catch (error) {
    console.error("❌ Erreur DELETE sinistre:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;