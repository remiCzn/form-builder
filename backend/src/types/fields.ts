import { t } from "elysia";

export const FieldType = t.Union([
  t.Literal("TEXT"),
  t.Literal("NUMBER"),
  t.Literal("DROPDOWN"),
]);

export type FieldType = (typeof FieldType)["static"];

export const CreateField = t.Object({
  type: FieldType,
  label: t.String({ minLength: 1 }),
  required: t.Optional(t.Boolean()),
  config: t.Optional(t.Record(t.String(), t.Unknown())),
});

export type CreateField = (typeof CreateField)["static"];

export const UpdateField = t.Object({
  type: t.Optional(FieldType),
  label: t.Optional(t.String({ minLength: 1 })),
  required: t.Optional(t.Boolean()),
  config: t.Optional(t.Union([t.Record(t.String(), t.Unknown()), t.Null()])),
});

export type UpdateField = (typeof UpdateField)["static"];

export const FieldId = t.Object({
  fieldId: t.String(),
});

export type FieldId = (typeof FieldId)["static"];

export const FormFieldParams = t.Object({
  id: t.String(),
  fieldId: t.String(),
});

export type FormFieldParams = (typeof FormFieldParams)["static"];

export const ReorderFields = t.Object({
  fieldOrder: t.Array(t.String()),
});

export type ReorderFields = (typeof ReorderFields)["static"];

export const Field = t.Object({
  id: t.String(),
  formId: t.String(),
  type: FieldType,
  label: t.String(),
  required: t.Boolean(),
  order: t.Number(),
  config: t.Union([t.Record(t.String(), t.Unknown()), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type Field = (typeof Field)["static"];
