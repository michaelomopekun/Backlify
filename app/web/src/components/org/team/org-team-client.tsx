"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconSearch,
  IconUserPlus,
  IconBook,
  IconSparkles,
  IconTrash,
  IconCheck,
  IconX,
  IconLoader2,
  IconShield,
  IconUsers,
  IconChevronDown,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UpgradeDialog } from "@/components/shared/upgrade-dialog";
import { useLocalizedPricing } from "@/hooks/use-localized-pricing";

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

export interface OrgTeamClientProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    userId: string;
    plan?: string;
    billingProvider?: string | null;
    subscriptionEndsAt?: string | Date | null;
  };
  initialMembers: OrgMember[];
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
}

export function OrgTeamClient({
  organization,
  initialMembers,
  currentUser,
}: OrgTeamClientProps) {
  const [members, setMembers] = useState<OrgMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [isInviting, setIsInviting] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const { priceFormatted, priceWithPeriod } = useLocalizedPricing();
  const isPro = organization.plan === "pro";

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      (member.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (member.name?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "all" || member.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  // Handle member invite
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Please enter a valid email address");
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

  // Handle member removal
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

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* ─── Header ─── */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Team</h1>
          <p className="text-sm text-[#888888]">
            Manage team members and invitations
          </p>
        </div>

        {/* ─── Controls Bar (Supabase style) ─── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            {/* Search Filter */}
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#777777]" />
              <Input
                placeholder="Filter members"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-3 bg-[#121212] border-[#222222] text-sm text-white placeholder:text-[#666666] focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-md"
              />
            </div>

            {/* Role / MFA Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-9 w-[130px] bg-[#121212] border-[#222222] text-xs text-[#cccccc] rounded-md">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent className="bg-[#141414] border-[#242424] text-white">
                <SelectItem value="all" className="text-xs">All roles</SelectItem>
                <SelectItem value="owner" className="text-xs">Owner</SelectItem>
                <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                <SelectItem value="member" className="text-xs">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 px-3.5 text-xs bg-[#141414] border-[#262626] text-[#cccccc] hover:text-white hover:bg-[#1a1a1a] rounded-md transition-colors"
            >
              <Link href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer">
                <IconBook className="size-4 mr-1.5 text-[#888888]" />
                Docs
              </Link>
            </Button> */}

            <Button
              type="button"
              size="sm"
              onClick={() => setIsInviteOpen(true)}
              className="h-9 px-3.5 text-xs font-medium bg-[#FFB31F] hover:bg-[#d7a218] text-[#0a0a0a] border border-[#27ae60]/40 shadow-xs rounded-md transition-all flex items-center gap-1.5"
            >
              <IconUserPlus className="size-4" />
              <span>Invite members</span>
              {!isPro && (
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-yellow-500/20 text-yellow-300 font-semibold border border-yellow-500/30 ml-0.5">
                  Pro
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* ─── Members Table (Supabase Table Visual) ─── */}
        <div className="border border-[#222222] bg-[#111111] rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-5 py-3 border-b border-[#222222] bg-[#161616] text-[11px] font-semibold tracking-wider text-[#888888] uppercase select-none">
            <div className="col-span-6 sm:col-span-5">MEMBER</div>
            <div className="col-span-2 text-center sm:text-left">MFA</div>
            <div className="col-span-3 sm:col-span-3">ROLE</div>
            <div className="col-span-1 sm:col-span-2 text-right"></div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#1e1e1e]">
            {filteredMembers.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <IconUsers className="size-8 mx-auto text-[#555555] mb-2" />
                <p className="text-sm font-medium text-[#cccccc]">No members found</p>
                <p className="text-xs text-[#777777] mt-0.5">
                  Try adjusting your search query or filter.
                </p>
              </div>
            ) : (
              filteredMembers.map((member) => {
                const isCurrent =
                  member.userId === currentUser.id ||
                  member.email.toLowerCase() === currentUser.email.toLowerCase();
                const isOwner = member.role.toLowerCase() === "owner";
                const displayName = member.name || member.email;
                const initials = (member.name || member.email || "U")
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={member.id}
                    className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-[#141414] transition-colors"
                  >
                    {/* Member Info */}
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                      <Avatar className="size-7 shrink-0 border border-[#2a2a2a] bg-[#1c1c1c]">
                        <AvatarFallback className="text-[11px] text-neutral-300 font-medium bg-[#1a1a1a]">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        <span className="text-xs text-[#dddddd] truncate font-normal">
                          {member.email}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#333333] bg-[#1f1f1f] text-[#888888] font-medium shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>

                    {/* MFA Column */}
                    <div className="col-span-2 flex items-center justify-center sm:justify-start">
                      <span className="text-xs text-[#666666] font-mono">✕</span>
                    </div>

                    {/* Role Column */}
                    <div className="col-span-3 sm:col-span-3">
                      <span className="text-xs text-[#dddddd] capitalize">
                        {member.role === "owner"
                          ? "Owner"
                          : member.role === "admin"
                          ? "Administrator"
                          : "Member"}
                      </span>
                    </div>

                    {/* Action Column */}
                    <div className="col-span-1 sm:col-span-2 flex items-center justify-end">
                      {isOwner ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                disabled
                                variant="outline"
                                size="sm"
                                className="h-7 px-2.5 text-[11px] bg-[#1a1a1a] border-[#282828] text-[#555555] opacity-60 cursor-not-allowed"
                              >
                                Leave team
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="left"
                            className="bg-[#1f1f1f] border-[#333333] text-white text-[11px] px-2.5 py-1"
                          >
                            An organization requires at least 1 owner
                          </TooltipContent>
                        </Tooltip>
                      ) : isCurrent ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id, member.email)}
                          disabled={removingMemberId === member.id}
                          className="h-7 px-2.5 text-[11px] bg-[#1a1a1a] border-[#2c2c2c] text-[#cccccc] hover:text-white hover:bg-[#222222]"
                        >
                          {removingMemberId === member.id ? (
                            <IconLoader2 className="size-3 animate-spin mr-1" />
                          ) : null}
                          Leave team
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id, member.email)}
                          disabled={removingMemberId === member.id}
                          className="h-7 px-2 text-[11px] text-[#777777] hover:text-red-400 hover:bg-red-500/10"
                        >
                          {removingMemberId === member.id ? (
                            <IconLoader2 className="size-3 animate-spin" />
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

          {/* Table Footer */}
          <div className="px-5 py-3 border-t border-[#222222] bg-[#141414] text-xs text-[#777777]">
            {filteredMembers.length} {filteredMembers.length === 1 ? "member" : "members"}
          </div>
        </div>

        {/* ─── Invite Modal Dialog ─── */}
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogContent className="bg-[#121212] border-[#252525] text-white max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="text-base text-white">Invite Team Member</DialogTitle>
                {!isPro && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    PRO FEATURE
                  </span>
                )}
              </div>
              <DialogDescription className="text-xs text-[#888888]">
                {!isPro
                  ? "Team collaboration and role-based access control (RBAC) are exclusively available on the Pro plan."
                  : `Send an invitation to join ${organization.name}. They will receive access based on their assigned role.`}
              </DialogDescription>
            </DialogHeader>

            {!isPro ? (
              <div className="space-y-4 py-3">
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <IconSparkles className="size-4 text-amber-400 shrink-0" />
                    <span>Free Plan is Limited to 1 Seat (Solo Owner)</span>
                  </div>
                  <p className="text-[#aaaaaa] text-[11.5px] leading-relaxed">
                    Upgrade to Backlify Pro for <strong>{priceWithPeriod}</strong> to invite unlimited engineers, assign Admin/Member roles, and collaborate seamlessly.
                  </p>
                </div>

                <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteOpen(false)}
                    className="h-8.5 px-3 text-xs border-[#333333] text-[#aaaaaa] hover:text-white"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsInviteOpen(false);
                      setIsUpgradeOpen(true);
                    }}
                    className="h-8.5 px-4 text-xs font-semibold bg-amber-500 text-black hover:bg-amber-400 gap-1.5 transition-colors"
                  >
                    <IconSparkles className="size-3.5" />
                    Upgrade to Pro ({priceFormatted})
                  </Button>
                </DialogFooter>
              </div>
            ) : (
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
                  <Label htmlFor="invite-role" className="text-xs text-[#aaaaaa]">
                    Role
                  </Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger id="invite-role" className="bg-[#181818] border-[#2c2c2c] text-white text-sm h-9">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#181818] border-[#2c2c2c] text-white">
                      <SelectItem value="admin">
                        <div className="py-0.5">
                          <div className="font-medium text-xs">Administrator</div>
                          {/* <div className="text-[11px] text-[#888888]">Full management access to all projects, restores, and keys</div> */}
                        </div>
                      </SelectItem>
                      <SelectItem value="member">
                        <div className="py-0.5">
                          <div className="font-medium text-xs">Member</div>
                          {/* <div className="text-[11px] text-[#888888]">Can view projects and trigger manual backups</div> */}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter className="pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteOpen(false)}
                    className="h-8.5 px-3 text-xs border-[#333333] text-[#aaaaaa] hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isInviting}
                    className="h-8.5 px-4 text-xs font-medium bg-[#FFB31F] hover:bg-[#d7a218] text-[#0a0a0a]"
                  >
                    {isInviting ? (
                      <>
                        <IconLoader2 className="size-3.5 animate-spin mr-1.5" />
                        Inviting...
                      </>
                    ) : (
                      "Send Invitation"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* ─── Upgrade Dialog Modal ─── */}
        <UpgradeDialog
          open={isUpgradeOpen}
          onOpenChange={setIsUpgradeOpen}
          orgId={organization.id}
        />
      </div>
    </TooltipProvider>
  );
}
