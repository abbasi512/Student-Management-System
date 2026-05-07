"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GraduationCap, KeyRound, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const resetSchema = z.object({
  token: z.string().min(8, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      await api.post("/auth/reset-password", values);
      setDone(true);
      toast.success("Password reset successfully");
    } catch {
      toast.error("Invalid or expired token");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12">
      <Link href="/" className="mb-10 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-sky-500 to-indigo-600">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-slate-900">EduManage</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {done ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-900">Password updated!</h1>
              <p className="mt-2 text-sm text-slate-500">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <Button className="mt-6 w-full" onClick={() => router.push("/signin")}>
                Go to sign in
              </Button>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
                <KeyRound className="h-6 w-6 text-indigo-600" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-900">Reset password</h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Paste the reset token from the previous step and enter your new password.
              </p>

              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Reset token</label>
                  <Input
                    placeholder="Paste your reset token here"
                    {...form.register("token")}
                  />
                  {form.formState.errors.token && (
                    <p className="text-xs text-rose-500">{form.formState.errors.token.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">New password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
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
                      Updating...
                    </span>
                  ) : "Reset password"}
                </Button>
              </form>
            </>
          )}
        </div>

        {!done && (
          <div className="mt-5 flex justify-center gap-4 text-sm">
            <Link href="/forgot-password" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700">
              <ArrowLeft className="h-3.5 w-3.5" /> Get a token
            </Link>
            <span className="text-slate-300">·</span>
            <Link href="/signin" className="text-slate-500 hover:text-slate-700">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
