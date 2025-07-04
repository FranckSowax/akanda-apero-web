# 🔐 Identifiants Administrateur - Akanda Apéro

## 👤 **Identifiants de Développement**

### **Administrateur Principal**
```
Email: admin@akanda-apero.com
Mot de passe: AkandaAdmin2024!
Rôle: Super Admin
```

### **Utilisateur de Test**
```
Email: test@akanda-apero.com
Mot de passe: TestUser2024!
Rôle: Utilisateur Standard
```

## 🏪 **Accès aux Différentes Sections**

### **Dashboard Admin**
- URL: `http://localhost:9002/admin/dashboard`
- Fonctionnalités: Gestion produits, commandes, utilisateurs

### **Interface Publique**
- URL: `http://localhost:9002/`
- Fonctionnalités: Catalogue, panier, commande

## 🔧 **Configuration Supabase**

### **Projet Supabase**
- URL: `https://mcdpzoisorbnhkjhljaj.supabase.co`
- Région: Probablement US East (par défaut)

### **Accès Dashboard Supabase**
Pour créer/modifier les utilisateurs :
1. Allez sur `https://supabase.com`
2. Connectez-vous avec le compte propriétaire du projet
3. Sélectionnez le projet `mcdpzoisorbnhkjhljaj`
4. Allez dans Authentication > Users

## ⚠️ **Sécurité - IMPORTANT**

### **En Développement**
- ✅ Ces identifiants sont OK pour le développement local
- ✅ Variables d'environnement dans `.env.local`

### **En Production**
- ❌ **JAMAIS** utiliser ces identifiants en production
- ✅ Créer des identifiants sécurisés uniques
- ✅ Utiliser des mots de passe complexes générés
- ✅ Activer l'authentification à deux facteurs

## 🚀 **Première Connexion**

Si les identifiants ne fonctionnent pas, vous devez :

1. **Créer les utilisateurs dans Supabase** :
   ```sql
   -- Dans le SQL Editor de Supabase
   INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
   VALUES 
   ('admin@akanda-apero.com', crypt('AkandaAdmin2024!', gen_salt('bf')), now(), now(), now()),
   ('test@akanda-apero.com', crypt('TestUser2024!', gen_salt('bf')), now(), now(), now());
   ```

2. **Ou utiliser l'interface Supabase** :
   - Authentication > Users > Invite User
   - Entrer l'email et envoyer l'invitation

## 📞 **Support**

Si vous avez des problèmes d'authentification :
1. Vérifiez que Supabase est accessible
2. Vérifiez les variables d'environnement
3. Consultez les logs de l'application
4. Vérifiez la console développeur du navigateur

---
*Dernière mise à jour : 29 juin 2025*
*⚠️ Document confidentiel - Ne pas partager en production*
