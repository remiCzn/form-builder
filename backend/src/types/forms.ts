import { Type } from "@sinclair/typebox";

export const CreateForm = Type.Object({
  name: Type.String({
    minLength: 1,
  }),
  slug: Type.String({
    minLength: 1,
  }),
});

export type CreateForm = (typeof CreateForm)["static"];

export const UpdateForm = Type.Object({
  name: Type.Optional(
    Type.String({
      minLength: 1,
    }),
  ),
  slug: Type.Optional(
    Type.String({
      minLength: 1,
    }),
  ),
});

export type UpdateForm = (typeof UpdateForm)["static"];

export const FormId = Type.Object({
  id: Type.String(),
});

export type FormId = (typeof FormId)["static"];

export const Form = Type.Object({
  id: Type.String(),
  name: Type.String(),
  slug: Type.String(),
  status: Type.Enum({
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
  }),
  publishedAt: Type.Union([Type.Null(), Type.Date()]),
  createdAt: Type.Date(),
  updatedAt: Type.Date(),
});

export type Form = (typeof Form)["static"];
