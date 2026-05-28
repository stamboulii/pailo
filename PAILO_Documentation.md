# Pailo — Documentation complète du projet

> **AI-native business co-pilot for small business owners**
> Version 1.0 · Stack: Next.js 15 · NestJS · Supabase · Claude API · Craft.js · WhatsApp API

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture du projet](#2-architecture-du-projet)
3. [Stack technique](#3-stack-technique)
4. [Structure des dossiers](#4-structure-des-dossiers)
5. [Base de données — Supabase](#5-base-de-données--supabase)
6. [Authentification](#6-authentification)
7. [Dashboard](#7-dashboard)
8. [Onboarding — Création de store](#8-onboarding--création-de-store)
9. [Builder — Éditeur visuel](#9-builder--éditeur-visuel)
10. [Blocs disponibles](#10-blocs-disponibles)
11. [Upload de médias](#11-upload-de-médias)
12. [Store publié](#12-store-publié)
13. [API NestJS — WhatsApp](#13-api-nestjs--whatsapp)
14. [Package partagé — AI](#14-package-partagé--ai)
15. [Variables d'environnement](#15-variables-denvironnement)
16. [Commandes utiles](#16-commandes-utiles)
17. [Roadmap](#17-roadmap)

---

## 1. Vue d'ensemble

**Pailo** est un SaaS qui permet aux petits commerçants de créer leur boutique en ligne en quelques minutes, sans compétences techniques. L'idée centrale : Pailo n'est pas un simple constructeur de sites — c'est un **partenaire commercial silencieux** qui travaille 24h/24.

### Ce que fait Pailo

| Fonctionnalité | Description |
|---|---|
| 🏗 **Onboarding visuel** | L'utilisateur choisit parmi 3 variantes par section (header, hero, products, about, footer) |
| 🎨 **Builder drag & drop** | Éditeur Craft.js — édition en temps réel, sauvegarde JSON dans Supabase |
| 🤖 **AI Co-pilot** | Claude analyse les commandes et génère des insights dans le dashboard |
| 📱 **Interface WhatsApp** | Le commerçant gère ses commandes depuis WhatsApp |
| 🌐 **Store public** | Chaque store est publié sur `/[subdomain]` accessible à tout le monde |

---

## 2. Architecture du projet

```
Monorepo (Turborepo + pnpm)
├── apps/web        → Next.js 15 (frontend + API routes)
├── apps/api        → NestJS (WhatsApp webhook + business logic)
└── packages/ai     → Claude API wrapper partagé
```

### Flux de données

```
Utilisateur (browser)
    ↓
Next.js 15 (App Router)
    ↓
Supabase (Postgres + Auth + Storage)
    ↓
Claude API (Anthropic) ← pour l'IA
    ↓
WhatsApp API (Meta) ← via NestJS
```

---

## 3. Stack technique

### Frontend — `apps/web`

| Outil | Version | Usage |
|---|---|---|
| Next.js | 16.2.1 | Framework React, App Router, SSR |
| React | 19.2.4 | UI |
| TypeScript | 5.9 | Typage statique |
| Tailwind CSS | 4.x | Styles utilitaires |
| Craft.js | 0.2.12 | Builder drag & drop |
| Framer Motion | 12.x | Animations |
| @supabase/supabase-js | 2.x | Client Supabase |
| @supabase/ssr | 0.10 | Auth côté serveur |
| @anthropic-ai/sdk | 0.80 | Appels Claude API |

### Backend — `apps/api`

| Outil | Version | Usage |
|---|---|---|
| NestJS | 11.x | Framework API |
| Passport + JWT | — | Authentification API |
| BullMQ | 5.x | File de jobs async |
| IORedis | 5.x | Cache Redis |
| Stripe | 22.x | Paiements (préparé) |
| Prisma | 7.7 | ORM (préparé) |

### Infrastructure

| Service | Usage |
|---|---|
| Supabase | PostgreSQL + Auth + Storage |
| Vercel | Hosting Next.js (prévu) |
| Cloudflare | CDN + DNS (prévu) |
| Meta WhatsApp API | Messages WhatsApp |
| Anthropic | Claude AI |

---

## 4. Structure des dossiers

```
pailo/
├── apps/
│   ├── web/
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (auth)/
│   │       │   │   └── login/
│   │       │   │       └── page.tsx          # Page de connexion (magic link)
│   │       │   ├── auth/
│   │       │   │   └── callback/
│   │       │   │       └── route.ts          # Callback Supabase après magic link
│   │       │   ├── (builder)/
│   │       │   │   ├── editor/
│   │       │   │   │   └── page.tsx          # Page builder (dynamic import)
│   │       │   │   └── [subdomain]/
│   │       │   │       └── page.tsx          # Store public
│   │       │   ├── api/
│   │       │   │   └── generate-store/
│   │       │   │       └── route.ts          # API: génération store par IA
│   │       │   └── dashboard/
│   │       │       ├── layout.tsx            # Layout dashboard (topbar nav)
│   │       │       ├── page.tsx              # Dashboard principal
│   │       │       ├── AIFeed.tsx            # Feed IA (insights Claude)
│   │       │       ├── TopbarNav.tsx         # Navigation supérieure
│   │       │       ├── onboarding/
│   │       │       │   └── page.tsx          # Onboarding creation store
│   │       │       └── builder/
│   │       │           └── page.tsx          # Accès rapide au builder
│   │       ├── components/
│   │       │   ├── builder/
│   │       │   │   ├── blocks/               # Blocs Craft.js existants
│   │       │   │   ├── BuilderSettings.tsx   # Panneau droite (props du bloc)
│   │       │   │   ├── BuilderTopbar.tsx     # Barre du builder + bouton Publish
│   │       │   │   ├── EditorCanvas.tsx      # Canvas principal Craft.js
│   │       │   │   └── StoreRenderer.tsx     # Rendu store public (read-only)
│   │       │   └── onboarding/
│   │       │       ├── types.ts              # Types partagés
│   │       │       ├── sections.ts           # Registre blocs + RESOLVER Craft.js
│   │       │       ├── OnboardingShell.tsx   # Orchestrateur (état global)
│   │       │       ├── steps/
│   │       │       │   └── StepComponents.tsx # StepPick, StepInfo, StepDone
│   │       │       ├── picker/
│   │       │       │   └── PickerComponents.tsx # SectionNav, VariantPicker, LivePreview
│   │       │       └── variants/
│   │       │           ├── header/           # 3 variantes header
│   │       │           ├── hero/             # 3 variantes hero
│   │       │           ├── products/         # 3 variantes products
│   │       │           └── AboutFooterVariants.tsx # About + Footer
│   │       ├── lib/
│   │       │   └── supabase/
│   │       │       ├── client.ts             # Client Supabase (browser)
│   │       │       └── server.ts             # Client Supabase (serveur)
│   │       ├── types/                        # Déclarations TypeScript globales
│   │       └── middleware.ts                 # Protection routes /dashboard
│   │
│   └── api/
│       └── src/
│           ├── app.module.ts
│           └── modules/
│               └── whatsapp/
│                   ├── whatsapp.controller.ts # Webhook WhatsApp (GET + POST)
│                   ├── whatsapp.service.ts    # Logique: router IA + réponse
│                   └── whatsapp.module.ts
│
└── packages/
    ├── ai/
    │   ├── index.ts
    │   └── src/
    │       └── generate-store.ts             # Fonction Claude: description → JSON store
    ├── types/                                # Types TypeScript partagés
    └── whatsapp/                             # Client WhatsApp partagé
```

---

## 5. Base de données — Supabase

### Tables

#### `stores` — Une boutique par utilisateur

```sql
CREATE TABLE stores (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  subdomain    text UNIQUE NOT NULL,    -- URL: /sara-candles
  config_json  jsonb DEFAULT '{}',     -- Canvas Craft.js sérialisé + sélections
  published_at timestamptz,            -- NULL = brouillon, non-NULL = publié
  created_at   timestamptz DEFAULT now()
);
```

**Structure de `config_json` :**
```json
{
  "canvas": "{ ... JSON Craft.js sérialisé ... }",
  "selections": {
    "header": 0,
    "hero": 1,
    "products": 0,
    "about": 2,
    "footer": 0
  },
  "storeName": "Sara's Candles",
  "tagline": "Hand-poured with love"
}
```

#### `orders` — Commandes d'un store

```sql
CREATE TABLE orders (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id       uuid REFERENCES stores(id) ON DELETE CASCADE,
  customer_name  text,
  customer_phone text,
  customer_email text,
  items_json     jsonb DEFAULT '[]',
  total          numeric(10,3) NOT NULL DEFAULT 0,
  status         text NOT NULL DEFAULT 'pending',
  payment_method text DEFAULT 'cod',
  created_at     timestamptz DEFAULT now()
);
```

**Statuts possibles :** `pending` → `confirmed` → `shipped` → `delivered`

#### `products` — Produits d'un store

```sql
CREATE TABLE products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    uuid REFERENCES stores(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  price       numeric(10,3) NOT NULL,
  stock       integer DEFAULT 0,
  images      text[] DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);
```

### Row Level Security (RLS)

Chaque table a des politiques RLS — les utilisateurs ne voient **que leurs propres données**, même en cas de bug dans l'API.

```sql
-- Stores: lecture publique si publié, écriture uniquement au propriétaire
CREATE POLICY "users own stores" ON stores
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "public can read published stores" ON stores
  FOR SELECT USING (published_at IS NOT NULL);
```

### Supabase Storage — Bucket `store-media`

Utilisé pour les images et vidéos uploadées dans le builder.

```sql
-- Politique d'accès
CREATE POLICY "auth users can upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'store-media');

CREATE POLICY "public can read media" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'store-media');
```

---

## 6. Authentification

### Magic Link (Supabase Auth)

Pas de mot de passe — l'utilisateur entre son email, reçoit un lien magique, clique dessus et est connecté.

**Flux complet :**
```
1. Utilisateur → /login → entre son email
2. supabase.auth.signInWithOtp({ email }) → email envoyé
3. Utilisateur clique le lien → /auth/callback?code=xxx
4. exchangeCodeForSession(code) → session créée (cookie)
5. Redirect → /dashboard
```

### Middleware de protection

`apps/web/src/middleware.ts` protège automatiquement toutes les routes :

```
/dashboard/*  → redirige vers /login si non connecté
/editor       → redirige vers /login si non connecté
/login        → redirige vers /dashboard si déjà connecté
```

### Clients Supabase

| Fichier | Usage |
|---|---|
| `lib/supabase/client.ts` | Composants React client (browser) |
| `lib/supabase/server.ts` | Server Components, Route Handlers |

**Règle importante :** Toujours utiliser `supabase.auth.getUser()` (vérification serveur), jamais `getSession()` (lecture cookie seulement).

---

## 7. Dashboard

### Page principale (`/dashboard`)

**Server Component** — toutes les données sont chargées côté serveur, sans `useEffect`.

**Ce qu'il affiche :**

1. **Stats row** — Revenu du jour, nombre de commandes, statut du store
2. **Liste des commandes récentes** — 10 dernières, avec statut coloré
3. **AI Feed** — 3 insights générés par Claude Haiku à chaque chargement
4. **Bouton** — "Open store builder" → `/editor`

**Si pas de store :** Affiche `OnboardingCTA` avec lien vers `/dashboard/onboarding`.

### AI Feed (Claude Haiku)

`AIFeed.tsx` est un Server Component async qui :
1. Récupère les 10 dernières commandes depuis Supabase
2. Envoie les données à Claude Haiku (`claude-haiku-4-5-20251001`)
3. Reçoit 3 insights en JSON (`["**Tip:** ...", "**Alert:** ...", "**Good news:** ..."]`)
4. Les affiche dans le panneau droit du dashboard

**Modèle utilisé :** `claude-haiku-4-5-20251001` (rapide + économique pour les insights courts)

### Layout Dashboard

`dashboard/layout.tsx` — Server Component qui :
- Vérifie la session Supabase
- Redirige vers `/login` si non connecté
- Injecte `TopbarNav` avec l'objet `user`

`TopbarNav.tsx` — Client Component avec :
- Logo Pailo
- Liens de navigation (Dashboard, Builder, Orders, Products)
- Avatar utilisateur + bouton déconnexion (`supabase.auth.signOut()`)

---

## 8. Onboarding — Création de store

**Route :** `/dashboard/onboarding`

### Flux en 3 étapes

```
StepPick → StepInfo → StepDone → redirect /editor
```

### StepPick — Choix des sections

Interface plein écran divisée en 2 panneaux :

**Panneau gauche (300px) :** `VariantPicker`
- Affiche les 3 variantes de la section active
- Chaque variante = thumbnail + label + bouton sélection
- Navigation Prev / Next entre sections

**Panneau droit :** `LivePreview`
- Rendu complet du store en temps réel
- Se met à jour instantanément à chaque sélection

**5 sections, 3 variantes chacune :**

| Section | Variante 1 | Variante 2 | Variante 3 |
|---|---|---|---|
| Header | Dark Centered | Minimal | Bold Split |
| Hero | Dark Centered | Light Split | Full-width Overlay |
| Products | 3-col Grid | Horizontal List | Dark Masonry |
| About | Text + Image | Centered | Dark Stats |
| Footer | Simple Dark | 4-column | Minimal Light |

### StepInfo — Informations du store

Formulaire simple :
- **Nom du store** (obligatoire) → génère le subdomain
- **Tagline** (optionnel) → affiché dans les previews

Affiche un récapitulatif des sélections choisies.

### StepDone — Création en base

`OnboardingShell.handleCreate()` :
1. Récupère l'utilisateur Supabase
2. Génère un subdomain unique (`sara-candles-x4k2`)
3. Sérialise les sélections en JSON Craft.js (`buildCraftCanvas()`)
4. Insère une ligne dans `stores`
5. Affiche l'écran de succès 🚀
6. Redirect vers `/editor` après 1.4 secondes

---

## 9. Builder — Éditeur visuel

**Route :** `/editor`

### Architecture

```
editor/page.tsx (Server Component, 'use client' + dynamic import)
    ↓ import dynamique (ssr: false)
EditorCanvas.tsx (Client Component, contient tout Craft.js)
    ├── BuilderTopbar.tsx     → barre supérieure + Publish
    ├── [Canvas central]      → Frame Craft.js
    ├── BuilderSettings.tsx   → panneau droit (props du bloc sélectionné)
    └── [Sidebar gauche]      → icônes outils
```

**Pourquoi `dynamic` + `ssr: false` ?**
Craft.js utilise des APIs browser (`window`, `document`, drag events) qui n'existent pas côté serveur. Sans ce pattern, Next.js crash au build.

### Chargement du canvas

Au montage d'`EditorCanvas` :
1. `supabase.auth.getUser()` → récupère l'utilisateur
2. Query `stores` → récupère `id` et `config_json`
3. `config_json.canvas` → JSON Craft.js sérialisé
4. Passé à `<Frame data={savedCanvas}>` → restaure l'état complet

### Sauvegarde (Publish)

`BuilderTopbar.handlePublish()` :
1. `query.serialize()` → JSON string du canvas entier
2. `supabase.from('stores').update({ config_json: { canvas }, published_at: now() })`
3. Bouton passe en vert ✓ Published!

### RESOLVER Craft.js

Tous les blocs doivent être enregistrés dans `sections.ts` :

```typescript
export const RESOLVER = {
  HeaderDarkBlock, HeaderMinimalBlock, HeaderBoldBlock,
  HeroDarkBlock, HeroSplitBlock, HeroFullwidthBlock,
  ProductsGridBlock, ProductsListBlock, ProductsMasonryBlock,
  AboutSplitBlock, AboutCenteredBlock, AboutDarkBlock,
  FooterDarkBlock, FooterColumnsBlock, FooterMinimalBlock,
}
```

Si un bloc est manquant dans le RESOLVER, Craft.js crash à la désérialisation.

---

## 10. Blocs disponibles

Chaque bloc suit le même pattern :

```typescript
// 1. Composant React avec useNode() pour drag/drop
export function HeroDarkBlock({ headline, bgColor, bgImage, bgType }: Props) {
  const { connectors: { connect, drag } } = useNode()
  return <div ref={ref => { if (ref) connect(drag(ref)) }}> ... </div>
}

// 2. Config Craft.js avec props par défaut + settings panel
HeroDarkBlock.craft = {
  displayName: 'Hero — Dark',
  props: { headline: 'Default', bgColor: '#1a1a2e', bgType: 'color' },
  related: { settings: HeroDarkSettings },
}

// 3. Définition Variant (pour l'onboarding)
export const HeroDark: Variant = {
  label: 'Dark Centered',
  Thumb: () => <div>...</div>,      // miniature dans le picker
  Preview: ({ storeName, tagline }) => <div>...</div>,  // rendu complet
  craftJson: () => ({ ... }),       // JSON Craft.js de ce bloc
}
```

### Blocs Header (3)

| Bloc | Props éditables |
|---|---|
| `HeaderDarkBlock` | storeName, links, bgColor |
| `HeaderMinimalBlock` | storeName, bgColor |
| `HeaderBoldBlock` | storeName, bgColor |

### Blocs Hero (3) — Supports images & vidéos

| Bloc | Props éditables |
|---|---|
| `HeroDarkBlock` | headline, subtext, ctaText, bgColor/bgImage/bgType (color\|image\|video) |
| `HeroSplitBlock` | headline, subtext, ctaText, mediaUrl, mediaType (image\|video\|placeholder) |
| `HeroFullwidthBlock` | headline, subtext, ctaText, bgColor/bgImage/bgType, overlayOpacity |

### Blocs Products (3) — Supports upload image par produit

| Bloc | Props éditables |
|---|---|
| `ProductsGridBlock` | title, bgColor, products[] (name, price, emoji, imageUrl) |
| `ProductsListBlock` | title, products[] (name, desc, price, emoji, imageUrl) |
| `ProductsMasonryBlock` | title, products[] (name, price, emoji, imageUrl, tall) |

### Blocs About (3)

| Bloc | Props éditables |
|---|---|
| `AboutSplitBlock` | storeName, body, imageUrl (upload) |
| `AboutCenteredBlock` | storeName, body |
| `AboutDarkBlock` | storeName, body |

### Blocs Footer (3)

| Bloc | Props éditables |
|---|---|
| `FooterDarkBlock` | storeName |
| `FooterColumnsBlock` | storeName, tagline |
| `FooterMinimalBlock` | storeName |

---

## 11. Upload de médias

### Composant `MediaUploader`

Présent dans les blocs Hero (background image/video) et les settings produits.

**Flux d'upload :**
```
1. Utilisateur clique "↑ Upload image / video"
2. Input file s'ouvre (accept="image/*,video/*")
3. Fichier envoyé vers Supabase Storage bucket "store-media"
4. Path: media/{timestamp}-{random}.{ext}
5. URL publique récupérée → stockée dans les props du bloc
6. Craft.js re-render instantané avec le nouveau media
```

**Code clé :**
```typescript
const { data } = await supabase.storage
  .from('store-media')
  .upload(path, file, { upsert: true })

const { data: { publicUrl } } = supabase.storage
  .from('store-media')
  .getPublicUrl(data.path)

// → url stockée dans les props Craft.js
setProp((p) => { p.bgImage = publicUrl; p.bgType = 'image' })
```

**Types supportés :** `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.mp4`, `.webm`, `.ogg`

---

## 12. Store publié

**Route :** `/[subdomain]` (ex: `/sara-candles-x4k2`)

### Fonctionnement

`(builder)/[subdomain]/page.tsx` — Server Component :
1. Récupère le store par `subdomain` depuis Supabase
2. Vérifie que `published_at IS NOT NULL` (store publié)
3. `notFound()` si inexistant ou non publié
4. Passe `config_json.canvas` à `StoreRenderer`

`StoreRenderer.tsx` — Client Component :
```tsx
<Editor resolver={RESOLVER} enabled={false}>
  <Frame data={canvas} />
</Editor>
```

`enabled={false}` → mode lecture seule, pas de drag & drop, pas de sélection. Les visiteurs voient exactement ce que le commerçant a construit.

### Politique RLS pour accès public

```sql
-- Indispensable — sans ça les visiteurs non connectés voient une page blanche
CREATE POLICY "public can read published stores" ON stores
  FOR SELECT USING (published_at IS NOT NULL);
```

---

## 13. API NestJS — WhatsApp

**Port :** 3001 (dev)
**Route :** `POST /webhook/whatsapp`

### Fonctionnement

```
Meta envoie POST → /webhook/whatsapp (NestJS)
    ↓
whatsapp.service.ts → processMessage()
    ↓
Cherche l'utilisateur par numéro WhatsApp
    ↓
Claude Haiku reçoit: commandes récentes + message de l'utilisateur
    ↓
Claude répond en langage naturel (max 3 lignes)
    ↓
NestJS renvoie la réponse via WhatsApp API
```

### Exemples de conversations

```
Pailo: "Vous avez 3 nouvelles commandes. Total: 96 TND.
        Répondez OUI pour tout confirmer."
Commerçant: "OUI"
Pailo: "Confirmées ✓. Rappel emballage demain 9h.
        Vanilla Amber: 4 unités restantes. Réapprovisionner ?"
```

### Vérification du webhook

```typescript
// GET /webhook/whatsapp — vérification Meta
@Get()
verify(@Query() q: any, @Res() res: any) {
  if (q['hub.verify_token'] === process.env.WA_WEBHOOK_VERIFY_TOKEN)
    return res.send(q['hub.challenge'])
  return res.sendStatus(403)
}
```

---

## 14. Package partagé — AI

**Path :** `packages/ai/src/generate-store.ts`

Fonction principale qui prend la description d'un business en texte libre et retourne un JSON structuré pour créer le store.

```typescript
export async function generateStoreFromDescription(
  userDescription: string
): Promise<GeneratedStore> {
  // Appel Claude Sonnet avec prompt structuré
  // Retourne: { name, tagline, description, colors, products[], heroHeadline, heroCta }
}
```

**Modèle utilisé :** `claude-sonnet-4-6` (meilleure qualité pour la génération de contenu)

---

## 15. Variables d'environnement

### `apps/web/.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### `apps/api/.env`

```env
# WhatsApp (Meta)
WA_PHONE_NUMBER_ID=xxx
WA_ACCESS_TOKEN=xxx
WA_WEBHOOK_VERIFY_TOKEN=mon-token-secret

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Redis (pour BullMQ)
REDIS_URL=redis://localhost:6379
```

---

## 16. Commandes utiles

### Développement

```bash
# Démarrer tout (web + api)
pnpm dev

# Démarrer seulement le web
pnpm dev --filter web

# Démarrer seulement l'api
pnpm dev --filter api

# Build
pnpm build
```

### Gestion des packages (toujours depuis la racine)

```bash
# Ajouter un package à l'app web
pnpm add <package> --filter web

# Ajouter un package à l'api
pnpm add <package> --filter api

# Ajouter un package partagé
pnpm add <package> -w
```

### Git

```bash
# Commit standard
git add -A
git commit -m "feat: description"
git push origin main

# Ne JAMAIS committer
# - node_modules/
# - .env.local
# - .env
# - .next/
# → Tout est dans .gitignore
```

### Supabase

```bash
# Voir les logs en temps réel
# → Dashboard Supabase → Logs → Realtime

# Tester une query
# → Dashboard Supabase → SQL Editor
```

---

## 17. Roadmap

### ✅ Fait

- [x] Monorepo Turborepo + pnpm
- [x] Next.js 15 avec App Router
- [x] Supabase connecté (DB + Auth + Storage)
- [x] Authentification magic link
- [x] Middleware de protection des routes
- [x] Dashboard avec stats
- [x] AI Feed (Claude Haiku)
- [x] Onboarding visuel (5 sections × 3 variantes)
- [x] Builder Craft.js avec drag & drop
- [x] Upload images/vidéos dans les blocs hero
- [x] Upload images par produit
- [x] Sauvegarde canvas → Supabase
- [x] Store public `/[subdomain]`
- [x] NestJS + WhatsApp webhook (structure)

### 🔄 En cours

- [ ] Résolution erreur Craft.js types (cosmétique VS Code)
- [ ] Complétion WhatsApp service (réponses IA)
- [ ] Tests end-to-end onboarding → builder → publish

### 📋 À faire (Phase 2)

- [ ] Gestion des commandes (dashboard orders)
- [ ] Gestion des produits (dashboard products)
- [ ] Paiements Stripe / D17 / Flouci
- [ ] Livraisons et gestion du stock
- [ ] Interface WhatsApp complète (briefing quotidien)
- [ ] SEO automatique (meta tags, sitemap)
- [ ] Déploiement Vercel + domaines personnalisés
- [ ] Campagnes email/WhatsApp
- [ ] CRM léger (historique clients)
- [ ] Marketplace d'apps tierces

### 📋 À faire (Phase 3)

- [ ] White-label pour agences
- [ ] API publique REST
- [ ] Support arabe (RTL)
- [ ] Paiements locaux MENA (D17, Flouci, Baridimob)
- [ ] Analytics avec insights IA
- [ ] Series A

---

## Notes importantes

### Craft.js — Règles à retenir

1. **Toujours `'use client'`** sur les fichiers qui importent `@craftjs/core`
2. **`dynamic(() => import(...), { ssr: false })`** sur la page qui contient l'Editor
3. **RESOLVER complet** — tout bloc utilisé dans `<Frame>` doit être dans le RESOLVER
4. **`data=` pas `json=`** sur `<Frame>` (API 0.2.12)
5. **`<Element is="div" canvas>`** pas `<Canvas>` (supprimé en 0.2.12)

### Supabase — Règles à retenir

1. **RLS activé sur toutes les tables** — sécurité garantie côté DB
2. **`getUser()` pas `getSession()`** dans middleware et Server Components
3. **Bucket `store-media` doit être public** pour que les images s'affichent
4. **Policy publique sur stores** pour que les visiteurs voient les stores publiés

### Monorepo — Règles à retenir

1. **Toujours `--filter <app>`** pour installer des packages dans une app spécifique
2. **Ne jamais `cd apps/web && pnpm add`** — toujours depuis la racine
3. **`pnpm dev` depuis la racine** — démarre tout simultanément

---

*Pailo — Built with ❤️ in Tunis*
