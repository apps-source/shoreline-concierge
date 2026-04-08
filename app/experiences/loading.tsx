export default function LoadingExperiencesPage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3">
        <div className="h-4 w-28 animate-pulse rounded-full bg-emerald-100" />
        <div className="h-10 w-80 max-w-full animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-5 w-[32rem] max-w-full animate-pulse rounded-2xl bg-slate-100" />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-100">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-100">
            <div className="h-48 animate-pulse bg-slate-100" />
            <div className="space-y-3 p-5">
              <div className="h-6 w-4/5 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-4 w-full animate-pulse rounded-xl bg-slate-100" />
              <div className="h-4 w-2/3 animate-pulse rounded-xl bg-slate-100" />
              <div className="flex justify-between pt-2">
                <div className="h-4 w-28 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-4 w-14 animate-pulse rounded-xl bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
