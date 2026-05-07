"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { GraduationCap, Mail, Copy, CheckCircle, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const forgotSchema = z.object({ email: z.email("Enter a valid email") });

export default function ForgotPasswordPage() {
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      const response = await api.post<{ token?: string }>("/auth/forgot-password", values);
      setToken(response.data.token || null);
      toast.success("Reset token generated");
    } catch {
      toast.error("No account found with that email");
    } finally {
      setSubmitting(false);
    }
  });

  const copyToken = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
            <Mail className="h-6 w-6 text-sky-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Forgot password?</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Enter your email and we&apos;ll generate a reset token for you.
          </p>

          {!token ? (
            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email address</label>
                <Input type="email" placeholder="you@example.com" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-xs text-rose-500">{form.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating...
                  </span>
                ) : "Generate reset token"}
              </Button>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <p className="text-sm font-medium">Reset token generated</p>
                </div>
                <p className="mt-3 text-xs text-slate-500">Copy this token and use it on the reset page. It expires in 30 minutes.</p>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2">
                  <code className="flex-1 truncate text-xs font-mono text-slate-700">{token}</code>
                  <button
                    type="button"
                    onClick={copyToken}
                    className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Link href="/reset-password">
                <Button className="w-full">Continue to reset password</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/signin"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
