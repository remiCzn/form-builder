import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import {
  FieldsManager,
  type PreviewDraft,
} from "@/components/fields/fields-manager";
import { FormEditor } from "@/components/forms/form-editor";
import { FormPreview, type PreviewField } from "@/components/forms/formPreview";
import { StatusBadge } from "@/components/forms/status-badge";
import { PageShell } from "@/components/layout/page-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useFields, useGenerateFields } from "@/services/fields";
import { useForm, usePublishForm, useUpdateForm } from "@/services/forms";

export const Route = createFileRoute("/forms/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data, isPending, isError, error } = useForm(id);
  const {
    data: fields,
    isPending: fieldsPending,
    isError: fieldsError,
    error: fieldsErrorResponse,
  } = useFields(id);
  const navigate = useNavigate();
  const updateForm = useUpdateForm(id);
  const publishForm = usePublishForm(id);
  const generateFields = useGenerateFields(id);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [previewDraft, setPreviewDraft] = useState<PreviewDraft | null>(null);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [prompt, setPrompt] = useState("");

  const errorMessage = isError ? getErrorMessage(error) : null;
  const updateErrorMessage = updateForm.isError
    ? getErrorMessage(updateForm.error)
    : null;
  const publishErrorMessage = publishForm.isError
    ? getErrorMessage(publishForm.error)
    : null;
  const generateErrorMessage = generateFields.isError
    ? getErrorMessage(generateFields.error)
    : null;
  const fieldsErrorMessage = fieldsError
    ? getErrorMessage(fieldsErrorResponse)
    : null;

  const previewFields = useMemo<PreviewField[]>(() => {
    const baseFields =
      fields?.map((field) => ({
        id: field.id,
        label: field.label,
        type: field.type,
        required: field.required,
        config: field.config,
      })) ?? [];

    if (!previewDraft) return baseFields;

    const draftField: PreviewField = {
      id: previewDraft.fieldId ?? "draft-field",
      label: previewDraft.field.label ?? "",
      type: previewDraft.field.type,
      required: Boolean(previewDraft.field.required),
      config: previewDraft.field.config ?? null,
      isDraft: true,
    };

    if (previewDraft.mode === "create") {
      return [...baseFields, { ...draftField, id: "draft-field" }];
    }

    return baseFields.map((field) =>
      field.id === previewDraft.fieldId ? { ...field, ...draftField } : field,
    );
  }, [fields, previewDraft]);

  return (
    <PageShell
      title={data?.name ?? "Formulaire"}
      description="Consultez les informations et modifiez les champs."
      actions={
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen((current) => !current)}
          >
            {isPreviewOpen ? "Masquer l'apercu" : "Afficher l'apercu"}
          </Button>
          {data?.status === "DRAFT" ? (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (
                  confirm("Publier ce formulaire ? Il ne sera plus modifiable.")
                ) {
                  publishForm.mutate(void 0);
                }
              }}
              disabled={publishForm.isPending}
            >
              {publishForm.isPending ? "Publication..." : "Publier"}
            </Button>
          ) : null}
          <Link
            to="/"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Retour
          </Link>
        </div>
      }
    >
      {isPending ? (
        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          Chargement du formulaire...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {data ? (
        <div
          className={cn("grid gap-5", isPreviewOpen ? "lg:grid-cols-2" : "")}
        >
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm text-muted-foreground">Identifiant</p>
                  <p className="font-mono text-sm">{data.id}</p>
                </div>
                <StatusBadge status={data.status} />
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                {[
                  {
                    label: "Cree le",
                    value: formatDateTime(data.createdAt),
                  },
                  {
                    label: "Derniere mise a jour",
                    value: formatDateTime(data.updatedAt),
                  },
                  {
                    label: "Publication",
                    value: formatDateTime(data.publishedAt),
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-muted-foreground">{item.label}</p>
                    <p className="font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              {data.status === "PUBLISHED" ? (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                  Ce formulaire est publie. Les modifications sont desactivées.
                </div>
              ) : null}
              {publishErrorMessage ? (
                <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {publishErrorMessage}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <div>
                <h2 className="text-lg font-semibold">
                  Modifier le formulaire
                </h2>
                <p className="text-sm text-muted-foreground">
                  Changez le nom ou le slug.
                </p>
              </div>
              <FormEditor
                defaultValues={{ name: data.name, slug: data.slug }}
                submitLabel="Enregistrer"
                cancelTo="/"
                isSubmitting={updateForm.isPending}
                error={updateErrorMessage}
                isReadOnly={data.status === "PUBLISHED"}
                onSubmit={(values) =>
                  updateForm.mutate(values, {
                    onSuccess: () => {
                      navigate({ to: "/" });
                    },
                  })
                }
              />
            </div>

            <FieldsManager
              formId={id}
              onPreviewChange={setPreviewDraft}
              isReadOnly={data.status === "PUBLISHED"}
              onGenerateClick={() => setIsAiDialogOpen(true)}
            />
          </div>

          {isPreviewOpen ? (
            <div className="lg:sticky lg:top-24 lg:self-start lg:border-l lg:border-border/60 lg:pl-4">
              <FormPreview
                title={data.name}
                fields={previewFields}
                isLoading={fieldsPending}
                errorMessage={fieldsErrorMessage}
              />
            </div>
          ) : null}
        </div>
      ) : null}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generer les champs avec l&apos;IA</DialogTitle>
            <DialogDescription>
              Decrivez le formulaire attendu, puis lancez la generation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ex: Formulaire de demande de devis pour une agence web"
              className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                data?.status === "PUBLISHED" || generateFields.isPending
              }
            />
            {generateErrorMessage ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {generateErrorMessage}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAiDialogOpen(false)}
              disabled={generateFields.isPending}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => {
                const trimmed = prompt.trim();
                if (!trimmed) return;
                generateFields.mutate(
                  { prompt: trimmed },
                  {
                    onSuccess: () => {
                      setPrompt("");
                      setIsAiDialogOpen(false);
                    },
                  },
                );
              }}
              disabled={
                data?.status === "PUBLISHED" ||
                generateFields.isPending ||
                !prompt.trim()
              }
            >
              {generateFields.isPending ? "Generation..." : "Generer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
