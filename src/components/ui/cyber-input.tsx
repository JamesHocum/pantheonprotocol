import * as React from "react"
import { cn } from "@/lib/utils"

export interface CyberInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "neon" | "terminal"
}

const CyberInput = React.forwardRef<HTMLInputElement, CyberInputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-input border-2 border-border text-foreground focus:border-primary focus:shadow-glow-purple",
      neon: "bg-transparent border-2 border-primary text-primary placeholder:text-primary/60 focus:shadow-glow-cyber neon-text",
      terminal: "bg-card/50 border border-card-border text-secondary font-mono focus:border-secondary focus:shadow-glow-green"
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md px-3 py-1 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
CyberInput.displayName = "CyberInput"

export { CyberInput }