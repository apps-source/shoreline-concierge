import Image from 'next/image'
import { experiences } from '../../../data/experiences'
import { getNormalizedExperiences } from '../../../lib/viator/client'
import type { Experience } from '../../../lib/viator/types'
import BookNowButton from '../../../components/BookNowButton'
import BackToResultsButton from '../../../components/BackToResultsButton'

type Props = {
  params: { slug: string }
  searchParams?: { id?: string; productCode?: string; title?: string; destination?: string; returnTo?: string }
}

function decodeSlugToQuery(slug: string) {
  return slug.replace(/-/g, ' ').trim()
}

function asDurationText(value: unknown) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return `${value} min`
  return null
}

export default async function ExperienceDetail({ params, searchParams }: Props){
  const incomingId = (searchParams?.id || '').trim()
  const incomingProductCode = (searchParams?.productCode || '').trim()
  const incomingTitle = (searchParams?.title || '').trim()
  const incomingDestination = (searchParams?.destination || '').trim()
  const returnTo = (searchParams?.returnTo || '').trim() || '/#matches'

  const lookupQuery = incomingProductCode || incomingTitle || incomingDestination || decodeSlugToQuery(params.slug)
  const normalized = await getNormalizedExperiences({ q: lookupQuery, limit: 24 })
  const staticExpRaw = experiences.find(e => e.slug === params.slug)
  const staticExp: Experience | undefined = staticExpRaw
    ? {
        id: staticExpRaw.slug,
        slug: staticExpRaw.slug,
        title: staticExpRaw.title,
        excerpt: staticExpRaw.excerpt,
        destination: staticExpRaw.destination,
        category: staticExpRaw.category,
        price: staticExpRaw.price
      }
    : undefined

  const exp =
    normalized.find(e => incomingProductCode && e.productCode === incomingProductCode) ||
    normalized.find(e => incomingId && e.id === incomingId) ||
    normalized.find(e => e.slug === params.slug) ||
    normalized.find(e => incomingTitle && e.title.toLowerCase() === incomingTitle.toLowerCase()) ||
    staticExp

  if (!exp) {
    return <div>Experience not found</div>
  }

  const imageUrl = exp.imageUrl || exp.image
  const isRemoteImage = typeof imageUrl === 'string' && /^https?:\/\//i.test(imageUrl)
  const duration = asDurationText(exp.duration)
  const hasRating = typeof exp.rating === 'number'
  const hasReviews = typeof exp.reviews === 'number'

  return (
    <article className="space-y-8">
      <div>
        <BackToResultsButton href={returnTo} />
      </div>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-50 via-white to-sand-50 p-6 shadow-lg ring-1 ring-white/70">
        <div className="absolute inset-0 bg-[url('/icons/wave-pattern.svg')] bg-cover opacity-15" aria-hidden="true" />
        <div className="relative grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-start">
          <div className="space-y-4">
            {imageUrl ? (
              <div className="relative h-72 overflow-hidden rounded-2xl ring-1 ring-white/70 shadow-md">
                {isRemoteImage ? (
                  <img
                    src={imageUrl}
                    alt={exp.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Image src={imageUrl} alt={exp.title} fill className="object-cover" sizes="(min-width: 768px) 60vw, 100vw" priority />
                )}
              </div>
            ) : null}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ocean-700 ring-1 ring-white/70">
              Shoreline signature
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">{exp.title}</h1>
            <p className="text-lg text-slate-700 leading-relaxed max-w-2xl">{exp.excerpt || 'Live partner details are available for this experience.'}</p>
          </div>

          <div>
            <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-white/70">
              <div className="text-sm text-slate-500">From</div>
              <div className="text-3xl font-semibold text-slate-900">{exp.price || 'Request pricing'}</div>
              <div className="mt-3 text-sm text-slate-600">Compare the details, then book through the trusted partner listing when you&apos;re ready.</div>

              <div className="mt-4 space-y-2 text-sm text-slate-700">
                {exp.destination ? <div><span className="font-semibold">Destination:</span> {exp.destination}</div> : null}
                {duration ? <div><span className="font-semibold">Duration:</span> {duration}</div> : null}
                {hasRating ? <div><span className="font-semibold">Rating:</span> ★ {exp.rating?.toFixed(1)} {hasReviews ? `(${exp.reviews} reviews)` : ''}</div> : null}
                {exp.category ? <div><span className="font-semibold">Category:</span> {exp.category}</div> : null}
              </div>

              <div className="mt-5 flex flex-col gap-2">
                {exp.providerUrl ? (
                  <BookNowButton href={exp.providerUrl} title={exp.title} productCode={exp.productCode} destination={exp.destination} />
                ) : (
                  <a href="/experiences" className="block w-full rounded-full bg-emerald-900 px-4 py-3 text-center text-white font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">Browse more experiences</a>
                )}
              </div>
              <div className="mt-4 text-xs text-slate-500">Book now uses the partner booking URL when available so attribution stays intact.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-5">
          <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">What to expect</h3>
            <p className="mt-2 text-slate-600 leading-relaxed">
              {exp.excerpt || 'A live partner experience with pricing, timing, and traveler details to help you decide quickly.'}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">What’s included</h3>
            <ul className="mt-3 space-y-2 text-slate-700">
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />Live listing details from trusted partners</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />Ratings, duration, and quick-fit info at a glance</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />Direct partner booking when available</li>
              {duration ? <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />Estimated duration: {duration}</li> : null}
            </ul>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl bg-gradient-to-br from-ocean-50 to-sand-50 p-5 shadow-md ring-1 ring-white/70">
            <h3 className="text-lg font-semibold text-slate-900">Why Shoreline shows this</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">This match fits the destination and vibe from your search, so you can compare fewer options and get to a good one faster.</p>
          </div>
        </div>
      </div>
    </article>
  )
}
