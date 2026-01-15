# ✅ CHECKLIST DE DÉPLOIEMENT - TN360 CLIENT DASHBOARD

## 📋 AVANT LE DÉPLOIEMENT

### 🎨 Assets & Médias

- [ ] **Créer les icônes PWA**
  - [ ] favicon-16x16.png
  - [ ] favicon-32x32.png
  - [ ] apple-touch-icon.png (180x180)
  - [ ] safari-pinned-tab.svg
  - [ ] icon-72x72.png
  - [ ] icon-96x96.png
  - [ ] icon-128x128.png
  - [ ] icon-144x144.png
  - [ ] icon-152x152.png
  - [ ] icon-192x192.png
  - [ ] icon-384x384.png
  - [ ] icon-512x512.png

- [ ] **Créer les images SEO**
  - [ ] og-image.jpg (1200x630 pour Open Graph)
  - [ ] logo.png
  - [ ] screenshot-mobile.png (540x720)
  - [ ] screenshot-desktop.png (1280x720)

**Outil recommandé :** https://realfavicongenerator.net/

---

### 🔧 Configuration

- [ ] **Mettre à jour les URLs dans les fichiers**
  - [ ] `index.html` : Remplacer l'URL Cloud Run par votre domaine
  - [ ] `robots.txt` : Mettre à jour l'URL du sitemap
  - [ ] `sitemap.xml` : Remplacer toutes les URLs
  - [ ] `manifest.json` : Vérifier les URLs des icônes
  - [ ] `nginx.conf` : Adapter la CSP si nécessaire

- [ ] **Variables d'environnement**
  - [ ] Créer `.env.production` avec les bonnes valeurs
  - [ ] Vérifier les API endpoints
  - [ ] Configurer les clés API (paiement, analytics, etc.)

- [ ] **Passer de HashRouter à BrowserRouter**
  - [ ] Modifier `src/main.jsx` ou `src/App.jsx`
  - [ ] Remplacer `HashRouter` par `BrowserRouter`
  - [ ] Tester toutes les routes

---

### 📊 SEO & Analytics

- [ ] **Google Analytics / Tag Manager**
  - [ ] Créer un compte Google Analytics 4
  - [ ] Obtenir l'ID de mesure (G-XXXXXXXXXX)
  - [ ] Ajouter le script dans `index.html`
  - [ ] Tester le tracking

- [ ] **Google Search Console**
  - [ ] Ajouter votre site
  - [ ] Vérifier la propriété
  - [ ] Soumettre le sitemap.xml
  - [ ] Configurer les alertes

- [ ] **Sitemap dynamique** (recommandé)
  - [ ] Créer un script pour générer le sitemap
  - [ ] Inclure tous les produits de la base de données
  - [ ] Automatiser la mise à jour

---

### 🔐 Sécurité

- [ ] **Secrets GitHub (pour CI/CD)**
  - [ ] `GCP_PROJECT_ID` : ID du projet Google Cloud
  - [ ] `GCP_SA_KEY` : Clé JSON du service account

- [ ] **Service Account GCP**
  - [ ] Créer un service account
  - [ ] Donner les permissions nécessaires :
    - Cloud Run Admin
    - Storage Admin
    - Service Account User
  - [ ] Télécharger la clé JSON

- [ ] **Headers de sécurité**
  - [ ] Vérifier la CSP dans `nginx.conf`
  - [ ] Adapter selon vos domaines API
  - [ ] Tester avec https://securityheaders.com/

---

### ⚡ Performance

- [ ] **Optimiser les images**
  - [ ] Convertir en WebP/AVIF
  - [ ] Compresser avec TinyPNG ou Squoosh
  - [ ] Ajouter les attributs `loading="lazy"`
  - [ ] Utiliser `srcset` pour le responsive

- [ ] **Lazy Loading**
  - [ ] Implémenter le lazy loading des routes
  - [ ] Créer des composants de chargement (Skeleton)
  - [ ] Tester le code splitting

- [ ] **Bundle Analysis**
  - [ ] Installer `vite-plugin-bundle-analyzer`
  - [ ] Analyser la taille du bundle
  - [ ] Identifier les dépendances volumineuses
  - [ ] Optimiser ou remplacer si nécessaire

---

### ♿ Accessibilité

- [ ] **ARIA Labels**
  - [ ] Ajouter `aria-label` sur tous les boutons icônes
  - [ ] Ajouter `aria-hidden="true"` sur les icônes décoratives
  - [ ] Vérifier les `role` appropriés

- [ ] **Navigation clavier**
  - [ ] Tester la navigation avec Tab
  - [ ] Vérifier que tous les éléments sont accessibles
  - [ ] Ajouter des skip links si nécessaire

- [ ] **Contraste des couleurs**
  - [ ] Vérifier avec https://webaim.org/resources/contrastchecker/
  - [ ] Ratio minimum 4.5:1 pour le texte normal
  - [ ] Ratio minimum 3:1 pour le texte large

- [ ] **Tests automatisés**
  - [ ] Installer axe DevTools
  - [ ] Corriger les erreurs détectées

---

### 🧪 Tests

- [ ] **Tests manuels**
  - [ ] Tester sur Chrome
  - [ ] Tester sur Firefox
  - [ ] Tester sur Safari
  - [ ] Tester sur Edge
  - [ ] Tester sur mobile (iOS)
  - [ ] Tester sur mobile (Android)

- [ ] **Tests de performance**
  - [ ] Lighthouse (Desktop) : Score 90+
  - [ ] Lighthouse (Mobile) : Score 90+
  - [ ] PageSpeed Insights : Score 90+
  - [ ] WebPageTest : Grade A

- [ ] **Tests PWA**
  - [ ] Vérifier l'installabilité (Chrome DevTools > Application)
  - [ ] Tester le manifest.json
  - [ ] Vérifier les icônes
  - [ ] Tester hors ligne (si service worker implémenté)

---

## 🚀 DÉPLOIEMENT

### 🐳 Docker

- [ ] **Build local**
  ```bash
  docker build -t tn360-client-dashboard:latest .
  ```

- [ ] **Test local**
  ```bash
  docker run -p 8080:80 tn360-client-dashboard:latest
  ```
  - [ ] Accéder à http://localhost:8080
  - [ ] Vérifier que tout fonctionne

---

### ☁️ Google Cloud Run

- [ ] **Configuration GCP**
  - [ ] Créer un projet GCP (ou utiliser existant)
  - [ ] Activer Cloud Run API
  - [ ] Activer Container Registry API
  - [ ] Configurer la facturation

- [ ] **Déploiement**
  - [ ] Éditer `deploy.ps1` avec votre PROJECT_ID
  - [ ] Exécuter le script de déploiement
  - [ ] Vérifier le déploiement

- [ ] **Configuration Cloud Run**
  - [ ] Configurer le domaine personnalisé (optionnel)
  - [ ] Configurer le SSL/TLS
  - [ ] Configurer les variables d'environnement
  - [ ] Configurer les limites de ressources

---

### 🔄 CI/CD (GitHub Actions)

- [ ] **Configuration**
  - [ ] Ajouter les secrets GitHub
  - [ ] Vérifier le workflow `.github/workflows/deploy.yml`
  - [ ] Adapter selon vos besoins

- [ ] **Premier déploiement**
  - [ ] Push sur la branche main
  - [ ] Vérifier l'exécution du workflow
  - [ ] Corriger les erreurs si nécessaire

---

## ✅ APRÈS LE DÉPLOIEMENT

### 🔍 Vérifications

- [ ] **URLs fonctionnelles**
  - [ ] https://votre-domaine.com/
  - [ ] https://votre-domaine.com/robots.txt
  - [ ] https://votre-domaine.com/sitemap.xml
  - [ ] https://votre-domaine.com/manifest.json
  - [ ] https://votre-domaine.com/health

- [ ] **Headers de sécurité**
  - [ ] Tester sur https://securityheaders.com/
  - [ ] Score A ou A+ attendu

- [ ] **Performance**
  - [ ] PageSpeed Insights : https://pagespeed.web.dev/
  - [ ] Score 90+ sur mobile et desktop

- [ ] **SEO**
  - [ ] Vérifier l'indexation Google
  - [ ] Soumettre le sitemap dans Search Console
  - [ ] Vérifier les rich snippets

---

### 📊 Monitoring

- [ ] **Google Analytics**
  - [ ] Vérifier que les événements sont trackés
  - [ ] Configurer les objectifs
  - [ ] Configurer les alertes

- [ ] **Google Search Console**
  - [ ] Vérifier l'indexation
  - [ ] Surveiller les erreurs
  - [ ] Analyser les performances de recherche

- [ ] **Cloud Run Monitoring**
  - [ ] Configurer les alertes (erreurs, latence)
  - [ ] Surveiller les logs
  - [ ] Analyser les métriques

- [ ] **Uptime Monitoring**
  - [ ] Configurer un service de monitoring (UptimeRobot, Pingdom)
  - [ ] Configurer les alertes email/SMS

---

### 📱 PWA

- [ ] **Installation**
  - [ ] Tester l'installation sur mobile
  - [ ] Tester l'installation sur desktop
  - [ ] Vérifier les icônes
  - [ ] Vérifier le splash screen

- [ ] **App Stores (optionnel)**
  - [ ] Soumettre sur Google Play (via TWA)
  - [ ] Soumettre sur Microsoft Store

---

### 🎯 Optimisations continues

- [ ] **Performance**
  - [ ] Analyser les Core Web Vitals
  - [ ] Optimiser les ressources lentes
  - [ ] Implémenter un CDN (CloudFlare, AWS CloudFront)

- [ ] **SEO**
  - [ ] Analyser les mots-clés
  - [ ] Optimiser le contenu
  - [ ] Créer des backlinks

- [ ] **Accessibilité**
  - [ ] Audits réguliers avec axe
  - [ ] Tests utilisateurs
  - [ ] Corrections continues

---

## 📝 NOTES

### Commandes utiles

```bash
# Build de production
npm run build

# Prévisualiser le build
npm run preview

# Analyser le bundle
npm run build -- --analyze

# Lighthouse CLI
lighthouse https://votre-url.com --view

# Docker build
docker build -t tn360-client-dashboard:latest .

# Docker run
docker run -p 8080:80 tn360-client-dashboard:latest

# Déploiement Cloud Run
.\deploy.ps1  # Windows
./deploy.sh   # Linux/Mac
```

### Ressources

- **Favicon Generator** : https://realfavicongenerator.net/
- **Image Compression** : https://squoosh.app/
- **Security Headers** : https://securityheaders.com/
- **PageSpeed Insights** : https://pagespeed.web.dev/
- **Contrast Checker** : https://webaim.org/resources/contrastchecker/
- **Bundle Analyzer** : https://bundlephobia.com/

---

## 🎉 FÉLICITATIONS !

Une fois toutes ces étapes complétées, votre application sera :
- ✅ Performante (Lighthouse 90+)
- ✅ Sécurisée (Headers A+)
- ✅ SEO-friendly (Indexable et optimisée)
- ✅ Accessible (WCAG 2.1)
- ✅ PWA (Installable)
- ✅ Prête pour la production !

---

**Date de création :** 2026-01-15  
**Version :** 1.0  
**Dernière mise à jour :** 2026-01-15
