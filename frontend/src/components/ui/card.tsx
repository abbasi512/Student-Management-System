import { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
