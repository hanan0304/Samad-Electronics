import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getSession().catch(() => null);
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-darker p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand text-xl font-bold text-white">
            S
          </span>
          <h1 className="mt-3 text-xl font-extrabold text-brand-dark">
            {siteConfig.name} Admin
          </h1>
          <p className="text-sm text-muted">Sign in to manage your store</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
