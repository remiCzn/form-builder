# Monorepo - Form Builder

Ce projet est un monorepo contenant un backend et une application web.

## Installation

### Cas 1 : Avec Volta (recommandé)

[Volta](https://volta.sh/) gère automatiquement les versions de Node.js et Yarn.

```bash
# Installer les dépendances (Volta utilisera automatiquement les bonnes versions)
yarn install
```

### Cas 2 : Sans Volta

Istaller les prérequis: Node.js et Yarn. Versions recommandées:

- **Node.js** : 24.9.0
- **Yarn** : 1.22.22

```bash
# Installer les dépendances
yarn install
```

## Lancer le projet

### Mode développement

```bash
yarn dev:backend
yarn dev:web
```

L'app est ensuite disponible [http://localhost:5173](http://localhost:5173)

### Build de production

```bash
yarn build:backend
yarn build:web
```
