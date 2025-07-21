# 🎨 Guide de Gestion des Bannières - Dashboard Admin

## 📋 Vue d'ensemble

Le système de gestion des bannières permet de modifier dynamiquement les images et textes de la page d'accueil depuis le dashboard admin, avec synchronisation automatique avec Supabase.

## 🚀 Fonctionnalités

### 🎯 Types de bannières gérées

1. **Slides Hero** (Carousel principal)
   - Images de fond
   - Titres et sous-titres
   - Prix, notes, années
   - Gradients de couleur

2. **Image de fond Cocktail Kits**
   - Image de fond du module cocktail kits

3. **Section Parallax**
   - Image parallax avant le module "Cocktail de la semaine"

## 🛠️ Comment utiliser

### 📁 Accès à la gestion

1. Connectez-vous au dashboard admin
2. Cliquez sur **"Bannières"** dans le menu latéral
3. Vous verrez les 3 sections organisées par type

### ➕ Créer une nouvelle bannière

1. Cliquez sur **"Nouvelle Bannière"**
2. Sélectionnez le **type de bannière**
3. **Uploadez une image** :
   - Glissez-déposez un fichier
   - Ou cliquez "Choisir une image"
   - Ou saisissez une URL directe
4. Remplissez les **champs appropriés** selon le type
5. Définissez l'**ordre d'affichage**
6. Activez/désactivez avec le **switch "Actif"**
7. Cliquez **"Sauvegarder"**

### ✏️ Modifier une bannière existante

1. Dans la carte de la bannière, cliquez sur **"⋯"** (menu actions)
2. Sélectionnez **"Modifier"**
3. Modifiez les champs souhaités
4. Cliquez **"Sauvegarder"**

### 🗑️ Supprimer une bannière

1. Dans la carte de la bannière, cliquez sur **"⋯"** (menu actions)
2. Sélectionnez **"Supprimer"**
3. Confirmez la suppression

### 👁️ Activer/Désactiver une bannière

1. Dans la carte de la bannière, cliquez sur **"⋯"** (menu actions)
2. Sélectionnez **"Activer"** ou **"Désactiver"**

## 📝 Champs spécifiques par type

### 🎠 Slides Hero
- **Titre** : Titre principal (ex: "COCKTAIL\nTIME!")
- **Sous-titre** : Description (ex: "Cocktails artisanaux préparés...")
- **Prix** : Prix affiché (ex: "2500 XAF")
- **Note** : Note affichée (ex: "4.8")
- **Année** : Année affichée (ex: "2020")
- **Gradient** : Sélection du gradient de couleur
- **Image** : Image de fond du slide

### 🍸 Fond Cocktail Kits
- **Titre/Description** : Description optionnelle
- **Image** : Image de fond du module

### 🌅 Section Parallax
- **Titre/Description** : Description optionnelle
- **Image** : Image de la section parallax

## 🔧 Paramètres techniques

### 📊 Base de données
- **Table** : `banners`
- **Colonnes principales** :
  - `type` : Type de bannière
  - `title`, `subtitle` : Textes
  - `price`, `rating`, `year` : Données slides
  - `gradient` : Gradient CSS
  - `image_url` : URL de l'image
  - `is_active` : Statut actif/inactif
  - `sort_order` : Ordre d'affichage

### 🗂️ Storage
- **Bucket** : `product-images`
- **Dossier** : `banners/`
- **Formats supportés** : JPG, PNG, WebP
- **Taille recommandée** : 1920x1080px pour les slides

## 🎨 Gradients disponibles

- Orange : `from-orange-400/50 to-orange-500/50`
- Violet : `from-purple-400/50 to-purple-500/50`
- Bleu : `from-blue-400/50 to-blue-500/50`
- Rose : `from-pink-400/50 to-pink-500/50`
- Vert : `from-green-400/50 to-green-500/50`
- Rouge : `from-red-400/50 to-red-500/50`
- Jaune : `from-yellow-400/50 to-yellow-500/50`
- Indigo : `from-indigo-400/50 to-indigo-500/50`

## 🔄 Synchronisation automatique

Les modifications sont **immédiatement visibles** sur la page d'accueil :
- Les slides hero se mettent à jour automatiquement
- L'image de fond du module cocktail kits change instantanément
- La section parallax s'actualise en temps réel

## ⚠️ Bonnes pratiques

### 📸 Images
- **Résolution** : Minimum 1920x1080px
- **Format** : JPG ou PNG optimisé
- **Poids** : Maximum 2MB par image
- **Ratio** : 16:9 pour les slides hero

### 📝 Textes
- **Titres** : Courts et impactants
- **Sous-titres** : Descriptifs mais concis
- **Utilisez `\n`** dans les titres pour les retours à la ligne

### 🎯 Organisation
- **Ordre d'affichage** : Numérotez de 1 à N
- **Statut actif** : Désactivez temporairement au lieu de supprimer
- **Sauvegarde** : Les anciennes images restent accessibles

## 🚨 Dépannage

### ❌ Image ne s'affiche pas
1. Vérifiez l'URL de l'image
2. Vérifiez les permissions du bucket Supabase
3. Testez l'image dans un nouvel onglet

### 🔄 Modifications non visibles
1. Rafraîchissez la page d'accueil (Ctrl+F5)
2. Vérifiez que la bannière est **active**
3. Vérifiez l'ordre d'affichage

### 💾 Erreur de sauvegarde
1. Vérifiez la connexion internet
2. Vérifiez la taille de l'image (< 2MB)
3. Réessayez après quelques secondes

## 📞 Support

En cas de problème, vérifiez :
1. La console du navigateur (F12)
2. Les logs Supabase
3. La connectivité réseau

---

✅ **Le système de bannières est maintenant opérationnel !**
Toutes les modifications sont synchronisées en temps réel avec la page d'accueil.
