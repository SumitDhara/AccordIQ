"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { LoaderCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { authService } from "@/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await authService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });

      router.replace("/dashboard");
      router.refresh();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ??
          error?.message ??
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white">
            <UserPlus className="h-5 w-5" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Start working with AccordIQ.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-background p-6 shadow-sm"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              First name

              <input
                value={firstName}
                onChange={(event) =>
                  setFirstName(event.target.value)
                }
                required
                autoComplete="given-name"
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
              />
            </label>

            <label className="block text-sm font-medium">
              Last name

              <input
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
                autoComplete="family-name"
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
              />
            </label>
          </div>

          <label className="mt-5 block text-sm font-medium">
            Email

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
            />
          </label>

          <label className="mt-5 block text-sm font-medium">
            Password

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}