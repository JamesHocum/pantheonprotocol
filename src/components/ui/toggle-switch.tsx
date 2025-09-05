import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const ToggleSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    variant?: "default" | "neon" | "tor"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
    neon: "data-[state=checked]:bg-gradient-cyberpunk data-[state=checked]:shadow-glow-cyber data-[state=unchecked]:bg-muted",
    tor: "data-[state=checked]:bg-secondary data-[state=checked]:shadow-glow-green data-[state=unchecked]:bg-muted"
  }

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
  )
})
ToggleSwitch.displayName = "ToggleSwitch"

export { ToggleSwitch }