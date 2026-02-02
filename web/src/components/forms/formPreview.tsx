import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FieldType } from "@/services/fields";

export type PreviewField = {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  config?: Record<string, unknown> | null;
  isDraft?: boolean;
};

type FormPreviewProps = {
  title: string;
  fields: PreviewField[];
  isLoading?: boolean;
  errorMessage?: string | null;
};

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  TEXT: "Texte",
  NUMBER: "Nombre",
  DROPDOWN: "Liste deroulante",
};

const getDropdownOptions = (field: PreviewField) => {
  if (!field.config || typeof field.config !== "object") return [];
  const options = (field.config as { options?: unknown }).options;
  return Array.isArray(options)
    ? options.filter((o) => typeof o === "string" && o.trim())
    : [];
};

export function FormPreview({
  title,
  fields,
  isLoading = false,
  errorMessage,
}: FormPreviewProps) {
  const displayTitle = title.trim() ? title : "Formulaire sans titre";

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Apercu (lecture seule)
          </p>
          <h2 className="text-lg font-semibold">{displayTitle}</h2>
        </div>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
          Live
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-3 text-sm text-muted-foreground">
            Chargement de l&apos;apercu...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        {!isLoading && !errorMessage && fields.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-3 text-sm text-muted-foreground">
            Aucun champ pour le moment.
          </div>
        ) : null}

        {!isLoading && !errorMessage
          ? fields.map((field) => {
              const options = getDropdownOptions(field);
              return (
                <div
                  key={field.id}
                  className={cn(
                    "space-y-1.5",
                    field.isDraft &&
                      "rounded-lg border border-dashed border-primary/30 bg-primary/5 p-2",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Label className="text-sm font-medium">
                      {field.label.trim() ? field.label : "Champ sans libelle"}
                    </Label>
                    {field.required ? (
                      <span className="text-xs text-destructive">*</span>
                    ) : null}
                    {field.isDraft ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                        Brouillon
                      </span>
                    ) : null}
                  </div>

                  {field.type === "DROPDOWN" ? (
                    <Select>
                      {options.length > 0 ? (
                        options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))
                      ) : (
                        <option>Aucune option</option>
                      )}
                    </Select>
                  ) : (
                    <Input
                      type={field.type === "NUMBER" ? "number" : "text"}
                      placeholder={
                        field.type === "NUMBER" ? "0" : "Votre reponse"
                      }
                    />
                  )}
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
}
