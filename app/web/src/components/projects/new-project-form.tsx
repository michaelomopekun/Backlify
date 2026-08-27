"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { createProject } from "@/app/actions/backup.actions";

/**
 * Add a project.
 *
 * An inline disclosure rather than a modal: this is the primary action on an
 * otherwise-empty page, and a dialog would put a scrim over the very list the
 * reader is trying to fill.
 *
 * The connection string field is `type="password"` — it carries a database
 * credential, and this form is as likely to be filled in with someone watching
 * as any other.
 */
export function NewProjectForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await createProject(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      setOpen(false);
      if (result?.projectId) router.push(`/dashboard/project/${result.projectId}`);
    });
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        <IconPlus className="size-4" aria-hidden />
        Add project
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="w-full rounded-xl border border-border bg-card p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-foreground">Add a project</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
        >
          <IconX className="size-4" aria-hidden />
          <span className="sr-only">Cancel</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="name"
          label="Project name"
          placeholder="Production API"
          autoComplete="off"
          required
        />
        <Field
          name="databaseUrl"
          label="Connection string"
          type="password"
          placeholder="postgresql://user:password@host:5432/db"
          autoComplete="off"
          hint="Stored so the runner can reach your database."
          required
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add project"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  hint,
  ...props
}: React.ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        {...props}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
