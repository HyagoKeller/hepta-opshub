import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-bold uppercase tracking-wide ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-2 border-foreground bg-foreground text-background shadow-brutal-sm hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        destructive:
          "border-2 border-foreground bg-destructive text-destructive-foreground shadow-brutal-sm hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        outline:
          "border-2 border-foreground bg-background text-foreground shadow-brutal-sm hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal hover:bg-accent active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        secondary:
          "border-2 border-foreground bg-secondary text-secondary-foreground shadow-brutal-sm hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
        hero:
          "border-2 border-foreground bg-accent text-accent-foreground shadow-brutal hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-brutal-lg active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        primary:
          "border-2 border-foreground bg-primary text-primary-foreground shadow-brutal hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-brutal-lg active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        outlineLight:
          "border-2 border-background bg-transparent text-background hover:bg-background hover:text-foreground",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
