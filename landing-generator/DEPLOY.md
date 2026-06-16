# Déploiement & reprise du projet — landing-generator

Ce dépôt contient **l'outil de génération de landing pages** (application Next.js).
Ce guide explique comment le faire tourner **sur votre propre infrastructure**
(votre serveur, celui du client, ou n'importe quel hébergeur de conteneurs),
**sans aucune dépendance** au compte d'hébergement d'origine.

## Architecture en bref

- **Application** : Next.js (build `standalone`).
- **Base de données** : SQLite via Prisma — un simple fichier `landing.db`.
- **IA** : la génération de contenu et d'images appelle une API **Azure OpenAI**
  (compatible OpenAI). ➜ **Vous devez fournir votre propre ressource / clé.**
- **Admin** : interface protégée par login sur la route `/app-admin`.

## Prérequis

1. **Docker** (recommandé) — ou **Node.js 22** pour un lancement direct.
2. **Un fournisseur LLM** : une ressource **Azure OpenAI** avec
   - un déploiement de modèle **texte** (chat/completions),
   - un déploiement de modèle **image**.

   (endpoint + clé + noms des déploiements ➜ à renseigner dans `.env`.)

## 1) Configuration

```bash
cp .env.example .env
# puis éditez .env avec VOS valeurs
```

Voir [.env.example](./.env.example) pour la liste complète et commentée des variables.

## 2) Déploiement avec Docker Compose (recommandé)

```bash
docker compose up -d --build
```

- Application disponible sur `http://localhost:3000` (admin : `/app-admin`).
- Données persistées dans le volume Docker `landing-data` (monté sur `/home/data`).
- Mise à jour : `git pull && docker compose up -d --build`.
- Logs : `docker compose logs -f`  •  Arrêt : `docker compose down` (le volume est conservé).

## 3) Déploiement avec Docker seul (sans Compose)

```bash
docker build -t landing-generator .
docker run -d --name landing-generator \
  -p 3000:3000 \
  --env-file .env \
  -v landing-data:/home/data \
  landing-generator
```

> Le conteneur force la base sur `/home/data/landing.db` et applique les
> migrations Prisma au démarrage. **Montez toujours un volume sur `/home/data`**,
> sinon les données sont perdues à chaque redémarrage.

## 4) Développement local (sans Docker)

```bash
npm install
cp .env.example .env          # DATABASE_URL="file:./dev.db" convient en local
npx prisma migrate deploy     # crée / met à jour le schéma de la base locale
npm run dev                   # http://localhost:3000
```

## Accès à l'espace admin

Définissez `ADMIN_USERNAME`, `ADMIN_PASSWORD` et `AUTH_SECRET` (≥ 32 caractères)
dans `.env`, puis connectez-vous sur `/app-admin`.

## Sauvegarde / migration des données

Toutes les données (landings, configurations) sont dans le fichier SQLite du volume.

- **Sauvegarde** : copiez `landing.db` depuis le volume `landing-data`.
- **Restauration** : replacez ce fichier dans le volume avant de démarrer le conteneur.

## Indépendance vis-à-vis de l'hébergement d'origine

Cette application **ne dépend d'aucun service propriétaire**. Elle tourne sur tout
hôte capable d'exécuter un conteneur Docker : un VPS, le serveur du client, Render,
Railway, Fly.io, un cluster Kubernetes, ou l'App Service d'un autre compte cloud.
La **seule dépendance externe** est le fournisseur LLM, que vous fournissez via les
variables `AZURE_OPENAI_*`.

## À propos du workflow GitHub Actions

Le fichier [`.github/workflows/master_serres-landing-gen.yml`](../.github/workflows/master_serres-landing-gen.yml)
déployait automatiquement vers l'App Service Azure de l'**ancien** propriétaire et
nécessite **ses** secrets OIDC. **L'auto-déploiement a été désactivé** (déclenchement
manuel uniquement) afin d'éviter tout déploiement involontaire. Pour automatiser VOS
déploiements, remplacez ce fichier par un pipeline ciblant **votre** infrastructure.
