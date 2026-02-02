import { useState } from "react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SortableOptionProps = {
  id: string;
  value: string;
  onRemove: () => void;
  onChange: (value: string) => void;
};

function SortableOption({ id, value, onRemove, onChange }: SortableOptionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 ${isDragging ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Valeur de l'option"
        className="flex-1"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

type DropdownOptionsEditorProps = {
  value: string[];
  onChange: (options: string[]) => void;
};

export function DropdownOptionsEditor({
  value,
  onChange,
}: DropdownOptionsEditorProps) {
  const [newOption, setNewOption] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const optionsWithIds = value.map((opt, idx) => ({
    id: `option-${idx}`,
    value: opt,
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = optionsWithIds.findIndex((o) => o.id === active.id);
      const newIndex = optionsWithIds.findIndex((o) => o.id === over.id);
      const newOrder = arrayMove(value, oldIndex, newIndex);
      onChange(newOrder);
    }
  };

  const handleAdd = () => {
    const trimmed = newOption.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setNewOption("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, newValue: string) => {
    const updated = [...value];
    updated[index] = newValue;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label>Options de la liste</Label>

      {value.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={optionsWithIds.map((o) => o.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {optionsWithIds.map((option, index) => (
                <SortableOption
                  key={option.id}
                  id={option.id}
                  value={option.value}
                  onRemove={() => handleRemove(index)}
                  onChange={(val) => handleChange(index, val)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="text-sm text-muted-foreground">Aucune option ajoutée.</p>
      )}

      <div className="flex gap-2">
        <Input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nouvelle option..."
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={handleAdd}
          disabled={!newOption.trim()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {value.some((v) => !v.trim()) && (
        <p className="text-sm text-destructive">
          Certaines options sont vides.
        </p>
      )}
    </div>
  );
}
