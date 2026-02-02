import { Link, createFileRoute } from "@tanstack/react-router";

import { StatusBadge } from "@/components/forms/status-badge";
import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useForms } from "@/services/forms";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isPending, isError, error } = useForms();

  return (
    <PageShell
      title="Formulaires"
      description="Creez, modifiez et suivez l'etat de vos formulaires."
      actions={
        <Link to="/forms/new" className={buttonVariants({ size: "sm" })}>
          Nouveau formulaire
        </Link>
      }
    >
      {isPending ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Chargement des formulaires...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {getErrorMessage(error)}
        </div>
      ) : null}

      {!isPending && !isError && (data?.length ?? 0) > 0 ? (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nom</th>
                  <th className="px-4 py-3 text-left font-medium">Slug</th>
                  <th className="px-4 py-3 text-left font-medium">Statut</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Derniere mise a jour
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((form) => (
                  <tr key={form.id} className="border-t border-border/60">
                    <td className="px-4 py-3">
                      <Link
                        to="/forms/$id"
                        params={{ id: form.id }}
                        className="font-medium text-foreground hover:underline"
                      >
                        {form.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {form.slug}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={form.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(form.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/forms/$id"
                        params={{ id: form.id }}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                        )}
                      >
                        Modifier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!isPending && !isError && (data?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed bg-card px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Aucun formulaire pour le moment.
          </p>
          <Link
            to="/forms/new"
            className={cn(buttonVariants({ size: "sm" }), "mt-4 inline-flex")}
          >
            Creer votre premier formulaire
          </Link>
        </div>
      ) : null}
    </PageShell>
  );
}
