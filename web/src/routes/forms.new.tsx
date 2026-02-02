import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { FormEditor } from "@/components/forms/form-editor";
import { PageShell } from "@/components/layout/page-shell";
import { getErrorMessage } from "@/lib/errors";
import { useCreateForm } from "@/services/forms";

export const Route = createFileRoute("/forms/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const createForm = useCreateForm();

  const errorMessage = createForm.isError
    ? getErrorMessage(createForm.error.response?.data)
    : null;

  return (
    <PageShell
      title="Nouveau formulaire"
      description="Creez un formulaire et configurez ensuite son contenu."
    >
      <FormEditor
        submitLabel="Creer le formulaire"
        autoSlug
        cancelTo="/"
        isSubmitting={createForm.isPending}
        error={errorMessage}
        onSubmit={(values) => {
          createForm.mutate(values, {
            onSuccess: (created) => {
              navigate({ to: "/forms/$id", params: { id: created.id } });
            },
          });
        }}
      />
    </PageShell>
  );
}
