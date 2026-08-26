import { getCreatorByExternalId } from "@/lib/connectors/registry";
import { requireCompanyAdmin } from "@/lib/whop/dashboard-auth";
import { SELF_SERVE_SIGNUP_SUPPORTED } from "@/lib/self-serve-signup";

export { SELF_SERVE_SIGNUP_SUPPORTED };

/**
 * What surface is DM currently running in, and what does that imply is
 * actually possible right now? Exists so a question like "can this page
 * offer self-serve signup" is an explicit, checkable fact instead of
 * tribal knowledge — see CLAUDE.md for the mistake this is meant to
 * prevent (the marketing landing page originally shipped with CTAs built
 * for a signup flow phase 1 doesn't have).
 */
export interface HostContext {
  surface: "standalone" | "whop-embedded";
  resolveIdentity(): Promise<{ creatorId: string } | null>;
  supportsSelfServeSignup: boolean;
}

/** Builds the HostContext for a request known to be inside the Whop
 * dashboard iframe — `companyId` from the /dashboard/[companyId] route
 * segment, `requestHeaders` for the x-whop-user-token verification that
 * `resolveIdentity` performs. Wraps lib/whop/dashboard-auth.ts's existing
 * verification rather than replacing it. */
export function getWhopEmbeddedHostContext(companyId: string, requestHeaders: Headers): HostContext {
  return {
    surface: "whop-embedded",
    supportsSelfServeSignup: SELF_SERVE_SIGNUP_SUPPORTED,
    async resolveIdentity() {
      try {
        await requireCompanyAdmin(companyId, requestHeaders);
      } catch {
        return null;
      }
      const creator = await getCreatorByExternalId("whop", companyId);
      return creator ? { creatorId: creator.id } : null;
    },
  };
}
