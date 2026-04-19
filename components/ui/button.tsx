import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-[color:var(--accent)] text-slate-950 shadow-[var(--shadow-soft)] hover:-translate-y-0.5",
        destructive: "bg-rose-500 text-white hover:bg-rose-600",
        outline:
          "border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] shadow-[var(--shadow-soft)] hover:-translate-y-0.5",
        secondary: "bg-[color:var(--card-subtle)] text-[color:var(--foreground)] hover:bg-[color:var(--card)]",
        ghost: "text-[color:var(--foreground)] hover:bg-[color:var(--card)]",
        link: "text-[color:var(--foreground)] underline-offset-4 hover:underline"
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-full px-4",
        lg: "h-12 rounded-full px-7",
        icon: "h-11 w-11 rounded-2xl"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
