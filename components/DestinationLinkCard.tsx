import Link from 'next/link'

type DestinationLinkCardProps = {
  href: string
  name: string
  subtitle?: string
  badge?: string
  imageSrc?: string
}

export default function DestinationLinkCard({ href, name, subtitle, badge = 'Explore destination', imageSrc }: DestinationLinkCardProps) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-white via-sand-50 to-ocean-50/40 p-[1px] shadow-md transition hover:-translate-y-1 hover:shadow-xl"
      aria-label={`Browse experiences for ${name}`}
    >
      <div className="relative h-full overflow-hidden rounded-[15px] bg-white/95 ring-1 ring-white/70 dark:bg-slate-900/80 dark:ring-white/10">
        <div className="relative h-40 overflow-hidden">
          {imageSrc ? (
            <div
              className="pointer-events-none absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url('${imageSrc}')` }}
              aria-hidden="true"
            />
          ) : (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ocean-200 via-sand-100 to-emerald-100" aria-hidden="true" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-900/15 to-white/10" aria-hidden="true" />
          <div className="pointer-events-none absolute left-4 top-4">
            <span className="inline-flex items-center rounded-full bg-slate-950/55 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur">
              {badge}
            </span>
          </div>
        </div>
        <div className="relative space-y-3 p-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{name}</h3>
            {subtitle ? <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{subtitle}</p> : null}
          </div>
          <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Browse experiences →</div>
        </div>
      </div>
    </Link>
  )
}
