import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAdminForCreator } from "@/lib/whop/dashboard-auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * 3B's identity fields. Avatar is a pasted image URL for this pass — real
 * file upload needs a blob store (e.g. Vercel Blob) wired in, which is a
 * separate, later addition.
 */
export function SaveIdentityForm({
  creatorId,
  defaultName,
  defaultTagline,
  defaultBio,
  defaultAvatarUrl,
}: {
  creatorId: string;
  defaultName: string;
  defaultTagline: string;
  defaultBio: string;
  defaultAvatarUrl: string | null;
}) {
  async function save(formData: FormData) {
    "use server";
    // Server Actions bypass the layout's page-render auth check — a
    // client that already loaded the page could still invoke this
    // directly, so it re-verifies admin access itself.
    await requireAdminForCreator(creatorId, await headers());
    await prisma.creator.update({
      where: { id: creatorId },
      data: {
        name: String(formData.get("name") ?? defaultName).slice(0, 60),
        tagline: String(formData.get("tagline") ?? "").slice(0, 60) || null,
        bio: String(formData.get("bio") ?? "").slice(0, 140) || null,
        avatarUrl: String(formData.get("avatarUrl") ?? "").trim() || null,
      },
    });
  }

  return (
    <form action={save} className="flex flex-col gap-4 rounded-lg border border-hairline bg-white p-5">
      <h2 className="text-[13.5px] font-semibold text-ink-900">Identity</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Name</Label>
          <Input name="name" defaultValue={defaultName} maxLength={60} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Tagline</Label>
          <Input name="tagline" defaultValue={defaultTagline} maxLength={60} placeholder="What you're known for" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Avatar URL</Label>
        <Input name="avatarUrl" defaultValue={defaultAvatarUrl ?? ""} placeholder="https://…" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>
          Bio <span className="text-xs font-normal text-[var(--text-muted)]">140 characters</span>
        </Label>
        <Textarea
          name="bio"
          defaultValue={defaultBio}
          maxLength={140}
          placeholder="Who you help → what makes you different → what you want them to do"
          style={{ minHeight: 64 }}
        />
      </div>
      <Button type="submit" className="self-start text-base">
        Save
      </Button>
    </form>
  );
}
