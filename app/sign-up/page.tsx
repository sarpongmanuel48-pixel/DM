import { AuthForm } from "@/components/auth/AuthForm";

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const { handle } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <AuthForm heading="Create your DM page" initialHandle={typeof handle === "string" ? handle : undefined} />
    </main>
  );
}
