# Roadmap Pailo — Checklist

## 🔴 Priorité 1 — Ce qui bloque les ventes (1-2 semaines)

### Étape 1 — Page commandes `/dashboard/orders`
- [ ] Liste des commandes avec statut (pending → confirmed → shipped → delivered)
- [ ] Changer le statut d'une commande
- [ ] Voir les détails (produits, client, total)
- [ ] Filtrer par statut

### Étape 2 — Formulaire de commande sur le store public
- [ ] Page `/[subdomain]` → bouton "Add to cart" fonctionnel
- [ ] Panier simple (localStorage)
- [ ] Formulaire checkout (nom, téléphone, adresse)
- [ ] Création d'une commande dans Supabase
- [ ] Confirmation email au commerçant

### Étape 3 — Paiements
- [ ] Cash on delivery (COD)
- [ ] Stripe pour les cartes
- [ ] D17 / Flouci pour la Tunisie

---

## 🟡 Priorité 2 — Ce qui améliore l'expérience (2-3 semaines)

### Étape 4 — WhatsApp complet
- [ ] Recevoir les commandes par WhatsApp
- [ ] Confirmer/refuser une commande par message
- [ ] Briefing quotidien automatique (9h matin)
- [ ] Alertes stock bas
- [ ] Réponses IA via Claude Haiku

### Étape 5 — AI tab dans le builder
- [ ] Analyser le bloc sélectionné
- [ ] Suggérer un meilleur headline
- [ ] Générer du texte basé sur la description du business
- [ ] Traduire en arabe

### Étape 6 — Gestion des produits améliorée
- [ ] Upload image depuis la page `/dashboard/products`
- [ ] Gestion du stock avec alertes
- [ ] Catégories
- [ ] Produits en vedette

---

## 🟢 Priorité 3 — Ce qui scale (1 mois+)

### Étape 7 — SEO et performance
- [ ] Meta tags dynamiques par store
- [ ] Sitemap.xml
- [ ] Open Graph images
- [ ] Score Lighthouse > 90

### Étape 8 — Analytics
- [ ] Visiteurs par jour/semaine
- [ ] Taux de conversion (visiteurs → commandes)
- [ ] Produits les plus vus
- [ ] Graphiques dans le dashboard

### Étape 9 — Domaines personnalisés
- [ ] `sara-candles.com` au lieu de `pailo.io/sara-candles`
- [ ] Intégration Vercel domains API
- [ ] SSL automatique

### Étape 10 — Déploiement production
- [ ] Vercel pour Next.js
- [ ] Railway ou Render pour NestJS
- [ ] Variables d'environnement production
- [ ] CI/CD GitHub Actions
