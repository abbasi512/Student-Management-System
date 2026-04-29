"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const forgotSchema = z.object({
  email: z.email(),
});

export default function ForgotPasswordPage() {
  const [token, setToken] = useState<string | null>(null);
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
      toast.error("Could not generate reset token");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-500">
          Generate a reset token for your account.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input placeholder="Email" {...form.register("email")} />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Generating..." : "Generate token"}
          </Button>
        </form>
        {token ? (
          <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            Reset token: <span className="font-semibold">{token}</span>
          </div>
        ) : null}
        <p className="mt-4 text-sm text-slate-500">
          Ready to reset?{" "}
          <Link href="/reset-password" className="text-sky-600">
            Go to reset form
          </Link>
        </p>
      </Card>
    </main>
  );
}
