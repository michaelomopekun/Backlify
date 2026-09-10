"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconBuilding,
  IconCheck,
  IconCopy,
  IconTrash,
  IconUserPlus,
  IconUsers,
  IconShield,
  IconAlertTriangle,
  IconDatabase,
  IconServer,
  IconSparkles,
  IconLoader2,
  IconArrowUpRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface OrgMember {
  id: string;
  orgId: string;
  userId: string | null;
  email: string;
  name: string | null;
  role: string;
  invitedAt: string | Date;
  joinedAt: string | Date | null;
}

export interface OrgSettingsProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    userId: string;
    createdAt: string | Date;
    projectsCount: number;
    totalStorageBytes: number;
  };
  initialMembers: OrgMember[];
}

export function OrgSettingsClient({
  organization,
  initialMembers,
}: OrgSettingsProps) {
  const router = useRouter();

  // General settings state
  const [orgName, setOrgName] = useState(organization.name);
  const [slug, setSlug] = useState(organization.slug);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Members state
  const [members, setMembers] = useState<OrgMember[]>(initialMembers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [isInviting, setIsInviting] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  // Danger zone state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy helper
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 1. Save General Info
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      toast.error("Organization name cannot be empty");
      return;
    }

    setIsSavingGeneral(true);
    try {
      const res = await fetch(`/api/organizations/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName.trim(), slug: slug.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update organization");
      }

      toast.success("Organization settings updated successfully");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setIsSavingGeneral(false);
    }
  };

  // 2. Invite Member
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Email address is required");
      return;
    }

    setIsInviting(true);
    try {
      const res = await fetch(`/api/organizations/${organization.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          name: inviteName.trim() || undefined,
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to invite member");
      }

      toast.success(`Invitation sent to ${inviteEmail}`);
      setMembers((prev) => [...prev, data.member]);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("member");
      setIsInviteOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to invite member");
    } finally {
      setIsInviting(false);
    }
  };

  // 3. Remove Member
  const handleRemoveMember = async (memberId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from this organization?`)) {
      return;
    }

    setRemovingMemberId(memberId);
    try {
      const res = await fetch(
        `/api/organizations/${organization.id}/members?memberId=${memberId}`,
        { method: "DELETE" }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove member");
      }

      toast.success("Member removed successfully");
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setRemovingMemberId(null);
    }
  };

  // 4. Delete Organization
  const handleDeleteOrganization = async () => {
    if (confirmName !== organization.name) {
      toast.error("Please type the exact organization name to confirm deletion");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/organizations/${organization.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete organization");
      }

      toast.success("Organization deleted successfully");
      setIsDeleteOpen(false);
      router.push("/dashboard/org");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete organization");
      setIsDeleting(false);
    }
  };

  // Storage calculation
  const FREE_TIER_STORAGE_BYTES = 50 * 1024 * 1024; // 50 MB
  const storagePercentage = Math.min(
    100,
    Math.round((organization.totalStorageBytes / FREE_TIER_STORAGE_BYTES) * 100)
  );

  const storageUsedStr =
    organization.totalStorageBytes === 0
      ? "0 MB"
      : organization.totalStorageBytes < 1024 * 1024
      ? `${(organization.totalStorageBytes / (1024 * 1024)).toFixed(1)} MB`
      : organization.totalStorageBytes > 1024 * 1024 * 1024
      ? `${(organization.totalStorageBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
      : `${(organization.totalStorageBytes / (1024 * 1024)).toFixed(1)} MB`;

  const createdDateStr = new Date(organization.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl space-y-10 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Organization Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage organization profile, team members, subscription limits, and danger zone.
        </p>
      </div>

      {/* ─── 1. General Information ─── */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden">
        <div className="p-5 border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#181818] border border-[#2a2a2a] text-[#888888]">
              <IconBuilding className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">General Information</h2>
              <p className="text-xs text-muted-foreground">
                Organization details and URL identifiers
              </p>
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Created {createdDateStr}
          </span>
        </div>

        <form onSubmit={handleSaveGeneral} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Org Name */}
            <div className="space-y-2">
              <Label htmlFor="org-name" className="text-xs text-[#aaaaaa]">
                Organization Name
              </Label>
              <Input
                id="org-name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="bg-[#161616] border-[#2c2c2c] text-white text-sm h-9 focus:border-[#444444]"
              />
            </div>

            {/* Org Slug */}
            <div className="space-y-2">
              <Label htmlFor="org-slug" className="text-xs text-[#aaaaaa]">
                Organization Slug
              </Label>
              <div className="relative">
                <Input
                  id="org-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. acme-corp"
                  className="bg-[#161616] border-[#2c2c2c] text-white text-sm h-9 pr-8 font-mono focus:border-[#444444]"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(slug, "Slug")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {copiedField === "Slug" ? (
                    <IconCheck className="size-3.5 text-emerald-400" />
                  ) : (
                    <IconCopy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Org ID Read-only */}
          <div className="space-y-2">
            <Label className="text-xs text-[#aaaaaa]">Organization ID</Label>
            <div className="flex items-center gap-2">
              <div className="h-9 px-3 flex-1 flex items-center bg-[#161616] border border-[#2c2c2c] rounded-md font-mono text-xs text-[#888888]">
                {organization.id}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(organization.id, "Organization ID")}
                className="h-9 px-3 border-[#2c2c2c] bg-[#161616] text-xs hover:bg-[#202020] text-muted-foreground hover:text-white"
              >
                {copiedField === "Organization ID" ? (
                  <IconCheck className="size-3.5 mr-1.5 text-emerald-400" />
                ) : (
                  <IconCopy className="size-3.5 mr-1.5" />
                )}
                Copy ID
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isSavingGeneral || (orgName === organization.name && slug === organization.slug)}
              className="h-9 px-4 text-xs font-medium bg-white text-black hover:bg-neutral-200 transition-colors"
            >
              {isSavingGeneral ? (
                <>
                  <IconLoader2 className="size-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* ─── 2. Plan & Usage Overview ─── */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden">
        <div className="p-5 border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#181818] border border-[#2a2a2a] text-[#888888]">
              <IconDatabase className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Plan & Resource Usage</h2>
              <p className="text-xs text-muted-foreground">
                Active backup quotas, database limits, and storage usage
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-border/80 bg-muted/30 text-muted-foreground font-mono text-[11px] uppercase tracking-wider"
          >
            Free Tier
          </Badge>
        </div>

        <div className="p-6 space-y-6">
          {/* Storage Meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#aaaaaa] flex items-center gap-1.5">
                <IconServer className="size-3.5" /> Storage Consumption
              </span>
              <span className="font-mono text-white">
                {storageUsedStr} / 50 MB ({storagePercentage}%)
              </span>
            </div>
            <Progress value={storagePercentage} className="h-2 bg-[#1a1a1a]" />
            <p className="text-[11px] text-muted-foreground">
              Calculated across all live project backups and table archives.
            </p>
          </div>

          {/* Quota Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-md bg-[#161616] border border-[#262626]">
              <div className="text-[11px] text-[#777777]">Active Projects</div>
              <div className="text-lg font-semibold text-white mt-1">
                {organization.projectsCount} <span className="text-xs text-[#555555] font-normal">/ 5 max</span>
              </div>
            </div>

            <div className="p-3.5 rounded-md bg-[#161616] border border-[#262626]">
              <div className="text-[11px] text-[#777777]">Retention Window</div>
              <div className="text-lg font-semibold text-white mt-1">
                7 Days <span className="text-xs text-[#555555] font-normal">FIFO</span>
              </div>
            </div>

            <div className="p-3.5 rounded-md bg-[#161616] border border-[#262626]">
              <div className="text-[11px] text-[#777777]">Team Seats</div>
              <div className="text-lg font-semibold text-white mt-1">
                {members.length} <span className="text-xs text-[#555555] font-normal">/ Unlimited</span>
              </div>
            </div>
          </div>

          {/* Upgrade Banner */}
          <div className="p-4 rounded-md bg-[#141414] border border-[#242424] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-[#1c1c1c] text-neutral-300">
                <IconSparkles className="size-4" />
              </div>
              <div>
                <div className="text-xs font-medium text-white">Need higher storage limits or BYOK encryption?</div>
                <div className="text-[11px] text-[#888888] mt-0.5">
                  Pro plans include 250 GB storage, continuous WAL archiving, and custom S3 vaults.
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toast.info("Stripe Billing integration is on the roadmap!")}
              className="h-8 px-3 text-xs border-[#333333] hover:bg-[#202020] text-white shrink-0"
            >
              Upgrade Plan
              <IconArrowUpRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ─── 3. Team & Member Management ─── */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden">
        <div className="p-5 border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#181818] border border-[#2a2a2a] text-[#888888]">
              <IconUsers className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Team Members</h2>
              <p className="text-xs text-muted-foreground">
                Manage access and collaborator roles for this organization
              </p>
            </div>
          </div>

          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                className="h-8 px-3 text-xs font-medium bg-white text-black hover:bg-neutral-200 transition-colors"
              >
                <IconUserPlus className="size-3.5 mr-1.5" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121212] border-[#252525] text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base text-white">Invite Team Member</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Send an invitation to join {organization.name}. They will receive access based on their assigned role.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleInviteMember} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="invite-email" className="text-xs text-[#aaaaaa]">
                    Email Address <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="invite-email"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    className="bg-[#181818] border-[#2c2c2c] text-white text-sm h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="invite-name" className="text-xs text-[#aaaaaa]">
                    Full Name (Optional)
                  </Label>
                  <Input
                    id="invite-name"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Jane Doe"
                    className="bg-[#181818] border-[#2c2c2c] text-white text-sm h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-[#aaaaaa]">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="bg-[#181818] border-[#2c2c2c] text-white text-sm h-9">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161616] border-[#2c2c2c] text-white">
                      <SelectItem value="member">
                        <div className="text-xs">
                          <span className="font-medium text-white">Member</span> — View and trigger backup jobs
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="text-xs">
                          <span className="font-medium text-white">Admin</span> — Manage projects, storage vaults, and settings
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteOpen(false)}
                    className="h-8 px-3 text-xs border-[#333333] text-muted-foreground hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isInviting || !inviteEmail.trim()}
                    className="h-8 px-3 text-xs font-medium bg-white text-black hover:bg-neutral-200"
                  >
                    {isInviting ? (
                      <>
                        <IconLoader2 className="size-3.5 mr-1.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Invitation"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Members Roster Table */}
        <div className="divide-y divide-[#1e1e1e]">
          {members.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No members found for this organization.
            </div>
          ) : (
            members.map((member) => {
              const isOwner = member.role === "owner";
              const initials = (member.name || member.email)
                .substring(0, 2)
                .toUpperCase();

              return (
                <div
                  key={member.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-[#151515] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-8 border border-[#2a2a2a] shrink-0">
                      <AvatarFallback className="bg-[#1c1c1c] text-[11px] font-medium text-neutral-300">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white truncate">
                          {member.name || member.email.split("@")[0]}
                        </span>
                        {isOwner && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded border border-[#333333] bg-[#1a1a1a] text-neutral-300 font-medium">
                            Owner
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate font-mono">
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-[#666666] hidden sm:inline">
                      {member.joinedAt ? "Joined" : "Invited"}{" "}
                      {new Date(member.invitedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>

                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-mono tracking-wider ${
                        isOwner
                          ? "border-neutral-700 bg-neutral-900/60 text-white"
                          : member.role === "admin"
                          ? "border-neutral-700 bg-neutral-900/40 text-neutral-300"
                          : "border-neutral-800 bg-neutral-900/20 text-neutral-400"
                      }`}
                    >
                      {member.role}
                    </Badge>

                    {isOwner ? (
                      <div className="w-7 flex justify-center text-[#444444]" title="Owner cannot be removed">
                        <IconShield className="size-3.5" />
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={removingMemberId === member.id}
                        onClick={() => handleRemoveMember(member.id, member.email)}
                        className="size-7 text-[#777777] hover:text-red-400 hover:bg-red-950/20 transition-colors"
                      >
                        {removingMemberId === member.id ? (
                          <IconLoader2 className="size-3.5 animate-spin" />
                        ) : (
                          <IconTrash className="size-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── 4. Danger Zone ─── */}
      <div className="rounded-lg border border-red-950/40 bg-red-950/10 overflow-hidden">
        <div className="p-5 border-b border-red-950/30 flex items-center gap-3">
          <div className="p-2 rounded-md bg-red-950/30 text-red-400">
            <IconAlertTriangle className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-red-200">Danger Zone</h2>
            <p className="text-xs text-red-300/70">
              Irreversible actions that permanently destroy data
            </p>
          </div>
        </div>

        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-white">Delete this organization</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 max-w-md">
              Permanently removes this organization, all attached projects, backup archives, and verification logs.
              This action cannot be undone.
            </div>
          </div>

          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-9 px-4 text-xs font-medium bg-red-600 hover:bg-red-700 text-white shrink-0"
              >
                Delete Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121212] border-[#2a2a2a] text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base text-red-400 flex items-center gap-2">
                  <IconAlertTriangle className="size-4 text-red-400" />
                  Are you absolutely sure?
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground space-y-2 pt-2">
                  <p>
                    This will permanently delete the organization{" "}
                    <strong className="text-white">{organization.name}</strong> and all associated database backups,
                    schedules, and encryption keys.
                  </p>
                  <p className="text-neutral-400">
                    To confirm, please type{" "}
                    <span className="font-mono text-white select-all bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#333333]">
                      {organization.name}
                    </span>{" "}
                    below:
                  </p>
                </DialogDescription>
              </DialogHeader>

              <div className="py-3">
                <Input
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={organization.name}
                  className="bg-[#181818] border-[#333333] text-white text-sm h-9"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteOpen(false)}
                  className="h-8 px-3 text-xs border-[#333333] text-muted-foreground hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeleting || confirmName !== organization.name}
                  onClick={handleDeleteOrganization}
                  className="h-8 px-3 text-xs font-medium bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <IconLoader2 className="size-3.5 mr-1.5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "I understand, delete organization"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
