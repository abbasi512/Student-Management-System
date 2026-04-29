import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LoadingState } from "@/components/ui/loading-state";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading dashboard..." />}>
      <DashboardShell />
    </Suspense>
  );
}
