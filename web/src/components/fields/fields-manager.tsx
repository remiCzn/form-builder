import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldForm, fieldToFormValues } from "@/components/fields/field-form";
import { SortableFieldItem } from "@/components/fields/sortable-field-item";
import {
  useFields,
  useCreateField,
  useUpdateField,
  useDeleteField,
  useReorderFields,
  type Field,
  type CreateField,
} from "@/services/fields";
import { getErrorMessage } from "@/lib/errors";

type FieldsManagerProps = {
  formId: string;
  onPreviewChange?: (draft: PreviewDraft | null) => void;
  isReadOnly?: boolean;
};

export type PreviewDraft = {
  mode: "create" | "edit";
  fieldId?: string;
  field: CreateField;
};

export function FieldsManager({
  formId,
  onPreviewChange,
  isReadOnly = false,
}: FieldsManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);

  const { data: fields, isPending, isError, error } = useFields(formId);
  const createField = useCreateField(formId);
  const updateField = useUpdateField(formId);
  const deleteField = useDeleteField(formId);
  const reorderFields = useReorderFields(formId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (!isReadOnly) return;
    setIsAdding(false);
    setEditingField(null);
    onPreviewChange?.(null);
  }, [isReadOnly, onPreviewChange]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (isReadOnly) return;
    const { active, over } = event;

    if (over && active.id !== over.id && fields) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      const newOrder = arrayMove(fields, oldIndex, newIndex);
      reorderFields.mutate(newOrder.map((f) => f.id));
    }
  };

  const handleCreate = (values: CreateField) => {
    if (isReadOnly) return;
    createField.mutate(values, {
      onSuccess: () => {
        setIsAdding(false);
        onPreviewChange?.(null);
      },
    });
  };

  const handleUpdate = (values: CreateField) => {
    if (isReadOnly) return;
    if (!editingField) return;
    updateField.mutate(
      { fieldId: editingField.id, payload: values },
      {
        onSuccess: () => {
          setEditingField(null);
          onPreviewChange?.(null);
        },
      },
    );
  };

  const handleDelete = (fieldId: string) => {
    if (isReadOnly) return;
    if (confirm("Supprimer ce champ ?")) {
      deleteField.mutate(fieldId);
    }
  };

  if (isPending) {
    return (
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        Chargement des champs...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
        {getErrorMessage(error)}
      </div>
    );
  }

  const handleStartCreate = () => {
    if (isReadOnly) return;
    setEditingField(null);
    setIsAdding(true);
    onPreviewChange?.(null);
  };

  const handleStartEdit = (field: Field) => {
    if (isReadOnly) return;
    setIsAdding(false);
    setEditingField(field);
    onPreviewChange?.(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Champs du formulaire</h2>
          <p className="text-sm text-muted-foreground">
            {isReadOnly
              ? "Consultez les champs du formulaire."
              : "Glissez-deposez pour reordonner les champs."}
          </p>
          {isReadOnly ? (
            <p className="text-xs text-muted-foreground">
              Formulaire publie. Les modifications sont desactivees.
            </p>
          ) : null}
        </div>
        {!isReadOnly && !isAdding && !editingField && (
          <Button onClick={handleStartCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        )}
      </div>

      {!isReadOnly && isAdding && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-medium mb-3">Nouveau champ</h3>
          <FieldForm
            onSubmit={handleCreate}
            onChange={(values) =>
              onPreviewChange?.({ mode: "create", field: values })
            }
            onCancel={() => {
              setIsAdding(false);
              onPreviewChange?.(null);
            }}
            isSubmitting={createField.isPending}
            submitLabel="Ajouter"
          />
          {createField.isError && (
            <p className="mt-2 text-sm text-destructive">
              {getErrorMessage(createField.error)}
            </p>
          )}
        </div>
      )}

      {!isReadOnly && editingField && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-medium mb-3">Modifier le champ</h3>
          <FieldForm
            defaultValues={fieldToFormValues(editingField)}
            onSubmit={handleUpdate}
            onChange={(values) => {
              if (!editingField) return;
              onPreviewChange?.({
                mode: "edit",
                fieldId: editingField.id,
                field: values,
              });
            }}
            onCancel={() => {
              setEditingField(null);
              onPreviewChange?.(null);
            }}
            isSubmitting={updateField.isPending}
            submitLabel="Enregistrer"
          />
          {updateField.isError && (
            <p className="mt-2 text-sm text-destructive">
              {getErrorMessage(updateField.error)}
            </p>
          )}
        </div>
      )}

      {fields && fields.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {fields.map((field) => (
                <SortableFieldItem
                  key={field.id}
                  field={field}
                  onEdit={handleStartEdit}
                  onDelete={handleDelete}
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        !isAdding && (
          <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
            <p className="text-muted-foreground">Aucun champ pour le moment.</p>
            {!isReadOnly ? (
              <Button
                variant="outline"
                className="mt-3"
                onClick={handleStartCreate}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un champ
              </Button>
            ) : null}
          </div>
        )
      )}
    </div>
  );
}
