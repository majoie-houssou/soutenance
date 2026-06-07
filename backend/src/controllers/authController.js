const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'inondobenin_secret_key_2026';

// ========================================================
// 1. ACTION : CONNEXION (Citoyen ou Autorité)
// ========================================================
const connexion = async (req, res) => {
  const { identifiant, motDePasse } = req.body;

  console.log('=== TENTATIVE DE CONNEXION ===');
  console.log('Identifiant reçu:', identifiant);

  try {
    let user = null;
    let role = 'CITOYEN';

    // 1. Chercher dans les citoyens (PARTIE CITOYEN INTACTE 🚫)
    console.log('Recherche dans citoyens...');
    user = await prisma.citoyens.findUnique({
      where: { telephone: identifiant }
    });

    if (!user) {
      user = await prisma.citoyens.findUnique({
        where: { email: identifiant.toLowerCase().trim() }
      });
    }

    // 2. Si toujours non trouvé, chercher dans les autorités
    if (!user) {
      console.log('Non trouvé dans citoyens, recherche dans autorites...');
      
      // 🚨 LOG DE DIAGNOSTIC TEMPORAIRE : On liste les autorités existantes pour voir le vrai e-mail
      const verifAutorites = await prisma.autorites.findMany({ take: 5 });
      console.log('--- [DIAGNOSTIC] Autorités trouvées en BDD : ---');
      console.dir(verifAutorites, { depth: null });
      console.log('------------------------------------------------');

      // Recherche flexible gérant la casse et les espaces
      user = await prisma.autorites.findFirst({
        where: { 
          email: {
            equals: identifiant.toLowerCase().trim(),
            mode: 'insensitive'
          }
        }
      });
      role = 'AUTORITE';
    }

    if (!user) {
      console.log('❌ Utilisateur non trouvé dans aucune table');
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    console.log('✅ Utilisateur trouvé ! Rôle détecté:', role);

    // 4. Vérifier le mot de passe
    const motDePasseValide = await bcrypt.compare(motDePasse, user.mot_de_passe);

    if (!motDePasseValide) {
      console.log('❌ Mot de passe incorrect');
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // 5. Générer le token JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: role,
        nom: user.nom
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Connexion réussie, token généré');
    console.log('===============================\n');

    res.json({
      token,
      role: role,
      nom: user.nom,
      id: user.id,
      message: "Connexion réussie"
    });

  } catch (error) {
    console.error('❌ ERREUR CONNEXION:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ========================================================
// 2. ACTION : INSCRIPTION (Nouveau Citoyen) - TOTALEMENT INTACT 🚫
// ========================================================
const inscription = async (req, res) => {
  const { nom, prenom, telephone, email, motDePasse, commune } = req.body;

  console.log('=== TENTATIVE D\'INSCRIPTION ===');
  console.log('Email reçu:', email);

  try {
    if (!nom || !telephone || !email || !motDePasse) {
      return res.status(400).json({ message: "Champs obligatoires manquants (Nom, Téléphone, Email, Mot de passe)" });
    }

    const emailNormalise = email.toLowerCase().trim();

    const citoyenExistantEmail = await prisma.citoyens.findUnique({
      where: { email: emailNormalise }
    });

    if (citoyenExistantEmail) {
      return res.status(400).json({ message: "Cette adresse email est déjà utilisée." });
    }

    const citoyenExistantTel = await prisma.citoyens.findUnique({
      where: { telephone: telephone.trim() }
    });

    if (citoyenExistantTel) {
      return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé." });
    }

    const sel = await bcrypt.genSalt(10);
    const motDePasseHache = await bcrypt.hash(motDePasse, sel);

    const nouveauCitoyen = await prisma.citoyens.create({
      data: {
        nom: nom.trim(),
        prenom: prenom ? prenom.trim() : null,
        telephone: telephone.trim(),
        email: emailNormalise,
        mot_de_passe: motDePasseHache,
        commune: commune || 'Cotonou'
      }
    });

    const token = jwt.sign(
      { id: nouveauCitoyen.id, role: 'CITOYEN', nom: nouveauCitoyen.nom },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`🎉 Inscription réussie pour le citoyen : ${emailNormalise}`);
    console.log('===================================\n');

    res.status(201).json({
      token,
      role: 'CITOYEN',
      nom: nouveauCitoyen.nom,
      id: nouveauCitoyen.id,
      message: "Inscription réussie avec succès !"
    });

  } catch (error) {
    console.error('❌ ERREUR INSCRIPTION:', error);
    res.status(500).json({ message: "Erreur lors de la création du compte" });
  }
};

module.exports = { connexion, inscription };