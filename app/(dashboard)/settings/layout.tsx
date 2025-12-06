"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Key, Settings, User, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const settingsNav = [
  {
    title: "General",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "API Keys",
    href: "/settings/api-keys",
    icon: Key,
  },
  {
    title: "API Tokens",
    href: "/settings/tokens",
    icon: KeyRound,
  },
  {
    title: "Profile",
    href: "/settings/profile",
    icon: User,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <nav className="flex md:flex-col gap-2 md:w-48 shrink-0">
          {settingsNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/settings" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
