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
import { useOwnedEditions, type Language } from "@/lib/pro";
import { useActiveLanguage } from "@/lib/language";
import { UpgradePanel } from "@/components/UpgradePanel";
import {
  Bell,
  Languages,
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
      description="Your profile and how you sign in to DailyCard."
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

const EDITION_LABEL: Record<Language, string> = {
  en: "English 🇬🇧",
  de: "Deutsch 🇩🇪",
};

function PlanSection({ user }: { user: CurrentUser | undefined }) {
  const owned = useOwnedEditions();
  const { language, setLanguage, canSwitch } = useActiveLanguage();

  return (
    <Section title="Editions" description="The DailyCard editions you own.">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {owned.length === 0 ? (
                <Badge variant="secondary">Free preview</Badge>
              ) : (
                owned.map((l) => (
                  <Badge key={l} variant="default">
                    {EDITION_LABEL[l]}
                  </Badge>
                ))
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {owned.length === 0
                ? "Preview only — unlock an edition to play every deck."
                : user?.proSince
                  ? `Lifetime access since ${new Date(user.proSince).toLocaleDateString(undefined, { dateStyle: "medium" })}`
                  : "Lifetime access."}
            </p>
          </div>
        </div>

        {/* Active language picker — only when both editions are owned. */}
        {canSwitch && (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Languages className="h-4 w-4 text-muted-foreground" />
              Show decks in
            </div>
            <div className="inline-flex rounded-full border border-border bg-muted/40 p-1">
              {(["en", "de"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  aria-pressed={language === l}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                    language === l
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {EDITION_LABEL[l]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buy / add an edition (renders nothing once both are owned). */}
        <UpgradePanel />
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
