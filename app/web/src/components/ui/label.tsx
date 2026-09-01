import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-xs font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50"
)

function Label({
  className,
  ...props
}: React.ComponentProps<"label"> & VariantProps<typeof labelVariants>) {
  return (
    <label
      data-slot="label"
      className={cn(labelVariants(), className)}
      {...props}
    />
  )
}

export { Label }
