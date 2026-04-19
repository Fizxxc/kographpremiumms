"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "danger" | "destructive";
  label?: string;
  showIcon?: boolean;
};

export function LogoutButton({ className, variant = "outline", label = "Logout", showIcon = false }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <Button variant={variant} onClick={handleLogout} className={cn(className)}>
      {showIcon ? <LogOut className="mr-2 h-4 w-4" /> : null}
      {label}
    </Button>
  );
}
