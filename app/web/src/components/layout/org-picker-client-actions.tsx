"use client";

import { IconHelp, IconSearch, IconBulb } from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Props {
  userInitials: string;
}

export function OrgPickerClientActions({ userInitials }: Props) {
  const triggerModal = (modal: "search" | "help" | "feedback") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("backlify:open-modal", { detail: modal }));
    }
  };

  return (
    <div className="flex items-center gap-2.5">
      {/* Desktop-only action items */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Feedback */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => triggerModal("feedback")}
          className="text-muted-foreground hover:text-foreground text-xs h-7 px-2"
        >
          Feedback
        </Button>

        {/* Search chip */}
        <button
          type="button"
          onClick={() => triggerModal("search")}
          className="flex items-center gap-2 h-7 px-2.5 rounded-md border border-border/80 bg-muted/30 text-xs text-muted-foreground hover:border-border hover:bg-muted/60 transition-colors"
        >
          <IconSearch className="size-3.5 text-muted-foreground" />
          <span>Search...</span>
          <kbd className="ml-1 text-[10px] text-muted-foreground/80 border border-border rounded px-1 font-mono">
            Ctrl K
          </kbd>
        </button>

        {/* Help icon */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => triggerModal("help")}
          className="size-7 text-muted-foreground hover:text-foreground"
        >
          <IconHelp className="size-3.5" />
        </Button>

        {/* Bulb icon */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => triggerModal("feedback")}
          className="size-7 text-muted-foreground hover:text-foreground"
        >
          <IconBulb className="size-3.5" />
        </Button>
      </div>

      {/* User profile picture - always visible */}
      <Avatar className="size-7 cursor-pointer">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
          {userInitials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
