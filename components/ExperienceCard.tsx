import Link from 'next/link'
import Image from 'next/image'

type ExperienceCardProps = {
  id?: string
  productCode?: string
  slug: string
  title: string
  excerpt: string
  price?: string
  image?: string | null
  imageUrl?: string | null
  destination?: string | null
  duration?: string | number | null
  rating?: number | null
  reviewsCount?: number | null
  returnTo?: string | null
}

export default function ExperienceCard({
  id,
  productCode,
  slug,
  title,
  excerpt,
  price,
  image,
  imageUrl,
  destination,
  duration,
  rating,
  reviewsCount,
  returnTo
}: ExperienceCardProps) {
  const displayPrice = price ?? 'Request'
  const hasReviews = typeof rating === 'number'
  const displayDuration = typeof duration === 'string' || typeof duration === 'number' ? duration : null
  const visual = imageUrl || image
  const isRemoteVisual = typeof visual === 'string' && /^https?:\/\//i.test(visual)
  const safeSlug =
    (slug || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') ||
    `experience-${encodeURIComponent(productCode || id || title)}`
  const destinationLabel = destination
    ? destination
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Partner listing'
  const detailHref = `/experiences/${safeSlug}?id=${encodeURIComponent(id || '')}&productCode=${encodeURIComponent(productCode || '')}&title=${encodeURIComponent(title)}&destination=${encodeURIComponent(destination || '')}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,_rgba(8,47,73,0.34),_rgba(2,12,27,0.92))] shadow-[0_20px_60px_rgba(2,12,27,0.26)] transition hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(2,12,27,0.34)]">
      <Link href={detailHref} className="block h-full">
        <div className="relative h-48 overflow-hidden">
          {visual ? (
            <>
              {isRemoteVisual ? (
                <img
                  src={visual}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Image
                  src={visual}
                  alt={title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" aria-hidden="true" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[url('/icons/wave-pattern.svg')] bg-cover opacity-30" aria-hidden="true" />
              <div className="absolute inset-0 bg-gradient-to-br from-ocean-900 via-ocean-800 to-slate-950" />
            </>
          )}
          <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-teal-700 shadow-sm ring-1 ring-white/60">
            <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
            {destinationLabel}
          </div>
          {displayDuration && (
            <div className="absolute bottom-3 right-3 rounded-full bg-slate-950/65 px-3 py-1 text-xs text-white backdrop-blur">
              {displayDuration}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold leading-snug text-white">{title}</h3>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
              {displayPrice}
            </span>
          </div>
          <p className="line-clamp-3 text-sm leading-relaxed text-ocean-50/78">{excerpt}</p>

          <div className="flex items-center justify-between pt-2 text-sm text-ocean-50/78">
            <div className="text-xs font-medium text-ocean-100/78">Trusted partner</div>
            <div className="flex items-center gap-1 font-medium text-amber-400">
              {hasReviews ? (
                <>
                  <span>★ {rating?.toFixed(1)}</span>
                  {reviewsCount ? <span className="text-xs text-ocean-100/55">({reviewsCount})</span> : null}
                </>
              ) : (
                  <span>Reserve</span>
              )}
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-300 via-teal-300 to-emerald-300 opacity-0 transition duration-300 group-hover:opacity-100" aria-hidden="true" />
      </Link>
    </article>
  )
}
