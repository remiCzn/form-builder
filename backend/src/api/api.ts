import { Elysia, t } from "elysia";
import { FieldsService } from "../services/fields.js";
import { FormsService } from "../services/forms.js";
import { FormsAiService } from "../services/formsAi.js";
import {
  CreateField,
  Field,
  FormFieldParams,
  ReorderFields,
  UpdateField,
} from "../types/fields.js";
import {
  CreateForm,
  Form,
  FormId,
  GenerateFormBody,
  UpdateForm,
} from "../types/forms.js";

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
  .post(
    "/forms/:id/generate",
    ({ params, body }) => {
      return FormsAiService.generateFormFields(params.id, body.prompt);
    },
    {
      params: FormId,
      body: GenerateFormBody,
      response: t.Array(Field),
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
  .post(
    "/forms/:id/publish",
    ({ params }) => {
      return FormsService.publishForm(params.id);
    },
    {
      params: FormId,
      response: Form,
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
