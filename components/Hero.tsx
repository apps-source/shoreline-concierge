import Link from 'next/link'

export default function Hero(){
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-50 via-white to-sand-50 p-6 md:p-12 shadow-lg ring-1 ring-white/60">
      <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-gradient-to-br from-amber-200/60 to-ocean-100 blur-3xl" aria-hidden="true" />
      <div className="absolute -left-6 bottom-0 h-48 w-48 rounded-full bg-gradient-to-tr from-emerald-100/70 to-white blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
        <div className="md:w-3/5 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-ocean-700 shadow-sm ring-1 ring-white/70">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Coastal travel, held for you
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight text-slate-900">
            The coast, booked beautifully.
          </h1>
          <p className="text-lg text-slate-700 max-w-2xl leading-relaxed">
            From sunset cruises and fishing charters to standout dinners and unforgettable stays, Shoreline Concierge helps you book the part of the trip that actually matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/experiences" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 px-6 py-3 text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
              Explore Experiences
              <span aria-hidden className="text-sm">→</span>
            </Link>
            <Link href="/concierge" className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-900/20 bg-white/80 px-6 py-3 text-emerald-900 transition hover:-translate-y-0.5 hover:shadow-md">
              Plan My Trip
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-sm ring-1 ring-white/70">
              <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" /> Private captains & vessels
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-sm ring-1 ring-white/70">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" /> Easy holds, human updates
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-sm ring-1 ring-white/70">
              <span className="h-2 w-2 rounded-full bg-ocean-200" aria-hidden="true" /> Hidden coves, local-only stops
            </div>
          </div>
        </div>

        <div className="md:w-2/5">
          <div className="relative overflow-hidden rounded-3xl bg-white/80 p-5 shadow-xl ring-1 ring-white/70 backdrop-blur">
            <div className="absolute inset-0 bg-[url('/icons/wave-pattern.svg')] bg-cover opacity-20" aria-hidden="true" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                <span>Signature escape</span>
                <span>Concierge held</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-semibold text-slate-900">Golden Hour Catamaran</div>
                <p className="text-sm text-slate-600">Champagne on ice, a private chef on board, and a captain who knows the quiet coves.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-sand-50 p-3 shadow-inner">
                  <div className="text-slate-500">Duration</div>
                  <div className="font-semibold text-slate-900">3.5 hours</div>
                </div>
                <div className="rounded-2xl bg-ocean-50 p-3 shadow-inner">
                  <div className="text-slate-500">Guests</div>
                  <div className="font-semibold text-slate-900">Up to 8</div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-emerald-900 px-4 py-3 text-white shadow-lg">
                <div>
                  <div className="text-sm text-emerald-100">From</div>
                  <div className="text-lg font-semibold">$420</div>
                </div>
                <div className="text-sm font-medium">Hold my date →</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
