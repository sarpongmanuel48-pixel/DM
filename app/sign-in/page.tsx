import { AuthForm } from "@/components/auth/AuthForm";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <AuthForm heading="Sign in to DM" />
    </main>
  );
}
