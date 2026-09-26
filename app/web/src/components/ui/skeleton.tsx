import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-white/[0.06] border border-white/[0.02]", className)}
      {...props}
    />
  )
}

export { Skeleton }
