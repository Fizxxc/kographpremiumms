import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--foreground-muted)] outline-none transition focus:border-[#f3b203] focus:ring-4 focus:ring-[#f3b203]/10 dark:bg-[color:var(--card-subtle)]",
        className
      )}
      {...props}
    />
  );
}
