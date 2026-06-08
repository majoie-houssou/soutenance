const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ========== IMPORT DES ROUTES ==========
const authRoutes = require('./src/routes/authRoutes');
const citoyenRoutes = require('./src/routes/citoyenRoutes');
const autoriteRoutes = require('./src/routes/autoriteRoutes');
const sinistreRoutes = require('./src/routes/sinistreRoutes'); // 👈 Import des sinistrés
const { estAutorite } = require('./src/middleware/authMiddleware');

// ========== ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/citoyen', citoyenRoutes);
app.use('/api/autorite', autoriteRoutes);
app.use('/api/sinistres', sinistreRoutes); // 👈 Montage du routeur sur /api/sinistres

// ========== ROUTES PUBLIQUES ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'InondoBénin API' });
});

app.get('/api/public/zones', async (req, res) => {
  try {
    const zones = await prisma.zones_risque.findMany();
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/public/alertes', async (req, res) => {
  try {
    const alertes = await prisma.alertes_departement.findMany({
      where: {
        date_debut: { lte: new Date() },
        date_fin: { gte: new Date() }
      }
    });
    res.json(alertes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/public/consignes/:niveauAlerte', async (req, res) => {
  try {
    const consignes = await prisma.consignes_securite.findMany({
      where: { niveau_alerte: req.params.niveauAlerte }
    });
    res.json(consignes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/public/historique', async (req, res) => {
  try {
    const historique = await prisma.historique_inondations.findMany({
      orderBy: { annee: 'desc' }
    });
    res.json(historique);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/public/evacuation-points', async (req, res) => {
  try {
    const points = await prisma.points_evacuation.findMany();
    res.json(points);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ROUTES POUR L'AUTORITÉ (GESTION DES SIGNALEMENTS) ==========
app.get('/api/signalements-test', estAutorite, async (req, res) => {
  try {
    const signalements = await prisma.signalements.findMany({
      orderBy: { date_creation: 'desc' }
    });
    console.log(`📋 ${signalements.length} signalements (test)`, signalements);
    res.json({ count: signalements.length, data: signalements });
  } catch (error) {
    console.error('Erreur test:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/signalements', estAutorite, async (req, res) => {
  try {
    console.log('📋 Requête /api/signalements reçue');
    const signalements = await prisma.signalements.findMany();
    console.log(`✅ ${signalements.length} signalements récupérés`);
    
    const result = [];
    for (const sig of signalements) {
      let citoyenData = null;
      if (sig.citoyen_id) {
        try {
          citoyenData = await prisma.citoyens.findUnique({
            where: { id: sig.citoyen_id }
          });
        } catch (err) {
          console.error('Erreur récupération citoyen:', err);
        }
      }
      result.push({
        ...sig,
        citoyens: citoyenData
      });
    }
    
    console.log(`📤 Envoi de ${result.length} signalements enrichis`);
    res.json(result);
  } catch (error) {
    console.error('❌ Erreur /api/signalements:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.put('/api/signalements/:id/statut', estAutorite, async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const signalement = await prisma.signalements.update({
      where: { id: parseInt(id) },
      data: { statut, date_traitement: new Date() }
    });
    console.log(`✅ Signalement ${id} mis à jour: ${statut}`);
    res.json(signalement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/public/inscription-signalement', async (req, res) => {
  try {
    const { telephone, motDePasse, nom, latitude, longitude, niveau_eau, description } = req.body;
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');

    let citoyen = await prisma.citoyens.findUnique({
      where: { telephone }
    });

    if (!citoyen) {
      const hashedPassword = await bcrypt.hash(motDePasse || 'citoyen123', 10);
      citoyen = await prisma.citoyens.create({
        data: {
          telephone,
          mot_de_passe: hashedPassword,
          nom: nom || 'Citoyen',
          date_inscription: new Date()
        }
      });
    }

    const signalement = await prisma.signalements.create({
      data: {
        citoyens: {
          connect: { id: citoyen.id }
        },
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        niveau_eau,
        description: description || null,
        statut: 'en_attente'
      }
    });

    const token = jwt.sign(
      { id: citoyen.id, role: 'CITOYEN', nom: citoyen.nom },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: citoyen.id, nom: citoyen.nom, telephone: citoyen.telephone },
      signalement
    });

  } catch (error) {
    console.error('Erreur inscription-signalement:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ALERTES PAR COMMUNE ====================
app.get('/api/public/alertes/commune/:commune', async (req, res) => {
  try {
    const { commune } = req.params;
    
    const zone = await prisma.zones_risque.findFirst({
      where: { commune: commune }
    });
    
    if (!zone) {
      return res.json(null);
    }
    
    const departement = zone.departement;
    
    const alerte = await prisma.alertes_departement.findFirst({
      where: {
        departement: departement,
        date_debut: { lte: new Date() },
        date_fin: { gte: new Date() }
      }
    });
    
    res.json(alerte);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SIGNALEMENTS PAR COMMUNE ====================
app.get('/api/signalements/commune/:commune', async (req, res) => {
  try {
    const { commune } = req.params;
    
    const zones = await prisma.zones_risque.findMany({
      where: { commune: commune }
    });
    
    const zoneIds = zones.map(z => z.id);
    
    const signalements = await prisma.signalements.findMany({
      where: {
        zone_risque_id: { in: zoneIds }
      },
      orderBy: { date_creation: 'desc' },
      take: 10
    });
    
    res.json(signalements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== DÉMARRAGE ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/connexion`);
});