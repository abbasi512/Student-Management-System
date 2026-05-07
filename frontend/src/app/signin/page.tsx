"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { GraduationCap, Eye, EyeOff, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export default function SignInPage() {
  const router = useRouter();
  const { user, login, bootstrap, hydrated } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
  });

  useEffect(() => { bootstrap(); }, [bootstrap]);
  useEffect(() => {
    if (hydrated && user) router.replace("/dashboard");
  }, [hydrated, router, user]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      await login(values);
      toast.success("Signed in successfully");
      router.push("/dashboard");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-linear-to-br from-sky-600 to-indigo-700 p-12 text-white">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">EduManage</span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Welcome back to your academic workspace
          </h2>
          <p className="mt-4 text-sky-100 leading-relaxed">
            Courses, attendance, assignments, grades, and notifications —
            all in one place for students, teachers, and admins.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: "Active Students", value: "∞" },
              { label: "Modules", value: "8" },
              { label: "API Endpoints", value: "25+" },
              { label: "Roles Supported", value: "3" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-bold">{value}</p>
                <p className="mt-1 text-sm text-sky-200">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-sky-200">
          © {new Date().getFullYear()} EduManage. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-12">
        {/* Mobile brand */}
        <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-sky-500 to-indigo-600">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">EduManage</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Enter your credentials to access your dashboard.
            </p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-rose-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-sky-600 hover:text-sky-700">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-rose-500">{form.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-sky-600 hover:text-sky-700">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
