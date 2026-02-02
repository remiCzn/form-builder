import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DropdownOptionsEditor } from "@/components/fields/dropdown-options-editor";
import type { CreateField, Field, FieldType } from "@/services/fields";

type FieldFormValues = {
  label: string;
  type: FieldType;
  required: boolean;
};

type FieldFormProps = {
  defaultValues?: Partial<FieldFormValues & { dropdownOptions: string[] }>;
  onSubmit: (values: CreateField) => void;
  onChange?: (values: CreateField) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "TEXT", label: "Texte" },
  { value: "NUMBER", label: "Nombre" },
  { value: "DROPDOWN", label: "Liste deroulante" },
];

export function FieldForm({
  defaultValues,
  onSubmit,
  onChange,
  onCancel,
  isSubmitting,
  submitLabel = "Ajouter",
}: FieldFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FieldFormValues & { dropdownOptions: string[] }>({
    defaultValues: {
      label: defaultValues?.label ?? "",
      type: defaultValues?.type ?? "TEXT",
      required: defaultValues?.required ?? false,
      dropdownOptions: defaultValues?.dropdownOptions ?? [],
    },
  });

  const watchedLabel = watch("label");
  const watchedType = watch("type");
  const watchedRequired = watch("required");
  const dropdownOptions = watch("dropdownOptions");
  const lastPreviewKey = useRef<string | null>(null);

  useEffect(() => {
    if (!onChange) return;
    const previewKey = `${watchedLabel}||${watchedType}||${watchedRequired}||${dropdownOptions.join("::")}`;
    if (lastPreviewKey.current === previewKey) return;
    lastPreviewKey.current = previewKey;
    const validOptions = dropdownOptions.filter((o) => o.trim());
    const config: Record<string, unknown> | undefined =
      watchedType === "DROPDOWN" && validOptions.length > 0
        ? { options: validOptions }
        : undefined;

    onChange({
      label: watchedLabel,
      type: watchedType,
      required: watchedRequired,
      config,
    });
  }, [dropdownOptions, onChange, watchedLabel, watchedRequired, watchedType]);

  const fieldType = watchedType;

  const onFormSubmit = (
    values: FieldFormValues & { dropdownOptions: string[] },
  ) => {
    const validOptions = values.dropdownOptions.filter((o) => o.trim());

    const config: Record<string, unknown> | undefined =
      values.type === "DROPDOWN" && validOptions.length > 0
        ? { options: validOptions }
        : undefined;

    onSubmit({
      label: values.label,
      type: values.type,
      required: values.required,
      config,
    });
  };

  const hasEmptyOptions =
    fieldType === "DROPDOWN" && dropdownOptions.some((o) => !o.trim());

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="label">Libelle</Label>
          <Input
            id="label"
            {...register("label", { required: "Le libelle est requis" })}
            placeholder="Ex: Nom complet"
          />
          {errors.label && (
            <p className="text-sm text-destructive">{errors.label.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select id="type" {...register("type")}>
            {FIELD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {fieldType === "DROPDOWN" && (
        <DropdownOptionsEditor
          value={dropdownOptions}
          onChange={(options) => setValue("dropdownOptions", options)}
        />
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required"
          {...register("required")}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="required" className="font-normal">
          Champ obligatoire
        </Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || hasEmptyOptions}>
          {isSubmitting ? "Enregistrement..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
}

export function fieldToFormValues(
  field: Field,
): FieldFormValues & { dropdownOptions: string[] } {
  return {
    label: field.label,
    type: field.type,
    required: field.required,
    dropdownOptions:
      field.config && Array.isArray(field.config.options)
        ? (field.config.options as string[])
        : [],
  };
}
