export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
            Student Management System
          </span>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
            One platform for students, teachers, and admins.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            Manage enrollment, attendance, assignments, grades, notifications, and
            analytics from a modern full-stack application powered by Next.js,
            Express, Prisma, and PostgreSQL.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/signin"
              className="rounded-2xl bg-sky-600 px-6 py-3 font-semibold text-white"
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-900"
            >
              Create account
            </a>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "JWT authentication with role-based access",
            "Student dashboard with report card downloads",
            "Teacher workflow for attendance and grading",
            "Admin analytics, users, and course assignment",
          ].map((item) => (
            <div key={item} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-base font-semibold text-slate-900">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
