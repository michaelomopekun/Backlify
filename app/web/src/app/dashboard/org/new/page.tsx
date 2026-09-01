import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { OrgPickerHeader } from "@/components/layout/org-picker-header";

export default function NewOrganizationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OrgPickerHeader title="New organization" />

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl border-border bg-card overflow-hidden shadow-sm">
          <CardHeader className="p-6 border-b border-border/80 space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground tracking-tight">
              Create a new organization
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              Organizations are a way to group your projects. Each organization can be configured with different team members and billing settings.
            </CardDescription>
          </CardHeader>

          <form action="/dashboard/org/default-org">
            <CardContent className="p-0 divide-y divide-border/80">
              {/* Row 1: Name */}
              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-start">
                <div>
                  <label htmlFor="org-name" className="text-xs font-medium text-foreground block">
                    Name <span className="text-primary">*</span>
                  </label>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    What&apos;s the name of your company or team?
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Input
                    id="org-name"
                    name="name"
                    placeholder="e.g. Acme Corporation"
                    required
                    className="bg-muted/30 border-border text-sm h-9 focus-visible:ring-primary"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    You can change this later in organization settings.
                  </p>
                </div>
              </div>

              {/* Row 2: Type */}
              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-start">
                <div>
                  <label className="text-xs font-medium text-foreground block">
                    Organization Type
                  </label>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    What best describes your organization?
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Select defaultValue="personal">
                    <SelectTrigger className="bg-muted/30 border-border text-sm h-9">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover">
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Helps us tailor backup and compliance defaults.
                  </p>
                </div>
              </div>

              {/* Row 3: Plan */}
              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-start">
                <div>
                  <label className="text-xs font-medium text-foreground block">
                    Subscription Plan
                  </label>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Choose a tier that fits your needs.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Select defaultValue="free">
                    <SelectTrigger className="bg-muted/30 border-border text-sm h-9">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover">
                      <SelectItem value="free">Free - $0/month</SelectItem>
                      <SelectItem value="pro">Pro - $25/month</SelectItem>
                      <SelectItem value="team">Team - $599/month</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Free tier includes 2 database projects and 50 snapshots.{" "}
                    <span className="text-primary hover:underline cursor-pointer">Learn more</span>.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-6 py-4 border-t border-border/80 bg-muted/10 flex items-center justify-between">
              <Button asChild variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground">
                <Link href="/dashboard/org/default-org">Cancel</Link>
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                Create organization
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
