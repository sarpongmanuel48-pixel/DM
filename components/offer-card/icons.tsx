// One icon per Offer type, matching the Offer Card spec (4F). Custom links
// (non-Whop) get their own icon and never carry a type badge or price.
import type { SVGProps } from "react";

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export function MembershipIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Icon>
  );
}

export function CourseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 19.5V5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-1.5zM19 17H6" />
    </Icon>
  );
}

export function CoachingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M8 2v4M16 2v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
    </Icon>
  );
}

export function ConsultingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 3v18h18M7 15l4-5 3.5 3L21 6" />
    </Icon>
  );
}

export function FreeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 3v13M7 11l5 5 5-5M4 21h16" />
    </Icon>
  );
}

export function CustomLinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.8 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.8-1.7" />
    </Icon>
  );
}

export const OFFER_TYPE_ICON = {
  MEMBERSHIP: MembershipIcon,
  COURSE: CourseIcon,
  COACHING: CoachingIcon,
  CONSULTING: ConsultingIcon,
  FREE: FreeIcon,
} as const;
