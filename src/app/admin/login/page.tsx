import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Background } from "@/components/effects/background";
import { monogram } from "@/data/site";
import { getAdmin } from "@/server/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <>
      <Background />
      <main className="relative z-10 grid min-h-svh place-items-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="bg-brand grid size-14 place-items-center rounded-2xl font-display text-xl font-semibold text-white shadow-lg dark:text-[#070a12]">
              {monogram}
            </span>
            <h1 className="mt-5 font-display text-3xl font-medium tracking-tight">Portfolio admin</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to edit the website content.
            </p>
          </div>
          <div className="glass rounded-3xl p-6 sm:p-8">
            <LoginForm />
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/" className="underline-offset-4 hover:text-foreground hover:underline">
              ← Back to the website
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
