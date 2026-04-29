"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
});

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: "STUDENT",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      await signup(values);
      toast.success("Account created");
      router.push("/dashboard");
    } catch {
      toast.error("Could not create account");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">
          Register as a student, teacher, or admin.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input placeholder="Full name" {...form.register("name")} />
          <Input placeholder="Email" {...form.register("email")} />
          <Input type="password" placeholder="Password" {...form.register("password")} />
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
            {...form.register("role")}
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/signin" className="text-sky-600">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
