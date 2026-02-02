# AGENTS.md

Ce fichier décrit les conventions, règles et bonnes pratiques suivies sur ce projet.

## Structure du projet

```
form-builder/
├── backend/                 # API Elysia
│   ├── src/
│   │   ├── api/            # Endpoints REST
│   │   ├── db/             # Schéma Drizzle
│   │   ├── lib/            # Utilitaires (DB, OpenAI)
│   │   ├── services/       # Logique métier
│   │   ├── types/          # Schémas Typebox
│   │   └── utils/          # Helpers
│   └── drizzle/            # Migrations
│
├── web/                    # Frontend React
│   ├── src/
│   │   ├── routes/         # Pages TanStack Router
│   │   ├── components/     # Composants React
│   │   │   ├── ui/         # Composants de base
│   │   │   ├── fields/     # Composants de champs
│   │   │   ├── forms/      # Composants de formulaires
│   │   │   └── layout/     # Wrappers de mise en page
│   │   ├── services/       # Hooks React Query & client API
│   │   └── lib/            # Utilitaires
│   └── dist/               # Build de production
│
└── package.json            # Config monorepo Yarn workspaces
```

## Stack technique

| Couche     | Technologie     | Version |
| ---------- | --------------- | ------- |
| Backend    | Elysia          | 1.4.x   |
| ORM        | Drizzle         | 0.45.x  |
| Database   | SQLite (libsql) | -       |
| Validation | Typebox         | 0.34.x  |
| Frontend   | React           | 19.x    |
| Routing    | TanStack Router | 1.x     |
| State      | TanStack Query  | 5.x     |
| HTTP       | Axios           | 1.x     |
| Forms      | React Hook Form | 7.x     |
| Styling    | Tailwind CSS    | 4.x     |
| Build      | Vite            | 7.x     |
| Linter     | Biome           | -       |

---

## Conventions du projet

### Nommage

- **Fichiers/fonctions** : camelCase (`formsService.ts`, `getFormById`)
- **Composants React** : PascalCase (`FieldForm.tsx`, `SortableFieldItem`)
- **Tables DB** : camelCase avec suffixe `Table` (`formsTable`, `fieldsTable`)
- **Types** : PascalCase (`Form`, `Field`, `CreateFormBody`)

### Organisation des imports

```typescript
// 1. Imports externes (React, bibliothèques)
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Imports internes avec alias @/
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

// 3. Imports de types
import type { Form } from "../../../backend/src/types/forms";
```

### Alias de chemin

- Frontend : `@/` pointe vers `./src/`
- Backend : pas d'alias, imports relatifs depuis `./src`

---

## Bonnes pratiques Backend (Elysia)

### Architecture en services

```typescript
// services/forms.ts - Logique métier isolée
export const FormsService = {
  async getAll() {
    return db.select().from(formsTable);
  },

  async create(data: CreateFormBody) {
    // Logique métier ici
  },
};
```

### Validation avec Typebox

```typescript
// types/forms.ts - Schémas de validation
import { Type, type Static } from "@sinclair/typebox";

export const CreateFormBody = Type.Object({
  name: Type.String({ minLength: 1 }),
  slug: Type.Optional(Type.String()),
});

export type CreateFormBody = Static<typeof CreateFormBody>;
```

### Définition des routes

```typescript
// api/api.ts
app.post("/forms", ({ body }) => FormsService.create(body), {
  body: CreateFormBody, // Validation automatique
});
```

### Gestion des erreurs

```typescript
import { status } from "elysia";

// Retourner des erreurs HTTP explicites
if (existingForm) {
  return status(409, "Un formulaire avec ce slug existe déjà");
}
```

### Transactions pour opérations multiples

```typescript
await db.transaction(async (tx) => {
  // Toutes les opérations dans la même transaction
  await tx.delete(fieldsTable).where(eq(fieldsTable.formId, formId));
  await tx.insert(fieldsTable).values(newFields);
});
```

---

## Bonnes pratiques Drizzle ORM

### Définition du schéma

```typescript
// db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const formsTable = sqliteTable(
  "forms",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    createdAt: integer("created_at").$defaultFn(() => Date.now()),
    updatedAt: integer("updated_at").$defaultFn(() => Date.now()),
  },
  (table) => [uniqueIndex("forms_slug_idx").on(table.slug)],
);
```

### Conventions DB

- **Clés primaires** : UUID (pas d'auto-increment)
- **Timestamps** : millisecondes Unix (`Date.now()`)
- **Foreign keys** : avec cascade delete quand approprié
- **Index** : sur les colonnes fréquemment filtrées/triées

### Inférence de types

```typescript
// Récupérer le type depuis le schéma
type Form = typeof formsTable.$inferSelect;
type NewForm = typeof formsTable.$inferInsert;
```

### Requêtes typées

```typescript
// Select avec conditions
const form = await db
  .select()
  .from(formsTable)
  .where(eq(formsTable.id, id))
  .get();

// Join
const fieldsWithForm = await db
  .select()
  .from(fieldsTable)
  .innerJoin(formsTable, eq(fieldsTable.formId, formsTable.id));
```

---

## Bonnes pratiques React

### Structure des composants

```typescript
// Composant fonctionnel avec types explicites
interface FieldFormProps {
  formId: string;
  field?: Field;
  onSuccess?: () => void;
}

export function FieldForm({ formId, field, onSuccess }: FieldFormProps) {
  // Hooks en premier
  const { register, handleSubmit } = useForm();
  const mutation = useCreateField(formId);

  // Handlers
  const onSubmit = (data: FormData) => {
    mutation.mutate(data, { onSuccess });
  };

  // Render
  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

### Organisation des composants

```
components/
├── ui/           # Composants génériques réutilisables (Button, Input, etc.)
├── fields/       # Composants spécifiques aux champs
├── forms/        # Composants spécifiques aux formulaires
└── layout/       # Composants de mise en page
```

### Gestion d'état avec React Query

```typescript
// services/forms.ts
export const formKeys = {
  all: ["forms"] as const,
  detail: (id: string) => ["forms", id] as const,
};

export function useForms() {
  return useQuery({
    queryKey: formKeys.all,
    queryFn: () => api.get<Form[]>("/forms").then((r) => r.data),
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFormBody) => api.post("/forms", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formKeys.all });
    },
  });
}
```

### Formulaires avec React Hook Form

```typescript
const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  defaultValues: {
    name: "",
    required: false,
  },
});

<input {...register("name", { required: "Le nom est requis" })} />
{errors.name && <span>{errors.name.message}</span>}
```

---

## Bonnes pratiques TanStack Router

### Structure des routes

```
routes/
├── __root.tsx        # Layout racine
├── index.tsx         # Page d'accueil (/)
├── forms.tsx         # Layout /forms
├── forms.index.tsx   # Liste (/forms)
└── forms.$id.tsx     # Détail (/forms/:id)
```

### Définition d'une route

```typescript
// routes/forms.$id.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/forms/$id")({
  component: FormDetailPage,
});

function FormDetailPage() {
  const { id } = Route.useParams();
  // ...
}
```

### Navigation

```typescript
import { Link, useNavigate } from "@tanstack/react-router";

// Lien déclaratif
<Link to="/forms/$id" params={{ id: form.id }}>Voir</Link>

// Navigation programmatique
const navigate = useNavigate();
navigate({ to: "/forms/$id", params: { id } });
```

---

## Bonnes pratiques Tailwind CSS

### Utilisation de CVA pour les variantes

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input bg-background",
        ghost: "hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
```

### Utilitaire cn() pour fusionner les classes

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utilisation
<div className={cn("p-4", isActive && "bg-blue-500", className)} />
```

### Variables CSS pour le theming

```css
/* index.css */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  /* ... */
}
```

---

## Bonnes pratiques générales Web

### Sécurité

- Valider toutes les entrées utilisateur côté serveur
- Utiliser des requêtes paramétrées (Drizzle le fait automatiquement)
- Échapper les données affichées (React le fait automatiquement)
- Ne jamais exposer de secrets dans le frontend

### Performance

- Utiliser le cache React Query intelligemment
- Lazy loading des routes (TanStack Router le fait automatiquement)
- Optimiser les images
- Minimiser les re-renders inutiles

### Accessibilité

- Utiliser des éléments HTML sémantiques
- Ajouter des labels aux champs de formulaire
- Gérer les états de focus
- Supporter la navigation clavier

### Gestion des erreurs

```typescript
// Frontend - lib/errors.ts
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Une erreur est survenue";
}
```

### API REST

- Utiliser les bons codes HTTP (200, 201, 400, 404, 409, 500)
- Endpoints prévisibles (`GET /forms`, `POST /forms`, `GET /forms/:id`)
- Retourner des messages d'erreur explicites

---

## Scripts disponibles

```bash
# Racine du projet
yarn lint              # Linter Biome
yarn dev:backend       # Démarrer le backend
yarn dev:web           # Démarrer le frontend
yarn build:backend     # Build backend
yarn build:web         # Build frontend

# Backend
yarn db:generate       # Générer les migrations Drizzle
yarn db:migrate        # Appliquer les migrations
yarn db:push           # Push le schéma (dev)
yarn db:studio         # Interface Drizzle Studio

# Frontend
yarn dev               # Vite dev server
yarn build             # Build production
yarn preview           # Preview du build
```

---

## Checklist avant commit

- [ ] Le code compile sans erreur (`yarn build`)
- [ ] Le linter passe (`yarn lint`)
- [ ] Les nouvelles tables ont des migrations
- [ ] Les types sont partagés entre frontend et backend
- [ ] Les erreurs sont gérées correctement
- [ ] L'UI est en français
