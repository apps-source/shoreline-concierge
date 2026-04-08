import Link from 'next/link'

type Props = { slug: string; name: string; subtitle?: string }

export default function DestinationCard({ slug, name, subtitle }: Props) {
  return (
    <Link
      href={`/destinations/${slug}`}
      className="relative block overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-sand-50 p-[1px] shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-full rounded-[28px] bg-white/92 p-5 ring-1 ring-white/70">
        <div className="absolute inset-0 bg-[url('/icons/wave-pattern.svg')] bg-cover opacity-10" aria-hidden="true" />
        <div className="relative space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-ocean-50 px-3 py-1 text-xs font-semibold text-ocean-700 ring-1 ring-white/80">
            Salt air pick
          </div>
          <div>
            <div className="text-xl font-semibold text-slate-900">{name}</div>
            <div className="text-sm text-slate-600 mt-1 leading-relaxed">{subtitle ?? 'Coastal charm and curated experiences'}</div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-sand-50 px-3 py-1 font-medium text-amber-700 ring-1 ring-white/80">Sea-to-table stops</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-ocean-50 px-3 py-1 font-medium text-ocean-700 ring-1 ring-white/80">Hidden coves</span>
          </div>
          <div className="text-ocean-700 font-semibold">See details →</div>
        </div>
      </div>
    </Link>
  )
}
