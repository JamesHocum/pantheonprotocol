import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cyberpunkButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        cyber: "bg-gradient-cyberpunk text-primary-foreground shadow-glow-cyber hover:shadow-glow-purple border-2 border-primary/30 neon-text",
        neon: "bg-transparent text-primary border-2 border-primary shadow-glow-purple hover:bg-primary/10 hover:shadow-glow-green neon-text",
        ghost: "bg-transparent text-foreground border border-border/50 hover:bg-card/50 hover:border-primary/50",
        tor: "bg-secondary text-secondary-foreground border-2 border-secondary shadow-glow-green hover:shadow-glow-cyber",
        destructive: "bg-destructive text-destructive-foreground shadow-[0_0_20px_hsl(var(--destructive)/0.5)] hover:shadow-[0_0_30px_hsl(var(--destructive)/0.8)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "cyber",
      size: "default",
    },
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
      <Comp
        className={cn(cyberpunkButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
CyberpunkButton.displayName = "CyberpunkButton"

export { CyberpunkButton, cyberpunkButtonVariants }