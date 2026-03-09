import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  CalendarDays,
  LogOut,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  const user = useQuery(api.users.currentUser);
  const { signOut } = useAuthActions();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-600" />
            <span className="text-xl font-bold tracking-tight">DailyCard</span>
          </Link>

          {user && (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
                <AvatarFallback>
                  {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void signOut()}
                className="h-8 w-8"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      {user && (
        <nav className="sticky bottom-0 z-50 border-t bg-white/80 backdrop-blur-md dark:bg-slate-950/80 md:hidden">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-around px-4">
            <NavLink to="/" icon={<Home className="h-5 w-5" />} label="Home" />
            <NavLink
              to="/calendar"
              icon={<CalendarDays className="h-5 w-5" />}
              label="Calendar"
            />
          </div>
        </nav>
      )}
    </div>
  );
}

function NavLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1 text-muted-foreground transition-colors [&.active]:text-violet-600"
      activeProps={{ className: "active text-violet-600" }}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  );
}
