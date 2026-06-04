const express = require('express');
const router = express.Router();

router.post('/rapports/generer', estAutorite, async (req, res) => {
  try {
    const { dateDebut, dateFin, zones, sinistres, ressources } = req.body;
    const nomAutorite = req.utilisateur.nom || 'Autorité';
    const prenomAutorite = req.utilisateur.prenom || '';
    const dateGeneration = new Date().toLocaleString('fr-FR');
    const fileName = `rapport_crise_${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, fileName);

    // Calcul durée de crise
    const debut = new Date(dateDebut);
    const fin   = new Date(dateFin);
    const dureeJours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));

    // Récupérer stats réelles depuis la base
    const [totalSignalements, totalSinistresDB] = await Promise.all([
      prisma.signalements.count(),
      prisma.sinistres.count(),
    ]);

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport de Crise - InondoBénin</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Arial', sans-serif;
      color: #1e293b;
      background: #fff;
      padding: 0;
    }

    /* ── HEADER ── */
    .header {
      background: linear-gradient(135deg, #0a1f44 0%, #1a56db 100%);
      color: white;
      padding: 40px 50px 30px;
      position: relative;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .logo-section { display: flex; align-items: center; gap: 12px; }
    .logo-icon {
      width: 50px; height: 50px;
      background: rgba(255,255,255,.2);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
    }
    .logo-text { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
    .logo-sub  { font-size: 11px; opacity: 0.7; margin-top: 2px; }
    .doc-ref   { text-align: right; font-size: 11px; opacity: 0.75; line-height: 1.6; }

    .header-title { text-align: center; }
    .header-title h1 { font-size: 28px; font-weight: 900; margin-bottom: 6px; }
    .header-title .subtitle { font-size: 13px; opacity: 0.8; }

    .header-wave {
      position: absolute; bottom: -1px; left: 0; right: 0;
      height: 30px; background: #f8fafc;
      clip-path: ellipse(55% 100% at 50% 100%);
    }

    /* ── BODY ── */
    .body { padding: 30px 50px 50px; background: #f8fafc; }

    /* Section */
    .section { margin-bottom: 28px; }
    .section-title {
      font-size: 13px; font-weight: 700;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: #94a3b8; margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #e2e8f0;
    }

    /* Info card */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .info-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 18px;
      border-left: 4px solid;
    }
    .info-card .label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
    .info-card .value { font-size: 15px; font-weight: 800; color: #0a1f44; }
    .info-card .sub   { font-size: 11px; color: #64748b; margin-top: 2px; }

    /* Stats */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .stat-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px 12px;
      text-align: center;
      border-top: 4px solid;
    }
    .stat-num  { font-size: 26px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
    .stat-label{ font-size: 11px; color: #64748b; font-weight: 600; }

    /* Zones */
    .zones-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px 20px;
    }
    .zones-text { font-size: 14px; color: #1e293b; line-height: 1.6; }

    /* Ressources */
    .ressources-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px 20px;
    }
    .ressources-text { font-size: 14px; color: #475569; line-height: 1.7; }

    /* Recommandations */
    .reco-list { list-style: none; }
    .reco-list li {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #475569;
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    .reco-list li .reco-icon { flex-shrink: 0; font-size: 15px; }

    /* Signature */
    .signature {
      background: linear-gradient(135deg, #0a1f44, #1a56db);
      border-radius: 14px;
      padding: 22px 24px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 30px;
    }
    .sig-left .sig-name  { font-size: 16px; font-weight: 800; }
    .sig-left .sig-role  { font-size: 12px; opacity: 0.75; margin-top: 3px; }
    .sig-right { text-align: right; font-size: 11px; opacity: 0.7; line-height: 1.7; }

    /* Footer */
    .footer {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }

    /* Urgence badge */
    .urgence-badge {
      display: inline-block;
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fca5a5;
      border-radius: 99px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 700;
      margin-top: 8px;
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
        Généré le : ${dateGeneration}<br/>
        Format : PDF officiel
      </div>
    </div>
    <div class="header-title">
      <h1>📄 RAPPORT DE CRISE</h1>
      <div class="subtitle">Rapport officiel de gestion des inondations — République du Bénin</div>
      <div class="urgence-badge">🚨 Document officiel — InondoBénin</div>
    </div>
    <div class="header-wave"></div>
  </div>

  <!-- BODY -->
  <div class="body">

    <!-- STATS -->
    <div class="stats-row">
      <div class="stat-card" style="border-top-color:#1a56db">
        <div class="stat-num" style="color:#1a56db">${dureeJours}</div>
        <div class="stat-label">Jours de crise</div>
      </div>
      <div class="stat-card" style="border-top-color:#f97316">
        <div class="stat-num" style="color:#f97316">${parseInt(sinistres || 0).toLocaleString('fr-FR')}</div>
        <div class="stat-label">Sinistrés déclarés</div>
      </div>
      <div class="stat-card" style="border-top-color:#dc2626">
        <div class="stat-num" style="color:#dc2626">${totalSignalements}</div>
        <div class="stat-label">Signalements reçus</div>
      </div>
      <div class="stat-card" style="border-top-color:#16a34a">
        <div class="stat-num" style="color:#16a34a">${totalSinistresDB}</div>
        <div class="stat-label">Familles suivies</div>
      </div>
    </div>

    <!-- PÉRIODE -->
    <div class="section">
      <div class="section-title">📅 Période de la crise</div>
      <div class="info-grid">
        <div class="info-card" style="border-left-color:#1a56db">
          <div class="label">Date de début</div>
          <div class="value">${new Date(dateDebut).toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
        </div>
        <div class="info-card" style="border-left-color:#16a34a">
          <div class="label">Date de fin</div>
          <div class="value">${new Date(dateFin).toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
          <div class="sub">Durée totale : ${dureeJours} jour${dureeJours > 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>

    <!-- ZONES -->
    <div class="section">
      <div class="section-title">📍 Zones touchées</div>
      <div class="zones-card">
        <div class="zones-text">${zones}</div>
      </div>
    </div>

    <!-- RESSOURCES -->
    <div class="section">
      <div class="section-title">🚑 Ressources mobilisées</div>
      <div class="ressources-card">
        <div class="ressources-text">${ressources || 'Non spécifiées'}</div>
      </div>
    </div>

    <!-- RECOMMANDATIONS -->
    <div class="section">
      <div class="section-title">💡 Recommandations post-crise</div>
      <ul class="reco-list">
        <li><span class="reco-icon">🏗️</span> Renforcer les infrastructures de drainage dans les zones à risque identifiées.</li>
        <li><span class="reco-icon">📡</span> Étendre la couverture des capteurs hydrologiques dans les zones non surveillées.</li>
        <li><span class="reco-icon">📣</span> Intensifier les campagnes de sensibilisation auprès des populations vulnérables.</li>
        <li><span class="reco-icon">🏠</span> Accélérer le relogement des familles encore hébergées en centres d'accueil.</li>
        <li><span class="reco-icon">📊</span> Mettre à jour la cartographie des zones à risque suite à cet épisode.</li>
      </ul>
    </div>

    <!-- SIGNATURE -->
    <div class="signature">
      <div class="sig-left">
        <div class="sig-name">👤 ${prenomAutorite} ${nomAutorite}</div>
        <div class="sig-role">Autorité responsable — InondoBénin</div>
      </div>
      <div class="sig-right">
        Généré automatiquement par<br/>
        <strong>InondoBénin</strong><br/>
        ${dateGeneration}
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      Ce document est généré automatiquement par la plateforme InondoBénin — République du Bénin<br/>
      Toute reproduction à des fins officielles est autorisée avec mention de la source.
    </div>

  </div>
</body>
</html>`;

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
      return res.json({ success: true, mode: 'simulation', rapport, message: 'Chrome non trouvé — rapport enregistré en base sans PDF.' });
    }

    // Écrire le HTML dans un fichier temporaire
    const htmlPath = path.join(reportsDir, `temp_${Date.now()}.html`);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');

    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: CHROME_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Charger via fichier local (plus fiable que setContent)
    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
    });
    await browser.close();

    // Supprimer le fichier HTML temporaire
    fs.unlinkSync(htmlPath);

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