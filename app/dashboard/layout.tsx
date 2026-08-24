import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const creator = await prisma.creator.findUnique({ where: { userId: session.user.id } });
  if (!creator) redirect("/onboarding/connect");
  if (!creator.publishedAt) redirect("/onboarding/handle");

  const initials = creator.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "var(--canvas)" }}>
      <DashboardHeader connectionStatus={creator.whopConnectionStatus} initials={initials} />
      <main className="mx-auto max-w-5xl px-6 py-7">{children}</main>
    </div>
  );
}
