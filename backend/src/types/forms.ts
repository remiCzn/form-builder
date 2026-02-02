import { t } from "elysia";

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
