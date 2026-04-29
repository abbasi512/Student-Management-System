export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}
