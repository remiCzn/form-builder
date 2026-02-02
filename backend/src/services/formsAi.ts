import { status } from "elysia";
import { and, eq, like, ne } from "drizzle-orm";
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

const normalizeValue = (value?: string) => value?.trim() ?? "";

const getFallbackSlug = () =>
  `formulaire-${crypto.randomUUID().slice(0, 8)}`;

const getAvailableSlug = async (baseSlug: string, formId: string) => {
  const normalized = normalizeValue(baseSlug);
  const candidate = normalized || getFallbackSlug();

  const existing = await db
    .select({ slug: formsTable.slug })
    .from(formsTable)
    .where(
      and(
        like(formsTable.slug, `${candidate}%`),
        ne(formsTable.id, formId),
      ),
    );

  const used = new Set(existing.map((row) => row.slug));

  if (!used.has(candidate)) {
    return candidate;
  }

  let suffix = 2;
  while (used.has(`${candidate}-${suffix}`)) {
    suffix += 1;
  }

  return `${candidate}-${suffix}`;
};

export class FormsAiService {
  static async generateFormFields(formId: string, prompt: string) {
    const cleanedPrompt = prompt.trim();

    if (!cleanedPrompt) {
      throw status(400, "Prompt requis.");
    }

    const [form] = await db
      .select({
        id: formsTable.id,
        status: formsTable.status,
        name: formsTable.name,
        slug: formsTable.slug,
      })
      .from(formsTable)
      .where(eq(formsTable.id, formId))
      .limit(1);

    if (!form) {
      throw status(404, "Form not found");
    }

    if (form.status === "PUBLISHED") {
      throw status(409, "Formulaire deja publie");
    }

    const existingFields = await db
      .select({
        id: fieldsTable.id,
        label: fieldsTable.label,
        type: fieldsTable.type,
        required: fieldsTable.required,
        order: fieldsTable.order,
        config: fieldsTable.config,
      })
      .from(fieldsTable)
      .where(eq(fieldsTable.formId, formId))
      .orderBy(fieldsTable.order);

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
            content: [
              "Formulaire actuel:",
              `Nom: ${form.name}`,
              `Slug: ${form.slug}`,
              "Champs:",
              existingFields.length
                ? JSON.stringify(existingFields)
                : "Aucun champ",
              "",
              `Brief: ${cleanedPrompt}`,
            ].join("\n"),
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

    const nextName = normalizeValue(parsed.name) || form.name;
    const nextSlug = await getAvailableSlug(
      normalizeValue(parsed.slug) || form.slug,
      formId,
    );

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
        .set({
          name: nextName,
          slug: nextSlug,
          updatedAt: new Date(now),
        })
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
