import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StepHeader } from "@/components/onboarding/StepHeader";
import { ImportStream } from "@/components/onboarding/ImportStream";

// 2B — Step 3: products stream in live as ImportStream consumes
// /api/whop/import-stream (SSE), then redirects to 2C on completion.
export default async function ImportingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const creator = await prisma.creator.findUnique({ where: { userId: session.user.id } });
  if (!creator) redirect("/onboarding/connect");

  return (
    <main className="min-h-screen bg-canvas">
      <StepHeader current={3} />
      <div className="flex justify-center px-6 py-10">
        <div className="flex w-full max-w-[600px] flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[26px] font-bold tracking-tight text-ink-900">
              Pulling in your products
            </h1>
            <p className="text-[14.5px] text-ink-700">
              This takes a few seconds. Your page is being built as they arrive.
            </p>
          </div>
          <ImportStream />
        </div>
      </div>
    </main>
  );
}
