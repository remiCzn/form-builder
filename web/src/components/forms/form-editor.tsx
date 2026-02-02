import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "@tanstack/react-router";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type FormValues = {
  name: string;
  slug: string;
};

type FormEditorProps = {
  defaultValues?: FormValues;
  submitLabel: string;
  onSubmit: (values: FormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
  cancelTo?: "/" | "/forms/new";
  autoSlug?: boolean;
  isReadOnly?: boolean;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function FormEditor({
  defaultValues,
  submitLabel,
  onSubmit,
  isSubmitting = false,
  error,
  cancelTo,
  autoSlug = false,
  isReadOnly = false,
}: FormEditorProps) {
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));

  const initialValues = useMemo(
    () => ({
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
    }),
    [defaultValues?.name, defaultValues?.slug],
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
    if (initialValues.slug) setSlugTouched(true);
  }, [initialValues, reset]);

  const watchedName = watch("name");

  useEffect(() => {
    if (!autoSlug || slugTouched) return;
    setValue("slug", slugify(watchedName));
  }, [autoSlug, watchedName, slugTouched, setValue]);

  const slugField = register("slug", {
    required: "Le slug est requis.",
    pattern: {
      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      message: "Format invalide. Utilisez des minuscules, chiffres et tirets.",
    },
    onChange: () => setSlugTouched(true),
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={handleSubmit((values) => onSubmit(values))}
    >
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="form-name">Nom</Label>
            <Input
              id="form-name"
              placeholder="Ex: Formulaire d'inscription"
              disabled={isReadOnly}
              {...register("name", {
                required: "Le nom est requis.",
              })}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="form-slug">Slug</Label>
            <Input
              id="form-slug"
              placeholder="ex: formulaire-inscription"
              disabled={isReadOnly}
              {...slugField}
            />
            <p className="text-xs text-muted-foreground">
              Le slug est utilise dans les URLs. Format: minuscules, chiffres et
              tirets.
            </p>
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {cancelTo ? (
          <Link
            to={cancelTo}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Annuler
          </Link>
        ) : null}
        <Button type="submit" disabled={isSubmitting || isReadOnly}>
          {isSubmitting ? "En cours..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
