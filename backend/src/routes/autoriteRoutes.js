const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { estAutorite } = require('../middleware/authMiddleware');
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const prisma = new PrismaClient();

// Créer le dossier reports s'il n'existe pas
const reportsDir = path.join(__dirname, '../../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Chemin vers Chrome
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// ==================== RAPPORTS PDF ====================

router.post('/rapports/generer', estAutorite, async (req, res) => {
  try {
    // Récupération STRICTE des données du formulaire unique
    const { dateDebut, dateFin, zones, sinistres, ressources } = req.body;
    const nomAutorite = req.utilisateur.nom || 'Autorité';
    const prenomAutorite = req.utilisateur.prenom || '';
    const dateGeneration = new Date().toLocaleString('fr-FR');
    const fileName = `rapport_crise_${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, fileName);

    // Calcul de la durée basée uniquement sur le formulaire
    const debut = new Date(dateDebut);
    const fin   = new Date(dateFin);
    const dureeJours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));

    // Génération du HTML avec UNIQUEMENT les données saisies
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport de Crise - InondoBénin</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    html, body {
      width: 210mm;
      height: 297mm;
      overflow: hidden;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Arial', sans-serif;
      color: #1e293b;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      display: flex;
      flex-direction: column;
    }

    /* ── HEADER ── */
    .header {
      background: linear-gradient(135deg, #0a1f44 0%, #1a56db 100%);
      color: white;
      padding: 30px 40px 25px;
      position: relative;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }
    .logo-section { display: flex; align-items: center; gap: 10px; }
    .logo-icon {
      width: 42px; height: 42px;
      background: rgba(255,255,255,.2);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .logo-text { font-size: 19px; font-weight: 900; letter-spacing: -0.5px; }
    .logo-sub  { font-size: 10px; opacity: 0.7; margin-top: 1px; }
    .doc-ref   { text-align: right; font-size: 10px; opacity: 0.75; line-height: 1.5; }

    .header-title { text-align: center; }
    .header-title h1 { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
    .header-title .subtitle { font-size: 11px; opacity: 0.8; }

    .header-wave {
      position: absolute; bottom: -1px; left: 0; right: 0;
      height: 20px; background: #f8fafc;
      clip-path: ellipse(55% 100% at 50% 100%);
    }

    /* ── BODY ── */
    .body { 
      padding: 25px 40px; 
      background: #f8fafc; 
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .section { margin-bottom: 20px; }
    .section-title {
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: #94a3b8; margin-bottom: 10px;
      padding-bottom: 4px;
      border-bottom: 2px solid #e2e8f0;
    }

    /* Info card */
    .info-grid { display: flex; gap: 12px; }
    .info-card {
      flex: 1;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 16px;
      border-left: 4px solid;
    }
    .info-card .label { font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
    .info-card .value { font-size: 14px; font-weight: 800; color: #0a1f44; }
    .info-card .sub   { font-size: 10px; color: #64748b; }

    /* Chiffres Clés du Formulaire */
    .stats-row { display: flex; gap: 15px; margin-bottom: 20px; }
    .stat-card {
      flex: 1;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 15px 10px;
      text-align: center;
      border-top: 4px solid;
    }
    .stat-num  { font-size: 24px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
    .stat-label{ font-size: 11px; color: #64748b; font-weight: 600; }

    /* Blocs de texte dynamique */
    .content-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 15px 18px;
      font-size: 13.5px;
      color: #1e293b;
      line-height: 1.6;
      min-height: 60px;
    }

    /* Recommandations fixes */
    .reco-list { list-style: none; }
    .reco-list li {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 6px;
      font-size: 12.5px;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Signature */
    .signature {
      background: linear-gradient(135deg, #0a1f44, #1a56db);
      border-radius: 10px;
      padding: 18px 22px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sig-left .sig-name  { font-size: 15px; font-weight: 800; }
    .sig-left .sig-role  { font-size: 11px; opacity: 0.75; }
    .sig-right { text-align: right; font-size: 10px; opacity: 0.7; line-height: 1.5; }

    /* Footer */
    .footer {
      text-align: center;
      font-size: 9px;
      color: #94a3b8;
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
    }

    .urgence-badge {
      display: inline-block;
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fca5a5;
      border-radius: 99px;
      padding: 3px 12px;
      font-size: 11px;
      font-weight: 700;
      margin-top: 6px;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="header-top">
      <div class="logo-section">
        <div class="logo-icon">🌊</div>
        <div>
          <div class="logo-text">InondoBénin</div>
          <div class="logo-sub">Plateforme nationale d'alerte précoce</div>
        </div>
      </div>
      <div class="doc-ref">
        Réf : RPT-${Date.now().toString().slice(-6)}<br/>
        Généré le : ${dateGeneration}
      </div>
    </div>
    <div class="header-title">
      <h1>📄 RAPPORT DE CRISE</h1>
      <div class="subtitle">Synthèse personnalisée issue du formulaire de déclaration officielle</div>
      <div class="urgence-badge">🚨 Saisie Manuelle Validée</div>
    </div>
    <div class="header-wave"></div>
  </div>

  <!-- BODY -->
  <div class="body">

    <!-- CHIFFRES SAISIS DANS LE FORMULAIRE -->
    <div class="stats-row">
      <div class="stat-card" style="border-top-color:#1a56db">
        <div class="stat-num" style="color:#1a56db">${dureeJours}</div>
        <div class="stat-label">Jours d'analyse déclarés</div>
      </div>
      <div class="stat-card" style="border-top-color:#f97316">
        <div class="stat-num" style="color:#f97316">${sinistres ? parseInt(sinistres).toLocaleString('fr-FR') : '0'}</div>
        <div class="stat-label">Nombre de sinistrés saisis</div>
      </div>
    </div>

    <!-- PÉRIODE SAISIE -->
    <div class="section">
      <div class="section-title">📅 Horodatage de l'événement renseigné</div>
      <div class="info-grid">
        <div class="info-card" style="border-left-color:#1a56db">
          <div class="label">Date de début déclarée</div>
          <div class="value">${new Date(dateDebut).toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
        </div>
        <div class="info-card" style="border-left-color:#16a34a">
          <div class="label">Date de fin déclarée</div>
          <div class="value">${new Date(dateFin).toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
          <div class="sub">Intervalle : ${dureeJours} jour${dureeJours > 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>

    <!-- ZONES SAISIES -->
    <div class="section">
      <div class="section-title">📍 Secteurs &amp; Communes mentionnés</div>
      <div class="content-card">
        ${zones || '<span style="color:#94a3b8; font-style:italic;">Aucune zone renseignée dans le formulaire.</span>'}
      </div>
    </div>

    <!-- RESSOURCES SAISIES -->
    <div class="section">
      <div class="section-title">🚑 Moyens logistiques &amp; Secours déployés</div>
      <div class="content-card">
        ${ressources || '<span style="color:#94a3b8; font-style:italic;">Aucune ressource logistique spécifiée dans le formulaire.</span>'}
      </div>
    </div>

    <!-- RECOMMANDATIONS GENERALES -->
    <div class="section">
      <div class="section-title">💡 Actions Immédiates Recommandées</div>
      <ul class="reco-list">
        <li>📌 Déployer les modules de secours prioritaires sur les secteurs mentionnés ci-dessus.</li>
        <li>📌 Coordonner l'acheminement des vivres et des kits d'urgence selon le nombre de sinistrés (${sinistres || 0}).</li>
        <li>📌 Maintenir le suivi de crise actif jusqu'au terme fixé le ${new Date(dateFin).toLocaleDateString('fr-FR')}.</li>
      </ul>
    </div>

    <div>
      <!-- SIGNATURE -->
      <div class="signature">
        <div class="sig-left">
          <div class="sig-name">👤 ${prenomAutorite} ${nomAutorite}</div>
          <div class="sig-role">Autorité émettrice du formulaire — InondoBénin</div>
        </div>
        <div class="sig-right">
          Rapport à usage officiel<br/>
          <strong>République du Bénin</strong>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        Génération instantanée basée exclusivement sur vos saisies de formulaire à ${dateGeneration}.
      </div>
    </div>

  </div>
</body>
</html>`;

    // Mode simulation si Chrome non trouvé
    if (!fs.existsSync(CHROME_PATH)) {
      const rapport = await prisma.rapports_crise.create({
        data: {
          titre: `Rapport de crise personnalisé - ${dateDebut} à ${dateFin}`,
          zones_touchees: zones,
          nombre_sinistres: sinistres ? parseInt(sinistres) : null,
          ressources_mobilisees: ressources || null,
          url_pdf: `/reports/${fileName}`,
          genere_par: req.utilisateur.id
        }
      });
      return res.json({ success: true, mode: 'simulation', rapport, message: 'Chrome non trouvé.' });
    }

    // Écrire le HTML temporaire
    const htmlPath = path.join(reportsDir, `temp_${Date.now()}.html`);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: CHROME_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    
    const page = await browser.newPage();
    const formattedPath = pathToFileURL(htmlPath).href;
    
    await page.goto(formattedPath, { waitUntil: 'networkidle0', timeout: 30000 });

    // Rendu strict 1 page
    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
    });
    
    await browser.close();

    if (fs.existsSync(htmlPath)) {
      fs.unlinkSync(htmlPath);
    }

    // Sauvegarde en base de données
    const rapport = await prisma.rapports_crise.create({
      data: {
        titre: `Rapport de crise personnalisé - ${dateDebut} à ${dateFin}`,
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

// ==================== GESTION DES ABONNÉS (AUTORITÉ) ====================

// 1. Récupérer les statistiques globales pour le Dashboard de l'autorité
router.get('/stats-dashboard', estAutorite, async (req, res) => {
  try {
    // Compter les abonnés SMS actifs
    const totalSms = await prisma.abonnes_sms.count({
      where: { actif: true }
    });

    // Compter les abonnés Email actifs (Notre nouvelle table !)
    const totalEmail = await prisma.abonnes_email.count({
      where: { actif: true }
    });

    // Compter les signalements de citoyens en attente de validation
    const signalementsEnAttente = await prisma.signalements.count({
      where: { statut: 'en_attente' }
    });

    // Envoyer les compteurs au Frontend
    res.json({
      success: true,
      stats: {
        totalSms,
        totalEmail,
        totalAbonnes: totalSms + totalEmail,
        signalementsEnAttente
      }
    });
  } catch (error) {
    console.error("❌ Erreur lors du calcul des stats du dashboard:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Récupérer la liste complète des citoyens abonnés par Email
router.get('/abonnes-email', estAutorite, async (req, res) => {
  try {
    const listeAbonnes = await prisma.abonnes_email.findMany({
      orderBy: { date_abonnement: 'desc' } // Les plus récents en premier
    });

    res.json({ success: true, abonnes: listeAbonnes });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des abonnés email:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Récupérer la liste complète des citoyens abonnés par SMS
router.get('/abonnes-sms', estAutorite, async (req, res) => {
  try {
    const listeSms = await prisma.abonnes_sms.findMany({
      orderBy: { date_abonnement: 'desc' }
    });

    res.json({ success: true, abonnes: listeSms });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des abonnés SMS:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ENVOI DES ALERTES EMAIL REELLES ====================

router.post('/alertes/email', estAutorite, async (req, res) => {
  try {
    const { zone, message, niveauUrgence } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Le contenu du message est requis." });
    }

    // 1. Configuration du transporteur Nodemailer avec les variables d'environnement
  // Configuration optimisée pour TES variables d'environnement
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // On force le serveur de Gmail en dur
  port: 465,              // On force le port sécurisé en dur
  secure: true,           // true pour le port 465
  auth: {
    user: process.env.EMAIL_USER, // 👈 Utilise TA variable EMAIL_USER
    pass: process.env.EMAIL_PASS, // 👈 Utilise TA variable EMAIL_PASS
  },
});

    // 2. Filtrer les abonnés selon la zone choisie
    let conditionFiltre = { actif: true };

    if (zone !== 'Tous') {
      const deptsVersCommunes = {
        'Littoral': ['cotonou'],
        'Atlantique': ['abomey-calavi', 'calavi', 'allada', 'ouidah'],
        'Ouémé': ['porto-novo', 'porto', 'semè-podji', 'seme'],
        'Mono': ['lokossa', 'grand-popo'],
        'Couffo': ['aplahoué'],
        'Zou': ['abomey', 'bohicon'],
        'Collines': ['dassa', 'savalou'],
        'Borgou': ['parakou'],
        'Alibori': ['kandi'],
        'Atacora': ['natitingou'],
        'Donga': ['djougou']
      };
      const communesAssociees = deptsVersCommunes[zone] || [];
      conditionFiltre.commune = { in: communesAssociees, mode: 'insensitive' };
    }

    // 3. Récupérer les adresses e-mail
    const destinataires = await prisma.abonnes_email.findMany({ where: conditionFiltre });

    if (destinataires.length === 0) {
      return res.status(404).json({ error: `Aucun abonné actif trouvé pour la zone : ${zone}` });
    }

    // Extraire uniquement les adresses email dans un tableau
    const listeEmails = destinataires.map(d => d.email);

    // 4. Définir le design et le contenu de l'e-mail d'alerte
    const enteteAlerte = {
      info: 'ℹ️ INFOS VIGILANCE',
      vigilance: '🟡 VIGILANCE METEO',
      alerte: '🟠 ALERTE INONDATION',
      urgence: '🔴 URGENCE ABSOLUE - EVACUATION'
    };

   const mailOptions = {
  from: `"InondoBénin - Alertes Nationales" <${process.env.EMAIL_USER}>`, // 👈 Ici aussi
  to: process.env.EMAIL_USER, // 👈 Et ici
  bcc: listeEmails,
  subject: `[InondoBénin] ${enteteAlerte[niveauUrgence] || 'Alerte'} - ${zone}`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #0a1f44, #1a56db); padding: 25px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">🌊 InondoBénin</h1>
            <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Système National d'Alerte Précoce</p>
          </div>
          <div style="padding: 30px; background-color: #f8fafc;">
            <div style="background-color: white; border-left: 5px solid #dc2626; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
              <h2 style="margin-top: 0; color: #0a1f44; font-size: 18px;">Message Officiel des Autorités</h2>
              <p style="color: #334155; line-height: 1.6; font-size: 15px; white-space: pre-line;">${message}</p>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 25px; text-align: center;">
              Cet email vous est envoyé automatiquement car vous êtes abonné aux alertes pour la zone : <strong>${zone}</strong>.
            </p>
          </div>
        </div>
      `
    };

    // 5. Envoyer l'e-mail groupé
    await transporter.sendMail(mailOptions);
    console.log(`✅ Vrais emails envoyés avec succès à ${listeEmails.length} personnes.`);

    res.json({ 
      success: true, 
      message: `Alerte réelle envoyée avec succès à ${listeEmails.length} abonné(s).` 
    });

  } catch (error) {
    console.error("❌ Erreur Nodemailer:", error);
    res.status(500).json({ error: `Erreur lors de l'envoi postal : ${error.message}` });
  }
});
module.exports = router;