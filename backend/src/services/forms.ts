import { CreateForm, Form, UpdateForm } from "../types/forms.js";
import { eq } from "drizzle-orm";
import db from "../lib/db.js";
import { status } from "elysia";
import { formsTable } from "../db/schema.js";

export class FormsService {
  static async getForms(): Promise<Form[]> {
    return db
      .select({
        id: formsTable.id,
        name: formsTable.name,
        slug: formsTable.slug,
        status: formsTable.status,
        publishedAt: formsTable.publishedAt,
        createdAt: formsTable.createdAt,
        updatedAt: formsTable.updatedAt,
      })
      .from(formsTable);
  }

  static async createForm(form: CreateForm) {
    try {
      const id = crypto.randomUUID();

      const [created] = await db
        .insert(formsTable)
        .values({
          id,
          name: form.name,
          slug: form.slug,
          status: "DRAFT",
        })
        .returning();

      return created;
    } catch (err: any) {
      if (
        typeof err?.cause?.code === "string" &&
        err.cause.code === "SQLITE_CONSTRAINT"
      ) {
        throw status(409, "Slug already exists");
      }
      throw err;
    }
  }

  static async getForm(id: string) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.id, id))
      .limit(1);

    if (!form) throw status(404, "Form not found");
    return form;
  }

  static async updateForm(id: string, form: UpdateForm) {
    try {
      await this.ensureFormEditable(id);

      const now = Date.now();

      const [updated] = await db
        .update(formsTable)
        .set({
          ...form,
          updatedAt: new Date(now),
        })
        .where(eq(formsTable.id, id))
        .returning();

      if (!updated) throw status(404, "Form not found");
      return updated;
    } catch (err: any) {
      if (
        typeof err?.cause?.code === "string" &&
        err.cause.code === "SQLITE_CONSTRAINT"
      ) {
        throw status(409, "Slug already exists");
      }
      throw err;
    }
  }

  static async publishForm(id: string) {
    const existing = await this.getFormSummary(id);

    if (existing.status === "PUBLISHED") {
      throw status(409, "Formulaire deja publie");
    }

    const now = Date.now();

    const [published] = await db
      .update(formsTable)
      .set({
        status: "PUBLISHED",
        publishedAt: new Date(now),
        updatedAt: new Date(now),
      })
      .where(eq(formsTable.id, id))
      .returning();

    if (!published) throw status(404, "Form not found");
    return published;
  }

  private static async ensureFormEditable(id: string) {
    const form = await this.getFormSummary(id);

    if (form.status === "PUBLISHED") {
      throw status(409, "Formulaire deja publie");
    }

    return form;
  }

  private static async getFormSummary(id: string) {
    const [form] = await db
      .select({ id: formsTable.id, status: formsTable.status })
      .from(formsTable)
      .where(eq(formsTable.id, id))
      .limit(1);

    if (!form) throw status(404, "Form not found");
    return form;
  }
}
