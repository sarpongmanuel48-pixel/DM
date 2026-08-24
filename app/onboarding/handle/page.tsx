import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isReservedHandle, isValidHandleFormat } from "@/lib/reserved-handles";
import { StepHeader } from "@/components/onboarding/StepHeader";
import { HandleField } from "@/components/onboarding/HandleField";
import { formatPrice } from "@/lib/pricing";

const TYPE_LABEL: Record<string, string> = {
  MEMBERSHIP: "Membership",
  COURSE: "Course",
  COACHING: "Coaching",
  CONSULTING: "Consulting",
  FREE: "Free",
};

// 2C — Step 4: pick the featured offer, claim the handle.
export default async function ClaimHandlePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const creator = await prisma.creator.findUnique({
    where: { userId: session.user.id },
    include: { offers: { orderBy: { sortOrder: "asc" } } },
  });
  if (!creator) redirect("/onboarding/connect");

  async function claimHandle(formData: FormData) {
    "use server";
    const handle = String(formData.get("handle") ?? "").toLowerCase();
    const featuredOfferId = String(formData.get("featuredOfferId") ?? "");

    if (!isValidHandleFormat(handle) || isReservedHandle(handle)) {
      redirect("/onboarding/handle?error=invalid_handle");
    }

    await prisma.creator.update({
      where: { userId: session!.user!.id! },
      data: { handle, featuredOfferId: featuredOfferId || null, publishedAt: new Date() },
    });
    redirect("/onboarding/done");
  }

  return (
    <main className="min-h-screen bg-canvas">
      <StepHeader current={4} />
      <form action={claimHandle} className="flex flex-col gap-6.5 px-10 py-9" style={{ maxWidth: 860, margin: "0 auto" }}>
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[26px] font-bold tracking-tight text-ink-900">
            Choose your start-here offer
          </h1>
          <p className="text-[14.5px] text-ink-700">
            It sits at the top of your page, larger than everything else. You can change it any time.
          </p>
        </div>

        <fieldset className="grid grid-cols-3 gap-3">
          {creator.offers.map((offer) => (
            <label
              key={offer.id}
              className="group relative flex cursor-pointer flex-col gap-2.5 rounded-lg border-2 bg-white p-3.5 has-[:checked]:border-[var(--action-primary)]"
              style={{ borderColor: "var(--hairline)" }}
            >
              <input
                type="radio"
                name="featuredOfferId"
                value={offer.id}
                defaultChecked={offer.id === creator.featuredOfferId}
                className="peer absolute inset-0 m-0 cursor-pointer opacity-0"
              />
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-semibold uppercase tracking-widest text-ink-500">
                  {TYPE_LABEL[offer.type] ?? offer.type}
                </span>
                <span
                  className="flex items-center justify-center rounded-full border text-white peer-checked:border-0"
                  style={{ width: 18, height: 18, borderColor: "var(--hairline-strong)" }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="hidden group-has-[:checked]:block"
                    style={{ background: "var(--action-primary)", borderRadius: "50%" }}
                  >
                    <path d="M5 12.5l5 5L19 7" />
                  </svg>
                </span>
              </div>
              <div className="text-[14.5px] font-semibold leading-tight text-ink-900">{offer.name}</div>
              <div className="font-mono text-xs text-ink-700">{formatPrice(offer.priceCents, offer.priceUnit)}</div>
            </label>
          ))}
        </fieldset>

        <div className="flex items-start gap-6.5 border-t border-hairline pt-5.5">
          <div className="flex-1">
            <HandleField name="handle" defaultValue={creator.publishedAt ? creator.handle : ""} />
          </div>
          <div className="flex flex-none flex-col items-end gap-2.5 pt-6.5">
            <button type="submit" className="qbx-btn qbx-btn--lg qbx-btn--primary">
              Publish my page
            </button>
            <span className="text-xs text-ink-400">{creator.offers.length} offers</span>
          </div>
        </div>
      </form>
    </main>
  );
}
