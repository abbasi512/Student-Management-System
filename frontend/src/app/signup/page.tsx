"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { GraduationCap, Eye, EyeOff, ArrowRight, BookOpen, Users, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
});

const roleOptions = [
  {
    value: "STUDENT",
    label: "Student",
    description: "Enroll in courses, submit assignments, track grades",
    icon: BookOpen,
    color: "border-sky-200 bg-sky-50 text-sky-700",
    active: "border-sky-500 bg-sky-50 ring-2 ring-sky-500",
  },
  {
    value: "TEACHER",
    label: "Teacher",
    description: "Create courses, mark attendance, grade work",
    icon: Users,
    color: "border-violet-200 bg-violet-50 text-violet-700",
    active: "border-violet-500 bg-violet-50 ring-2 ring-violet-500",
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "Manage users, assign teachers, view analytics",
    icon: Shield,
    color: "border-amber-200 bg-amber-50 text-amber-700",
    active: "border-amber-500 bg-amber-50 ring-2 ring-amber-500",
  },
] as const;

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: "STUDENT" },
  });

  const selectedRole = form.watch("role");

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      await signup(values);
      toast.success("Account created successfully");
      router.push("/dashboard");
    } catch {
      toast.error("Could not create account. Email may already be in use.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between bg-linear-to-br from-indigo-600 to-sky-600 p-12 text-white">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">EduManage</span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Join thousands of educators and learners
          </h2>
          <p className="mt-4 text-indigo-100 leading-relaxed">
            Get your dedicated workspace in seconds. Choose your role and
            start managing academics immediately after signup.
          </p>
          <div className="mt-10 space-y-4">
            {["Free to use — no credit card needed", "Role-based dashboard on first login", "Cloudinary-powered profile pictures", "Real-time notifications built in"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-indigo-100">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-indigo-200">
          © {new Date().getFullYear()} EduManage. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-sky-500 to-indigo-600">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">EduManage</span>
        </Link>

        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Fill in your details and choose your role to get started.
            </p>

            <form className="mt-6 space-y-5" onSubmit={onSubmit}>
              {/* Role selector */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">I am a…</label>
                <div className="grid grid-cols-3 gap-3">
                  {roleOptions.map(({ value, label, description, icon: Icon, color, active }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => form.setValue("role", value)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        selectedRole === value ? active : `${color} hover:opacity-80`
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <p className="mt-2 text-xs font-semibold">{label}</p>
                      <p className="mt-0.5 text-[10px] leading-tight opacity-70">{description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Full name</label>
                <Input placeholder="Jane Smith" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-rose-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input type="email" placeholder="you@example.com" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-xs text-rose-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Password</label>
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
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create account <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/signin" className="font-semibold text-sky-600 hover:text-sky-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
