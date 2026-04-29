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

const resetSchema = z.object({
  token: z.string().min(8),
  password: z.string().min(8),
});

export default function ResetPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      await api.post("/auth/reset-password", values);
      toast.success("Password reset successfully");
      form.reset();
    } catch {
      toast.error("Could not reset password");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
        <p className="mt-2 text-sm text-slate-500">
          Use the reset token from the forgot password screen.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input placeholder="Reset token" {...form.register("token")} />
          <Input type="password" placeholder="New password" {...form.register("password")} />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Updating..." : "Reset password"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Back to{" "}
          <Link href="/signin" className="text-sky-600">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
