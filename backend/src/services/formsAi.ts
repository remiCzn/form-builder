import { status } from "elysia";
import { eq } from "drizzle-orm";
import openAi from "../lib/openai.js";
import db from "../lib/db.js";
import { fieldsTable, formsTable } from "../db/schema.js";
import type { GeneratedForm } from "../types/forms.js";

const FORM_SCHEMA = {
  name: "generated_form",
  description: "Formulaire structure genere a partir d'un brief utilisateur.",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      slug: { type: "string" },
      description: { type: "string" },
      fields: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            label: { type: "string" },
            type: { type: "string", enum: ["TEXT", "NUMBER", "DROPDOWN"] },
            required: { type: "boolean" },
            config: {
              type: "object",
              additionalProperties: false,
              properties: {
                options: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["options"],
            },
          },
          required: ["label", "type", "required", "config"],
        },
      },
    },
    required: ["name", "slug", "description", "fields"],
  },
};

const SYSTEM_PROMPT = [
  "Tu generes un formulaire en francais a partir d'un brief utilisateur.",
  "Retourne uniquement du JSON valide qui respecte strictement le schema.",
  "Utilise des libelles clairs et courts.",
  "Champs autorises: TEXT, NUMBER, DROPDOWN.",
  "Si le champ n'est pas DROPDOWN, mets config.options a [].",
  "Si le champ est DROPDOWN, mets 2 a 6 options courtes.",
].join(" ");

export class FormsAiService {
  static async generateFormFields(formId: string, prompt: string) {
    const cleanedPrompt = prompt.trim();

    if (!cleanedPrompt) {
      throw status(400, "Prompt requis.");
    }

    const [form] = await db
      .select({ id: formsTable.id, status: formsTable.status })
      .from(formsTable)
      .where(eq(formsTable.id, formId))
      .limit(1);

    if (!form) {
      throw status(404, "Form not found");
    }

    if (form.status === "PUBLISHED") {
      throw status(409, "Formulaire deja publie");
    }

    const completion = await openAi.chat.completions
      .create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: {
          type: "json_schema",
          json_schema: FORM_SCHEMA,
        },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Brief: ${cleanedPrompt}`,
          },
        ],
      })
      .catch((e) => {
        console.log(e);
        throw status(502, "Reponse OpenAI invalide.");
      });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw status(502, "Reponse OpenAI vide.");
    }

    let parsed: GeneratedForm;

    try {
      parsed = JSON.parse(content) as GeneratedForm;
    } catch (error) {
      throw status(502, "Reponse OpenAI invalide.");
    }

    const rawFields = Array.isArray(parsed.fields) ? parsed.fields : [];

    if (rawFields.length === 0) {
      throw status(502, "Aucun champ genere.");
    }

    const fieldsToInsert = rawFields.map((field, index) => {
      const label = (field.label ?? "").trim() || `Champ ${index + 1}`;
      const required = Boolean(field.required);
      const options = Array.isArray(field.config?.options)
        ? field.config.options.filter((opt) => opt.trim())
        : [];
      const normalizedOptions =
        field.type === "DROPDOWN"
          ? options.length >= 2
            ? options
            : ["Option 1", "Option 2"]
          : [];

      return {
        id: crypto.randomUUID(),
        formId,
        type: field.type,
        label,
        required,
        order: index,
        config: {
          options: normalizedOptions,
        },
      };
    });

    const now = Date.now();

    const fields = await db.transaction(async (tx) => {
      await tx.delete(fieldsTable).where(eq(fieldsTable.formId, formId));
      await tx
        .update(formsTable)
        .set({ updatedAt: new Date(now) })
        .where(eq(formsTable.id, formId));

      const inserted = await tx
        .insert(fieldsTable)
        .values(fieldsToInsert)
        .returning();

      return inserted;
    });

    return fields;
  }
}
