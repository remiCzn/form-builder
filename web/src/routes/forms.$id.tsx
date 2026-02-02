import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { FieldsManager } from "@/components/fields/fields-manager";
import { FormEditor } from "@/components/forms/form-editor";
import { StatusBadge } from "@/components/forms/status-badge";
import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import { useForm, useUpdateForm } from "@/services/forms";

export const Route = createFileRoute("/forms/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data, isPending, isError, error } = useForm(id);
  const navigate = useNavigate();
  const updateForm = useUpdateForm(id);

  const errorMessage = isError ? getErrorMessage(error) : null;
  const updateErrorMessage = updateForm.isError
    ? getErrorMessage(updateForm.error)
    : null;

  return (
    <PageShell
      title={data?.name ?? "Formulaire"}
      description="Consultez les informations et modifiez les champs."
      actions={
        <Link
          to="/"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Retour
        </Link>
      }
    >
      {isPending ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Chargement du formulaire...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {data ? (
        <div className="grid gap-8">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Identifiant</p>
                <p className="font-mono text-sm">{data.id}</p>
              </div>
              <StatusBadge status={data.status} />
            </div>
            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
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
          </div>

          <FieldsManager formId={id} />

          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Modifier le formulaire</h2>
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
              onSubmit={(values) =>
                updateForm.mutate(values, {
                  onSuccess: () => {
                    navigate({ to: "/" });
                  },
                })
              }
            />
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
