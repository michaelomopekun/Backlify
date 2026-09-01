import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-[#262626] bg-[#080808] px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 transition-colors outline-none focus:outline-none focus:border-[#555555] focus:ring-0 focus-visible:outline-none focus-visible:border-[#555555] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
