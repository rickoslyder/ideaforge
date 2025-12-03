"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { SyncStatus } from "@/components/sync/sync-status";

interface NavHeaderProps {
  onMenuClick?: () => void;
}

export function NavHeader({ onMenuClick }: NavHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <SyncStatus />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
