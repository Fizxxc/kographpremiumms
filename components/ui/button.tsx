import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "link" | "danger" | "destructive";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "border border-[#f4c73f] bg-[linear-gradient(135deg,#ffd95c_0%,#f3b203_100%)] text-slate-950 shadow-[0_18px_36px_-24px_rgba(243,178,3,0.72)] hover:-translate-y-0.5",
  secondary:
    "border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:-translate-y-0.5 hover:bg-[color:var(--card-strong)]",
  outline:
    "border border-[color:var(--border)] bg-transparent text-[color:var(--foreground)] hover:bg-[color:var(--card)]",
  ghost: "border border-transparent bg-transparent text-[color:var(--foreground)] hover:bg-[color:var(--card)]",
  link: "border-0 bg-transparent px-0 text-[color:var(--foreground)] underline-offset-4 hover:underline",
  danger: "border border-rose-500/30 bg-rose-500 text-white hover:bg-rose-600",
  destructive: "border border-rose-500/30 bg-rose-500 text-white hover:bg-rose-600"
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-5 py-2",
  sm: "h-9 px-4 text-sm",
  lg: "h-12 px-7 text-base",
  icon: "h-11 w-11 p-0"
};

export const buttonVariants = ({
  variant = "default",
  size = "default",
  className = ""
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) =>
  cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
    return <button ref={ref} type={type} className={buttonVariants({ variant, size, className })} {...props} />;
  }
);

Button.displayName = "Button";

export { Button };
