import { fieldsTable, formsTable } from "db/schema";
import { CreateField, UpdateField } from "types/fields";
import { and, asc, eq, max } from "drizzle-orm";
import db from "lib/db";
import { status } from "elysia";

export class FieldsService {
  static async getFields(formId: string) {
    await this.ensureFormExists(formId);

    return db
      .select()
      .from(fieldsTable)
      .where(eq(fieldsTable.formId, formId))
      .orderBy(asc(fieldsTable.order));
  }

  static async createField(formId: string, field: CreateField) {
    await this.ensureFormExists(formId);

    const id = crypto.randomUUID();

    const [maxOrderResult] = await db
      .select({ maxOrder: max(fieldsTable.order) })
      .from(fieldsTable)
      .where(eq(fieldsTable.formId, formId));

    const nextOrder = (maxOrderResult?.maxOrder ?? -1) + 1;

    const [created] = await db
      .insert(fieldsTable)
      .values({
        id,
        formId,
        type: field.type,
        label: field.label,
        required: field.required ?? false,
        order: nextOrder,
        config: field.config ?? null,
      })
      .returning();

    return created;
  }

  static async updateField(formId: string, fieldId: string, field: UpdateField) {
    await this.ensureFormExists(formId);

    const now = Date.now();

    const [updated] = await db
      .update(fieldsTable)
      .set({
        ...field,
        updatedAt: new Date(now),
      })
      .where(and(eq(fieldsTable.id, fieldId), eq(fieldsTable.formId, formId)))
      .returning();

    if (!updated) throw status(404, "Field not found");
    return updated;
  }

  static async deleteField(formId: string, fieldId: string) {
    await this.ensureFormExists(formId);

    const [deleted] = await db
      .delete(fieldsTable)
      .where(and(eq(fieldsTable.id, fieldId), eq(fieldsTable.formId, formId)))
      .returning();

    if (!deleted) throw status(404, "Field not found");
    return { success: true };
  }

  static async reorderFields(formId: string, fieldOrder: string[]) {
    await this.ensureFormExists(formId);

    const now = Date.now();

    await db.transaction(async (tx) => {
      for (let i = 0; i < fieldOrder.length; i++) {
        await tx
          .update(fieldsTable)
          .set({
            order: i,
            updatedAt: new Date(now),
          })
          .where(
            and(eq(fieldsTable.id, fieldOrder[i]), eq(fieldsTable.formId, formId)),
          );
      }
    });

    return this.getFields(formId);
  }

  private static async ensureFormExists(formId: string) {
    const [form] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(eq(formsTable.id, formId))
      .limit(1);

    if (!form) throw status(404, "Form not found");
    return form;
  }
}
