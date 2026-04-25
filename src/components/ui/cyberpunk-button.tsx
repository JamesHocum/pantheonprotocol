import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cyberpunkButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        cyber:
          "bg-gradient-cyberpunk text-primary-foreground shadow-glow-cyber hover:shadow-glow-purple border border-primary/30 neon-text hover:-translate-y-0.5",
        neon:
          "bg-transparent text-primary border border-primary/70 shadow-glow-purple hover:bg-primary/10 hover:shadow-glow-cyan hover:-translate-y-0.5",
        ghost:
          "bg-transparent text-foreground/85 border border-border/40 hover:bg-card/60 hover:border-primary/60 hover:text-foreground",
        tor:
          "bg-secondary/90 text-secondary-foreground border border-secondary shadow-glow-green hover:shadow-glow-cyber",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_0_calc(20px*var(--neon-intensity))_hsl(var(--destructive)/calc(0.5*var(--neon-intensity)))] hover:shadow-[0_0_calc(30px*var(--neon-intensity))_hsl(var(--destructive)/calc(0.7*var(--neon-intensity)))]",
        holo:
          "holo-border bg-[hsl(240_18%_8%/0.7)] text-foreground backdrop-blur-md hover:-translate-y-0.5 hover:bg-[hsl(240_18%_10%/0.85)]",
        launch:
          "bg-transparent text-foreground border border-current/40 hover:-translate-y-0.5 backdrop-blur-sm font-bold tracking-[0.2em] uppercase",
        outlineGlow:
          "bg-transparent text-foreground border border-primary/50 hover:border-primary hover:bg-primary/5 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-9 w-9",
        iconSm: "h-8 w-8",
      },
    },
    defaultVariants: { variant: "cyber", size: "default" },
  }
)

export interface CyberpunkButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof cyberpunkButtonVariants> {
  asChild?: boolean
}

const CyberpunkButton = React.forwardRef<HTMLButtonElement, CyberpunkButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp className={cn(cyberpunkButtonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
CyberpunkButton.displayName = "CyberpunkButton"

export { CyberpunkButton, cyberpunkButtonVariants }
