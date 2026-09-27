import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AccountLoading() {
  return (
    <div className="w-full max-w-4xl space-y-10 sm:space-y-12 pb-24 animate-in fade-in duration-200 font-sans">
      <div>
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground font-sans">
          Preferences
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage your account profile, connections, and dashboard experience.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground font-sans">Profile information</h2>

        <Card className="border-border/60 bg-card/60 py-0 gap-0 overflow-hidden shadow-xs">
          <CardContent className="p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">First name</Label>
                <div className="h-9.5 px-3 bg-[#080808] border border-input rounded-md flex items-center">
                  <Skeleton className="h-3.5 w-24 bg-white/[0.08]" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">Last name</Label>
                <div className="h-9.5 px-3 bg-[#080808] border border-input rounded-md flex items-center">
                  <Skeleton className="h-3.5 w-28 bg-white/[0.08]" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-foreground">Primary email</Label>
                <p className="text-[11px] text-muted-foreground">
                  Used for account notifications and security alerts
                </p>
              </div>
              <div className="h-9.5 px-3 bg-[#080808] border border-input rounded-md flex items-center">
                <Skeleton className="h-3.5 w-48 bg-white/[0.08]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-foreground">Username</Label>
                <p className="text-[11px] text-muted-foreground">
                  Display name used across the dashboard and team audit logs
                </p>
              </div>
              <div className="h-9.5 px-3 bg-[#080808] border border-input rounded-md flex items-center">
                <Skeleton className="h-3.5 w-32 bg-white/[0.08]" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="px-5 sm:px-6 py-3.5 bg-muted/20 border-t border-border/50 flex items-center justify-end">
            <Button disabled className="h-8.5 px-4 text-xs font-medium bg-white text-black opacity-50 cursor-not-allowed">
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
