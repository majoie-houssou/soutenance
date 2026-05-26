const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Niveaux d'alerte avec leurs configurations
const niveauxConfig = {
  info: { emoji: 'ℹ️', color: '#3b82f6', label: 'Information', importance: 'faible' },
  vigilance: { emoji: '🟡', color: '#eab308', label: 'Vigilance renforcée', importance: 'moyenne' },
  alerte: { emoji: '🟠', color: '#f97316', label: 'Alerte orange', importance: 'haute' },
  urgence: { emoji: '🔴', color: '#dc2626', label: 'URGENCE - Alerte rouge', importance: 'critique' }
};

// Envoi d'alerte par email
const envoyerAlerteEmail = async (destinataires, sujet, message, niveau) => {
  const results = [];
  const config = niveauxConfig[niveau] || niveauxConfig.info;
  
  // Template HTML de l'email
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>InondoBénin - Alerte ${config.label}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
        .header { background: ${config.color}; color: white; padding: 25px 20px; text-align: center; }
        .header h1 { font-size: 24px; margin-bottom: 5px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .content { padding: 25px; }
        .alert-level { background: ${config.color}10; border-left: 4px solid ${config.color}; padding: 12px; margin-bottom: 20px; border-radius: 8px; }
        .message { font-size: 16px; line-height: 1.6; margin: 20px 0; color: #1e293b; }
        .info-box { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; }
        .info-box p { margin: 5px 0; }
        .button { display: inline-block; background: ${config.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 15px; font-weight: bold; }
        .footer { background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="font-size: 40px;">${config.emoji}</div>
          <h1>${config.label}</h1>
          <p>InondoBénin - Plateforme d'alerte inondation</p>
        </div>
        <div class="content">
          <div class="alert-level">
            <strong>📢 ALERTE OFFICIELLE</strong>
          </div>
          <div class="message">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <div class="info-box">
            <p><strong>📅 Date et heure :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            <p><strong>🌊 Plateforme :</strong> InondoBénin</p>
            <p><strong>🔔 Niveau d'alerte :</strong> ${config.label}</p>
          </div>
          <div style="text-align: center;">
            <a href="http://localhost:5173/carte" class="button">🗺️ Voir la carte des risques</a>
          </div>
        </div>
        <div class="footer">
          <p>Cet email est une alerte automatique envoyée par InondoBénin.</p>
          <p>Pour vous désabonner, contactez-nous à <a href="mailto:contact@inondobenin.bj">contact@inondobenin.bj</a></p>
          <p>© 2026 InondoBénin - Le numérique au service de la prévention</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  for (const destinataire of destinataires) {
    try {
      const info = await transporter.sendMail({
        from: `"InondoBénin" <${process.env.EMAIL_USER}>`,
        to: destinataire.email,
        subject: `🌊 InondoBénin - ${config.label} : ${sujet}`,
        html: htmlContent,
        text: `${config.emoji} ${config.label}\n\n${message}\n\n---\nDate: ${new Date().toLocaleString('fr-FR')}\nPlateforme: InondoBénin\nVoir la carte: http://localhost:5173/carte`
      });
      
      results.push({
        email: destinataire.email,
        success: true,
        messageId: info.messageId
      });
      
      console.log(`✅ Email envoyé à ${destinataire.email}`);
      
    } catch (error) {
      console.error(`❌ Erreur email pour ${destinataire.email}:`, error.message);
      results.push({
        email: destinataire.email,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
};

module.exports = { envoyerAlerteEmail, niveauxConfig };