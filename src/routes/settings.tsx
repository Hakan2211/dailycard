import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import type { ReactNode } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { PRO_GATING_ENABLED } from "@/lib/pro";
import {
  Bell,
  LogOut,
  Mail,
  Moon,
  Smartphone,
  Sparkles,
  Sun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const user = useQuery(api.users.currentUser);

  return (
    <SidebarLayout title="Settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account, appearance, plan, and notifications.
          </p>
        </div>

        <AccountSection user={user} />
        <AppearanceSection />
        <PlanSection user={user} />
        <NotificationsSection />
      </div>
    </SidebarLayout>
  );
}

// ------------------------------------------------------------------
// Section shell
// ------------------------------------------------------------------

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

// ------------------------------------------------------------------
// Account
// ------------------------------------------------------------------

type CurrentUser = Doc<"users"> | null;

function AccountSection({ user }: { user: CurrentUser | undefined }) {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  return (
    <Section
      title="Account"
      description="Your profile is managed through your Google account."
    >
      <div className="flex items-center gap-4">
        {user === undefined ? (
          <>
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </>
        ) : (
          <>
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={user?.image ?? undefined}
                alt={user?.name ?? "User"}
              />
              <AvatarFallback>
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{user?.name ?? "User"}</p>
              <p className="truncate text-sm text-muted-foreground">
                {user?.email ?? "No email on file"}
              </p>
            </div>
          </>
        )}
        <Button
          variant="outline"
          className="shrink-0 gap-2"
          onClick={() => void handleSignOut()}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </Section>
  );
}

// ------------------------------------------------------------------
// Appearance (theme)
// ------------------------------------------------------------------

const THEME_OPTIONS: { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
];

function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <Section title="Appearance" description="Choose how DailyCard looks.">
      <div className="grid grid-cols-2 gap-2">
        {THEME_OPTIONS.map((option) => {
          const active = theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-pressed={active}
              className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors ${
                active
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <option.icon className="h-5 w-5" />
              {option.label}
            </button>
          );
        })}
      </div>
    </Section>
  );
}

// ------------------------------------------------------------------
// Plan
// ------------------------------------------------------------------

function PlanSection({ user }: { user: CurrentUser | undefined }) {
  const isPro = !!user?.isPro;

  return (
    <Section
      title="Plan"
      description={
        PRO_GATING_ENABLED
          ? "Your current DailyCard plan."
          : "Every feature is currently unlocked for everyone while Pro is in preview."
      }
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {isPro ? "DailyCard Pro" : "Free plan"}
              </span>
              <Badge variant={isPro ? "default" : "secondary"}>
                {isPro ? "Pro" : "Free"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {isPro && user?.proSince
                ? `Pro since ${new Date(user.proSince).toLocaleDateString(undefined, { dateStyle: "medium" })}`
                : "3D reveal, Studio, scheduling, and every topic."}
            </p>
          </div>
        </div>

        {!isPro && (
          <Button
            className="shrink-0 gap-2"
            onClick={() => alert("Billing is coming soon!")}
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to Pro
          </Button>
        )}
      </div>
    </Section>
  );
}

// ------------------------------------------------------------------
// Notifications
// ------------------------------------------------------------------

function NotificationsSection() {
  return (
    <Section
      title="Notifications"
      description="How you're reminded about scheduled shares."
    >
      <div className="divide-y">
        <PrefRow
          icon={Bell}
          title="In-app reminders"
          description="When a scheduled share is due, it's highlighted on the Scheduled page and badged in the sidebar."
        >
          <Badge variant="secondary">On</Badge>
        </PrefRow>

        <PrefRow
          icon={Mail}
          title="Email reminders"
          description="Get an email when a scheduled share is ready to post."
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline">Soon</Badge>
            <Switch disabled aria-label="Email reminders (coming soon)" />
          </div>
        </PrefRow>

        <PrefRow
          icon={Smartphone}
          title="Push notifications"
          description="Get a push notification on this device when a share is due."
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline">Soon</Badge>
            <Switch disabled aria-label="Push notifications (coming soon)" />
          </div>
        </PrefRow>
      </div>
    </Section>
  );
}

function PrefRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
