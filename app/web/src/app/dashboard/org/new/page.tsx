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
import { OrgPickerHeader } from "@/components/dashboard/org-picker-header";

export default function NewOrganizationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OrgPickerHeader title="New organization" />

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-xl border-border bg-card">
          <CardHeader className="space-y-1.5 pb-6">
            <CardTitle className="text-lg font-semibold text-foreground">
              Create a new organization
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              Organizations are a way to group your projects. Each organization can be configured with different team members and billing settings.
            </CardDescription>
          </CardHeader>

          <form action="/dashboard/org/default-org">
            <CardContent className="space-y-6">
              {/* Name field */}
              <div className="space-y-2">
                <label htmlFor="org-name" className="text-xs font-medium text-foreground">
                  Name
                </label>
                <Input
                  id="org-name"
                  name="name"
                  placeholder="Organization name"
                  required
                  className="bg-muted/30 border-border text-sm h-9 focus-visible:ring-primary"
                />
                <p className="text-[11px] text-muted-foreground">
                  What&apos;s the name of your company or team? You can change this later.
                </p>
              </div>

              {/* Type field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">
                  Type
                </label>
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
                  What best describes your organization?
                </p>
              </div>

              {/* Plan field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">
                  Plan
                </label>
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
                  Which plan fits your organization&apos;s needs best?{" "}
                  <span className="text-primary hover:underline cursor-pointer">Learn more</span>.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-6 border-t border-border mt-6">
              <Button asChild variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground">
                <Link href="/dashboard/org">Cancel</Link>
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
