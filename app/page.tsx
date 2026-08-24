import { redirect } from "next/navigation";

// No marketing/landing screen exists in the design pass (the 19 screens
// start at sign-up, 4A) — placeholder until one is designed.
export default function RootPage() {
  redirect("/sign-up");
}
