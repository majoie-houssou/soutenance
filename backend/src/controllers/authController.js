const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'inondobenin_secret_key_2026';

const connexion = async (req, res) => {
  const { identifiant, motDePasse } = req.body;

  console.log('=== TENTATIVE DE CONNEXION ===');
  console.log('Identifiant reçu:', identifiant);
  console.log('Mot de passe reçu:', motDePasse);

  try {
    // 1. Chercher dans les citoyens (par téléphone)
    console.log('Recherche dans citoyens...');
    let user = await prisma.citoyens.findUnique({
      where: { telephone: identifiant }
    });
    let role = 'CITOYEN';

    // 2. Si non trouvé, chercher dans les autorités (par email)
    if (!user) {
      console.log('Non trouvé dans citoyens, recherche dans autorites...');
      user = await prisma.autorites.findUnique({
        where: { email: identifiant }
      });
      role = 'AUTORITE';
    }

    if (!user) {
      console.log('❌ Utilisateur non trouvé dans aucune table');
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    console.log('✅ Utilisateur trouvé:', user.telephone || user.email);
    console.log('Rôle détecté:', role);
    console.log('Mot de passe stocké (hash):', user.mot_de_passe);

    // 4. Vérifier le mot de passe
    const motDePasseValide = await bcrypt.compare(motDePasse, user.mot_de_passe);
    console.log('Mot de passe valide:', motDePasseValide);

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
    console.error('❌ ERREUR:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { connexion };