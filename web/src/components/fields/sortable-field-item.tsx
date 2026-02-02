import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Field } from "@/services/fields";

type FieldTypeLabel = {
  TEXT: string;
  NUMBER: string;
  DROPDOWN: string;
};

const FIELD_TYPE_LABELS: FieldTypeLabel = {
  TEXT: "Texte",
  NUMBER: "Nombre",
  DROPDOWN: "Liste",
};

type SortableFieldItemProps = {
  field: Field;
  onEdit: (field: Field) => void;
  onDelete: (fieldId: string) => void;
  isReadOnly?: boolean;
};

export function SortableFieldItem({
  field,
  onEdit,
  onDelete,
  isReadOnly = false,
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id, disabled: isReadOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        className={`cursor-grab touch-none text-muted-foreground hover:text-foreground ${
          isReadOnly ? "pointer-events-none opacity-50" : ""
        }`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{field.label}</span>
          {field.required && (
            <span className="text-xs text-destructive">*</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{FIELD_TYPE_LABELS[field.type]}</span>
          {field.type === "DROPDOWN" &&
            field.config &&
            Array.isArray(field.config.options) && (
              <span>({field.config.options.length} options)</span>
            )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={isReadOnly}
          onClick={() => onEdit(field)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={isReadOnly}
          onClick={() => onDelete(field.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
