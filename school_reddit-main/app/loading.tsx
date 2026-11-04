// Показується миттєво при переході між вкладками, поки сторінка завантажується.
export default function Loading() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Завантаження">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-border bg-surface p-4"
        >
          <div className="mb-4 h-3 w-1/3 rounded bg-surfaceRaised" />
          <div className="mb-2 h-3 w-full rounded bg-surfaceRaised" />
          <div className="mb-2 h-3 w-5/6 rounded bg-surfaceRaised" />
          <div className="mt-4 h-32 w-full rounded-xl bg-surfaceRaised" />
        </div>
      ))}
    </div>
  );
}
