import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8.5 w-full min-w-0 rounded-md border border-[#262626] bg-[#080808] px-3 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 transition-colors outline-none focus:outline-none focus:border-[#555555] focus:ring-0 focus-visible:outline-none focus-visible:border-[#555555] focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
