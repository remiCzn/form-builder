import { Type } from "@sinclair/typebox";

export const FieldType = Type.Union([
  Type.Literal("TEXT"),
  Type.Literal("NUMBER"),
  Type.Literal("DROPDOWN"),
]);

export type FieldType = (typeof FieldType)["static"];

export const CreateField = Type.Object({
  type: FieldType,
  label: Type.String({ minLength: 1 }),
  required: Type.Optional(Type.Boolean()),
  config: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
});

export type CreateField = (typeof CreateField)["static"];

export const UpdateField = Type.Object({
  type: Type.Optional(FieldType),
  label: Type.Optional(Type.String({ minLength: 1 })),
  required: Type.Optional(Type.Boolean()),
  config: Type.Optional(
    Type.Union([Type.Record(Type.String(), Type.Unknown()), Type.Null()]),
  ),
});

export type UpdateField = (typeof UpdateField)["static"];

export const FieldId = Type.Object({
  fieldId: Type.String(),
});

export type FieldId = (typeof FieldId)["static"];

export const FormFieldParams = Type.Object({
  id: Type.String(),
  fieldId: Type.String(),
});

export type FormFieldParams = (typeof FormFieldParams)["static"];

export const ReorderFields = Type.Object({
  fieldOrder: Type.Array(Type.String()),
});

export type ReorderFields = (typeof ReorderFields)["static"];

export const Field = Type.Object({
  id: Type.String(),
  formId: Type.String(),
  type: FieldType,
  label: Type.String(),
  required: Type.Boolean(),
  order: Type.Number(),
  config: Type.Union([Type.Record(Type.String(), Type.Unknown()), Type.Null()]),
  createdAt: Type.Date(),
  updatedAt: Type.Date(),
});

export type Field = (typeof Field)["static"];
