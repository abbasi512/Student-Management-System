"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
  });

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (hydrated && user) {
      router.replace("/dashboard");
    }
  }, [hydrated, router, user]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      console.log("Signing in with:", values);
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
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-500">
          Access your dashboard to manage academics and operations.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input placeholder="Email" {...form.register("email")} />
          <Input type="password" placeholder="Password" {...form.register("password")} />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <Link href="/forgot-password" className="text-sky-600">
            Forgot password?
          </Link>
          <Link href="/signup" className="text-sky-600">
            Create account
          </Link>
        </div>
      </Card>
    </main>
  );
}
