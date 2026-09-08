import { OrgPickerHeader } from "@/components/layout/org-picker-header";
import { NewOrgForm } from "@/components/org/new-org-form";

export const metadata = {
  title: "New Organization | Backlify",
  description: "Create a new organization to manage your PostgreSQL projects.",
};

export default function NewOrganizationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OrgPickerHeader title="New organization" />

      <main className="flex-1 flex items-center justify-center p-6">
        <NewOrgForm />
      </main>
    </div>
  );
}
