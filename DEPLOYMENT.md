# 🚀 Guide de Déploiement - Akanda Apéro

## Variables d'environnement requises pour Netlify

Pour que l'application fonctionne correctement sur Netlify, vous devez configurer les variables d'environnement suivantes dans l'interface Netlify :

### 📋 Variables Supabase (OBLIGATOIRES)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://mcdpzoisorbnhkjhljaj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZHB6b2lzb3JibmhramhsamFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjM3ODQsImV4cCI6MjA2MjE5OTc4NH0.S4omBGzpY3_8TEYJD2YBQwoyZg67nBOEJIUrZ4pZkcA
NEXT_PUBLIC_SITE_URL=https://akanda-apero.netlify.app
```

### 🔧 Comment configurer sur Netlify

1. **Aller dans votre dashboard Netlify**
2. **Sélectionner votre site Akanda Apéro**
3. **Aller dans Site settings > Environment variables**
4. **Ajouter chaque variable une par une :**
   - Cliquer sur "Add variable"
   - Entrer le nom (ex: `NEXT_PUBLIC_SUPABASE_URL`)
   - Entrer la valeur correspondante
   - Cliquer sur "Create variable"

### 📦 Configuration automatique

Les variables sont également définies dans `netlify.toml` mais il est recommandé de les configurer via l'interface Netlify pour plus de sécurité.

### 🔄 Redéploiement

Après avoir ajouté les variables d'environnement :
1. **Trigger deploy** depuis l'interface Netlify
2. Ou **Push un nouveau commit** pour déclencher un build automatique

### ✅ Vérification

Une fois déployé, l'application devrait :
- ✅ Charger sans erreur "supabaseUrl is required"
- ✅ Afficher les données Supabase sur la page d'accueil
- ✅ Permettre l'accès au dashboard admin
- ✅ Synchroniser les données en temps réel

### 🆘 Dépannage

Si le build échoue encore :
1. Vérifier que toutes les variables sont bien définies
2. Vérifier qu'il n'y a pas de fautes de frappe
3. Redéployer manuellement depuis Netlify
4. Consulter les logs de build pour plus de détails

---

**🎯 L'application Akanda Apéro sera alors pleinement fonctionnelle sur Netlify !**
