import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-12 w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--foreground-muted)] outline-none transition focus:border-[#f3b203] focus:ring-4 focus:ring-[#f3b203]/10 dark:bg-[color:var(--card-subtle)]",
        className
      )}
      {...props}
    />
  );
}
