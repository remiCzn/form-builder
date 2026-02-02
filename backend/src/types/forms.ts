import { t } from "elysia";
import { FieldType } from "./fields.js";

export const CreateForm = t.Object({
  name: t.String({
    minLength: 1,
  }),
  slug: t.String({
    minLength: 1,
  }),
});

export type CreateForm = (typeof CreateForm)["static"];

export const UpdateForm = t.Object({
  name: t.Optional(
    t.String({
      minLength: 1,
    }),
  ),
  slug: t.Optional(
    t.String({
      minLength: 1,
    }),
  ),
});

export type UpdateForm = (typeof UpdateForm)["static"];

export const FormId = t.Object({
  id: t.String(),
});

export type FormId = (typeof FormId)["static"];

export const Form = t.Object({
  id: t.String(),
  name: t.String(),
  slug: t.String(),
  status: t.Enum({
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
  }),
  publishedAt: t.Union([t.Null(), t.Date()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type Form = (typeof Form)["static"];

export const GenerateFormBody = t.Object({
  prompt: t.String({ minLength: 1 }),
});

export type GenerateFormBody = (typeof GenerateFormBody)["static"];

export const GeneratedFieldConfig = t.Object({
  options: t.Array(t.String({ minLength: 1 })),
});

export const GeneratedField = t.Object({
  label: t.String({ minLength: 1 }),
  type: FieldType,
  required: t.Boolean(),
  config: GeneratedFieldConfig,
});

export type GeneratedField = (typeof GeneratedField)["static"];

export const GeneratedForm = t.Object({
  name: t.String({ minLength: 1 }),
  slug: t.String({ minLength: 1 }),
  description: t.String({ minLength: 1 }),
  fields: t.Array(GeneratedField),
});

export type GeneratedForm = (typeof GeneratedForm)["static"];
