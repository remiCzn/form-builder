import { FieldsService } from "services/fields";
import { FormsService } from "services/forms";
import {
  CreateField,
  Field,
  FormFieldParams,
  ReorderFields,
  UpdateField,
} from "types/fields";
import { CreateForm, Form, FormId, UpdateForm } from "types/forms";
import { Elysia, t } from "elysia";

export const api = new Elysia({ prefix: "/api" })
  .get(
    "/forms",
    async () => {
      const forms = await FormsService.getForms();
      return forms;
    },
    {
      response: t.Array(Form),
    },
  )
  .post(
    "/forms",
    ({ body }) => {
      return FormsService.createForm(body);
    },
    {
      body: CreateForm,
    },
  )
  .get(
    "/forms/:id",
    ({ params }) => {
      return FormsService.getForm(params.id);
    },
    {
      params: FormId,
    },
  )
  .patch(
    "/forms/:id",
    ({ params, body }) => {
      return FormsService.updateForm(params.id, body);
    },
    {
      params: FormId,
      body: UpdateForm,
    },
  )
  // Fields endpoints
  .get(
    "/forms/:id/fields",
    ({ params }) => {
      return FieldsService.getFields(params.id);
    },
    {
      params: FormId,
      response: t.Array(Field),
    },
  )
  .post(
    "/forms/:id/fields",
    ({ params, body }) => {
      return FieldsService.createField(params.id, body);
    },
    {
      params: FormId,
      body: CreateField,
    },
  )
  .patch(
    "/forms/:id/fields/:fieldId",
    ({ params, body }) => {
      return FieldsService.updateField(params.id, params.fieldId, body);
    },
    {
      params: FormFieldParams,
      body: UpdateField,
    },
  )
  .delete(
    "/forms/:id/fields/:fieldId",
    ({ params }) => {
      return FieldsService.deleteField(params.id, params.fieldId);
    },
    {
      params: FormFieldParams,
    },
  )
  .put(
    "/forms/:id/fields/reorder",
    ({ params, body }) => {
      return FieldsService.reorderFields(params.id, body.fieldOrder);
    },
    {
      params: FormId,
      body: ReorderFields,
    },
  );

export type ApiType = typeof api;
