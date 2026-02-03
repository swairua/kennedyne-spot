import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-button hover:shadow-elevation transform hover:scale-105",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-card",
        outline:
          "border border-border bg-card/50 hover:bg-card hover:text-card-foreground backdrop-blur-sm shadow-card",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-card",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-button hover:shadow-elevation transform hover:scale-105 font-semibold",
        white: "bg-white text-primary border border-white/10 hover:bg-white/90 shadow-button transform hover:scale-105 font-semibold",
        purple: "bg-gradient-primary text-white border border-primary/20 hover:shadow-elevation shadow-button transform hover:scale-105 hover:shadow-button font-semibold",
        glass: "bg-card/20 backdrop-blur-md border border-white/10 text-foreground hover:bg-card/30 shadow-glass",
        professional: "bg-background text-foreground border border-border hover:bg-accent hover:text-accent-foreground shadow-card transition-all duration-200",
        gold: "bg-gradient-to-r from-amber-600/80 to-yellow-600/80 text-white border border-amber-400/20 hover:from-amber-600 hover:to-yellow-600 hover:shadow-button shadow-amber-500/15 transform hover:scale-105 font-semibold backdrop-blur-sm",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-md px-4",
        lg: "h-14 rounded-lg px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
