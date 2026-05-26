const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { estAutorite } = require('../middleware/authMiddleware');
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

// Service d'envoi d'emails
const { envoyerAlerteEmail, niveauxConfig } = require('../services/emailService');

const prisma = new PrismaClient();

// Créer le dossier reports s'il n'existe pas
const reportsDir = path.join(__dirname, '../../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Chemin vers Chrome
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// ==================== SIGNALEMENTS ====================

// Récupérer tous les signalements
router.get('/signalements', estAutorite, async (req, res) => {
  try {
    const signalements = await prisma.signalements.findMany({
      orderBy: { date_creation: 'desc' },
      include: {
        citoyens: {
          select: { nom: true, prenom: true, telephone: true }
        }
      }
    });
    res.json(signalements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour le statut d'un signalement
router.put('/signalements/:id/statut', estAutorite, async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const signalement = await prisma.signalements.update({
      where: { id: parseInt(id) },
      data: { statut, date_traitement: new Date() }
    });
    res.json(signalement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SINISTRÉS ====================

// Récupérer tous les sinistrés
router.get('/sinistres', estAutorite, async (req, res) => {
  try {
    const sinistres = await prisma.sinistres.findMany({
      orderBy: { date_enregistrement: 'desc' }
    });
    res.json(sinistres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un sinistré
router.post('/sinistres', estAutorite, async (req, res) => {
  try {
    const { nom_famille, nombre_personnes, besoins, telephone, heberge_dans, latitude, longitude } = req.body;
    const sinistre = await prisma.sinistres.create({
      data: {
        nom_famille,
        nombre_personnes: parseInt(nombre_personnes),
        besoins,
        telephone,
        heberge_dans,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        statut: 'en_attente'
      }
    });
    res.status(201).json(sinistre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour le statut d'un sinistré
router.put('/sinistres/:id/statut', estAutorite, async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const sinistre = await prisma.sinistres.update({
      where: { id: parseInt(id) },
      data: { statut }
    });
    res.json(sinistre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un sinistré
router.delete('/sinistres/:id', estAutorite, async (req, res) => {
  try {
    await prisma.sinistres.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modifier un sinistré
router.put('/sinistres/:id', estAutorite, async (req, res) => {
  try {
    const { id } = req.params;
    const { nom_famille, nombre_personnes, besoins, telephone, heberge_dans, latitude, longitude, statut } = req.body;
    const sinistre = await prisma.sinistres.update({
      where: { id: parseInt(id) },
      data: {
        nom_famille,
        nombre_personnes: parseInt(nombre_personnes),
        besoins,
        telephone,
        heberge_dans,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        statut
      }
    });
    res.json(sinistre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ALERTES SMS (Simulation) ====================

router.get('/abonnes-sms', estAutorite, async (req, res) => {
  try {
    const abonnes = await prisma.abonnes_sms.findMany({
      where: { actif: true },
      orderBy: { date_abonnement: 'desc' }
    });
    res.json(abonnes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/alertes/sms', estAutorite, async (req, res) => {
  try {
    const { zone, message } = req.body;
    let abonnes;
    if (zone === 'Tous') {
      abonnes = await prisma.abonnes_sms.findMany({ where: { actif: true } });
    } else {
      abonnes = await prisma.abonnes_sms.findMany({ where: { actif: true, departement: zone } });
    }
    console.log(`📱 [SIMULATION] Envoi SMS à ${abonnes.length} abonnés dans ${zone}`);
    console.log(`📝 Message: ${message}`);
    await prisma.historiques_sms.create({
      data: { message, destinataires: abonnes.length, statut: 'simule' }
    });
    res.json({ success: true, total: abonnes.length, message: `Alerte envoyée à ${abonnes.length} abonnés dans ${zone}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ALERTES EMAIL (NOUVEAU) ====================

// Récupérer tous les abonnés email
router.get('/abonnes-email', estAutorite, async (req, res) => {
  try {
    const abonnes = await prisma.abonnes_email.findMany({
      where: { actif: true },
      orderBy: { date_abonnement: 'desc' }
    });
    res.json(abonnes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Envoyer une alerte par EMAIL et l'enregistrer en base
router.post('/alertes/email', estAutorite, async (req, res) => {
  try {
    const { zone, message, niveauUrgence } = req.body;
    
   // 1. CRÉER L'ALERTE DANS LA TABLE alertes_departement
const alerte = await prisma.alertes_departement.create({
  data: {
    departement: zone === 'Tous' ? 'National' : zone,
    niveau_alerte: getNiveauAlerte(niveauUrgence),  // ← Utilise la fonction
    message: message,
    consignes: getConsignesByNiveau(niveauUrgence),
    date_debut: new Date(),
    date_fin: new Date(Date.now() + 24 * 60 * 60 * 1000),
    est_automatique: false,
    declenchee_par: req.utilisateur.id
  }
});
    
    // 2. Récupérer les abonnés email dans la zone
    let abonnes;
    if (zone === 'Tous') {
      abonnes = await prisma.abonnes_email.findMany({ where: { actif: true } });
    } else {
      abonnes = await prisma.abonnes_email.findMany({
        where: { actif: true, departement: zone }
      });
    }
    
    // 3. Envoyer les emails
    const sujet = `Alerte ${niveauxConfig[niveauUrgence]?.label || niveauUrgence} - ${zone}`;
    const resultats = await envoyerAlerteEmail(abonnes, sujet, message, niveauUrgence);
    
    const succesCount = resultats.filter(r => r.success).length;
    const echecCount = resultats.filter(r => !r.success).length;
    
    // 4. Enregistrer dans l'historique
    await prisma.historiques_emails.create({
      data: {
        zone,
        message,
        niveau_alerte: niveauUrgence,
        destinataires: abonnes.length,
        succes: succesCount,
        echec: echecCount,
        statut: 'envoye'
      }
    });
    
    res.json({ 
      success: true, 
      alerte,
      total: abonnes.length,
      succes: succesCount,
      echec: echecCount,
      message: `Alerte envoyée à ${succesCount} abonnés et enregistrée en base`
    });
    
  } catch (error) {
    console.error('Erreur envoi email:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fonction pour obtenir les consignes selon le niveau d'alerte
function getNiveauAlerte(niveau) {
  switch(niveau) {
    case 'urgence':
      return 'alerte_rouge';
    case 'alerte':
      return 'alerte_orange';
    case 'vigilance':
      return 'vigilance_renforcee';
    default:
      return 'vigilance_normale';
  }
}

function getConsignesByNiveau(niveau) {
  switch(niveau) {
    case 'urgence':
      return '🔴 ALERTE ROUGE - ÉVACUEZ IMMÉDIATEMENT ! Rendez-vous au point de rassemblement le plus proche.';
    case 'alerte':
      return '🟠 ALERTE ORANGE - Préparez-vous à évacuer. Tenez-vous prêts.';
    case 'vigilance':
      return '🟡 VIGILANCE RENFORCÉE - Restez vigilants. Surveillez l\'évolution de la situation.';
    default:
      return '🟢 VIGILANCE NORMALE - Restez informés via la plateforme InondoBénin.';
  }
}

// Récupérer l'historique des emails envoyés
router.get('/historique-emails', estAutorite, async (req, res) => {
  try {
    const historique = await prisma.historiques_emails.findMany({
      orderBy: { date_envoi: 'desc' },
      take: 50
    });
    res.json(historique);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STATISTIQUES ====================

router.get('/statistiques', estAutorite, async (req, res) => {
  try {
    const totalSignalements = await prisma.signalements.count();
    const enAttente = await prisma.signalements.count({ where: { statut: 'en_attente' } });
    const confirmes = await prisma.signalements.count({ where: { statut: 'confirme' } });
    const critiques = await prisma.signalements.count({ where: { niveau_eau: 'critique' } });
    const totalSinistres = await prisma.sinistres.count();
    const sinistresEnAttente = await prisma.sinistres.count({ where: { statut: 'en_attente' } });
    
    res.json({
      signalements: { total: totalSignalements, enAttente, confirmes, critiques },
      sinistres: { total: totalSinistres, enAttente: sinistresEnAttente }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RAPPORTS PDF ====================

router.post('/rapports/generer', estAutorite, async (req, res) => {
  try {
    const { dateDebut, dateFin, zones, sinistres, ressources } = req.body;
    const nomAutorite = req.utilisateur.nom || 'Autorité';
    const dateGeneration = new Date().toLocaleString('fr-FR');
    
    const fileName = `rapport_crise_${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, fileName);
    
    const htmlContent = `...`; // (contenu HTML identique à avant)
    
    // Mode simulation si Chrome non trouvé
    if (!fs.existsSync(CHROME_PATH)) {
      const rapport = await prisma.rapports_crise.create({
        data: {
          titre: `Rapport de crise - ${dateDebut} à ${dateFin}`,
          zones_touchees: zones,
          nombre_sinistres: sinistres ? parseInt(sinistres) : null,
          ressources_mobilisees: ressources || null,
          url_pdf: `/reports/${fileName}`,
          genere_par: req.utilisateur.id
        }
      });
      return res.json({ success: true, mode: 'simulation', rapport });
    }
    
    const browser = await puppeteer.launch({ headless: true, executablePath: CHROME_PATH });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.pdf({ path: filePath, format: 'A4', printBackground: true });
    await browser.close();
    
    const rapport = await prisma.rapports_crise.create({
      data: {
        titre: `Rapport de crise - ${dateDebut} à ${dateFin}`,
        zones_touchees: zones,
        nombre_sinistres: sinistres ? parseInt(sinistres) : null,
        ressources_mobilisees: ressources || null,
        url_pdf: `/reports/${fileName}`,
        genere_par: req.utilisateur.id
      }
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;