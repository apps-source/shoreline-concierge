import type { Metadata } from 'next'
import Link from 'next/link'
import ExperienceCard from '../../components/ExperienceCard'
import { cruisePortGroups } from '../../data/cruisePorts'
import { homeDestinationGroups } from '../../data/homeDestinations'
import { getNormalizedExperiences } from '../../lib/viator/client'

type Props = {
  searchParams?: {
    category?: string
    destination?: string
    destinationName?: string
    q?: string
    location?: string
  }
}

type Experience = {
  category?: string
  destination?: string
  [key: string]: any
}

export const metadata: Metadata = {
  title: 'Browse Beach Experiences',
  description: 'Browse beach activities, destination picks, cruise excursions, and trusted partner bookings in one place.'
}

const INITIAL_RESULT_LIMIT = 12

const CATEGORY_LABELS: Record<string, string> = {
  'cruise-excursions': 'Cruise Excursions'
}

const TRUST_POINTS = [
  'Trusted booking partners and live beach-trip inventory in one place',
  'Helpful for couples, families, groups, birthday trips, and cruise travelers',
  'A simpler way to browse without digging through scattered listings across multiple tabs'
]

function formatLocationLabel(value?: string) {
  if (!value) return ''
  return decodeURIComponent(value)
    .split(',')
    .map((segment) =>
      segment
        .trim()
        .split(/[-\s]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    )
    .join(', ')
}

function getCategoryDisplayLabel(category?: string) {
  if (!category) return ''
  if (CATEGORY_LABELS[category]) return CATEGORY_LABELS[category]
  return category
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function normalizeText(value?: string) {
  return (value || '').trim().toLowerCase()
}

function inferTripTheme(query?: string, category?: string) {
  const haystack = `${normalizeText(query)} ${normalizeText(category)}`

  if (!haystack) return null
  if (haystack.includes('cruise')) return 'cruise'
  if (haystack.includes('family') || haystack.includes('kids') || haystack.includes('kid-friendly')) return 'family'
  if (haystack.includes('romantic') || haystack.includes('couple') || haystack.includes('honeymoon')) return 'romantic'
  if (haystack.includes('birthday')) return 'birthday'
  if (haystack.includes('girls trip') || haystack.includes('bachelorette')) return 'girls-trip'
  if (haystack.includes('guys trip') || haystack.includes('dad') || haystack.includes('men')) return 'guys-trip'
  if (haystack.includes('fishing')) return 'fishing'
  if (haystack.includes('jet ski') || haystack.includes('jetski') || haystack.includes('waverunner')) return 'jet-ski'
  if (haystack.includes('charter') || haystack.includes('boat')) return 'boating'
  return null
}

function buildPageHeading(params: { locationName?: string; category?: string; q?: string }) {
  const { locationName, category, q } = params
  const categoryLabel = getCategoryDisplayLabel(category)
  const theme = inferTripTheme(q, category)

  if (category === 'cruise-excursions' && locationName) return `Cruise Excursions in ${locationName}`
  if (theme === 'family' && locationName) return `Family-Friendly Things to Do in ${locationName}`
  if (theme === 'romantic' && locationName) return `Romantic Beach Experiences in ${locationName}`
  if (theme === 'birthday' && locationName) return `Birthday Trip Ideas in ${locationName}`
  if (theme === 'girls-trip' && locationName) return `Fun Girls Trip Activities in ${locationName}`
  if (theme === 'guys-trip' && locationName) return `Easy Beach Trip Plans in ${locationName}`
  if (theme === 'fishing' && locationName) return `Fishing Charters in ${locationName}`
  if (theme === 'jet-ski' && locationName) return `Jet Ski Rentals in ${locationName}`
  if (theme === 'boating' && locationName) return `Boat Tours and Charters in ${locationName}`
  if (categoryLabel && locationName) return `${categoryLabel} in ${locationName}`
  if (locationName) return `Things to Do in ${locationName}`
  if (category === 'cruise-excursions') return 'Cruise Excursions'
  if (categoryLabel) return `${categoryLabel} Experiences`
  return 'Browse Beach Experiences'
}

function buildSupportingCopy(params: { locationName?: string; category?: string; q?: string }) {
  const { locationName, category, q } = params
  const theme = inferTripTheme(q, category)

  if (category === 'cruise-excursions' && locationName) {
    return `Cruise excursions in ${locationName} for travelers who want easy port-day options, beach clubs, snorkeling trips, and simple shore plans that fit the ship schedule.`
  }

  if (locationName && theme === 'family') {
    return `Family-friendly activities in ${locationName} for beach trips that need easygoing outings, boat days, and bookable experiences that work for kids and mixed-age groups.`
  }

  if (locationName && theme === 'birthday') {
    return `Planning a birthday in ${locationName}? Start with beach activities, waterfront outings, and easy bookable experiences that make the trip feel fun without overcomplicating the plan.`
  }

  if (locationName && theme === 'girls-trip') {
    return `Use this ${locationName} lineup to browse boat days, waterfront experiences, and high-energy beach-trip options that work well for a girls getaway.`
  }

  if (locationName && theme === 'guys-trip') {
    return `These ${locationName} picks make beach-trip planning easier, with boat options, laid-back activities, and trusted partner bookings that work well for dads, friends, and group weekends.`
  }

  if (locationName && theme === 'fishing') {
    return `Start with fishing charters and on-the-water experiences around ${locationName}, then branch into nearby beach activities if you want more options for the same trip.`
  }

  if (locationName && theme === 'jet-ski') {
    return `Browse jet ski rentals, waverunner-style experiences, and other beach-trip water activities near ${locationName} from trusted booking partners.`
  }

  if (locationName && theme === 'boating') {
    return `Explore boat tours, charters, rentals, and other on-the-water experiences around ${locationName} in one place, with live partner inventory and simple click-through booking.`
  }

  if (locationName) {
    return `Things to do in ${locationName} for a beach getaway, from boat days and sightseeing to family outings and trusted partner bookings.`
  }

  return 'Browse beach activities, boat tours, excursion ideas, and trusted partner listings in one place so planning your next trip feels simpler.'
}

function buildEyebrow(params: { locationName?: string; category?: string; q?: string }) {
  const { locationName, category, q } = params
  const theme = inferTripTheme(q, category)

  if (category === 'cruise-excursions') return 'Cruise Day Planning'
  if (theme === 'family') return 'Family Beach Trip'
  if (theme === 'birthday') return 'Birthday Weekend Ideas'
  if (theme === 'girls-trip') return 'Girls Getaway Picks'
  if (theme === 'guys-trip') return 'Group Beach Plans'
  if (theme === 'fishing') return 'On-the-Water Picks'
  if (theme === 'jet-ski') return 'Water Sports'
  if (theme === 'boating') return 'Boat Day Planning'
  if (locationName) return 'Beach Trip Planning'
  return 'Beach Experiences'
}

function buildFilterSummary(params: { locationName?: string; category?: string; q?: string }) {
  const { locationName, category, q } = params
  const theme = inferTripTheme(q, category)

  if (category === 'cruise-excursions' && locationName) {
    return `Showing cruise excursion-style experiences for ${locationName}.`
  }

  if (locationName && theme === 'family') return `Showing beach activities for families in ${locationName}.`
  if (locationName && theme === 'birthday') return `Showing birthday-friendly beach activities in ${locationName}.`
  if (locationName && theme === 'girls-trip') return `Showing fun beach-trip experiences for a girls trip in ${locationName}.`
  if (locationName && theme === 'guys-trip') return `Showing relaxed beach-trip activities in ${locationName}.`
  if (locationName && theme === 'fishing') return `Showing fishing-forward experiences for ${locationName}.`
  if (locationName && theme === 'jet-ski') return `Showing jet ski and water-sports-style experiences for ${locationName}.`
  if (locationName && theme === 'boating') return `Showing boat-focused experiences for ${locationName}.`
  if (locationName) return `Showing beach-trip experiences for ${locationName}.`
  if (category === 'cruise-excursions') return 'Showing cruise excursion-style experiences.'
  return 'Showing live beach-trip experiences from trusted partners.'
}

function buildClearFiltersHref(locationName?: string) {
  return '/experiences'
}

function buildFallbackLinks(category?: string) {
  if (category === 'cruise-excursions') {
    return cruisePortGroups[0]?.items.slice(0, 6) ?? []
  }

  return [
    ...(homeDestinationGroups[0]?.items.slice(0, 4) ?? []),
    ...(cruisePortGroups[0]?.items.slice(0, 2) ?? [])
  ]
}

function buildRelatedLinks(params: { locationName?: string; category?: string }) {
  const { locationName, category } = params
  const popularBeachDestinations = homeDestinationGroups[0]?.items.slice(0, 4) ?? []
  const cruiseLinks = cruisePortGroups[0]?.items.slice(0, 4) ?? []

  return [
    { label: 'Cruise Excursions', href: '/cruise-excursions' },
    { label: 'Popular Beach Destinations', href: '/#top-places' },
    { label: 'Contact', href: '/contact' },
    ...(category === 'cruise-excursions' ? cruiseLinks : popularBeachDestinations)
      .filter((item) => item.name !== locationName)
      .slice(0, 3)
      .map((item) => ({ label: item.name, href: item.href }))
  ]
}

function buildActiveFilterPills(params: { locationName?: string; category?: string; q?: string }) {
  const pills: string[] = []
  const theme = inferTripTheme(params.q, params.category)

  if (params.locationName) pills.push(params.locationName)
  if (params.category === 'cruise-excursions') pills.push('Cruise excursions')
  else if (params.category) pills.push(getCategoryDisplayLabel(params.category))

  if (theme === 'family') pills.push('Family-friendly')
  if (theme === 'birthday') pills.push('Birthday trip')
  if (theme === 'girls-trip') pills.push('Girls trip')
  if (theme === 'guys-trip') pills.push('Group getaway')
  if (theme === 'fishing') pills.push('Fishing')
  if (theme === 'jet-ski') pills.push('Jet ski')
  if (theme === 'boating') pills.push('Boat day')

  return Array.from(new Set(pills)).slice(0, 4)
}

function buildResultsLabel(params: { locationName?: string; category?: string; q?: string }) {
  const { locationName, category, q } = params
  const theme = inferTripTheme(q, category)

  if (category === 'cruise-excursions' && locationName) return `Popular shore-day picks in ${locationName}`
  if (theme === 'family' && locationName) return `Best family beach activities in ${locationName}`
  if (theme === 'fishing' && locationName) return `Fishing and water access near ${locationName}`
  if (theme === 'jet-ski' && locationName) return `Jet ski and water-sports options in ${locationName}`
  if (theme === 'boating' && locationName) return `Boat days and on-the-water experiences in ${locationName}`
  if (locationName) return `Popular things to do in ${locationName}`
  return 'Live beach-trip experiences'
}

function getExperienceRenderKey(experience: Experience, index: number) {
  return `${experience.productCode || experience.id || experience.slug || experience.title || 'experience'}-${index}`
}

export default async function ExperiencesPage({ searchParams }: Props) {
  const category = searchParams?.category
  const destination = searchParams?.destination
  const destinationName = searchParams?.destinationName
  const location = searchParams?.location
  const locationName = formatLocationLabel(location)
  const thematicCategory = category === 'cruise-excursions' ? category : undefined
  const effectiveDestinationName = destinationName || locationName
  const manualQuery = searchParams?.q?.trim() || ''
  const shouldUseDirectDestination = Boolean(destination && !manualQuery)
  const q = manualQuery || (!shouldUseDirectDestination ? effectiveDestinationName || destination : '')
  const searchQuery = thematicCategory && locationName && !shouldUseDirectDestination ? `${locationName} cruise excursions shore excursions` : q
  const providerCategory = thematicCategory ? undefined : category

  let items: Experience[] = []
  const hasSearchContext = Boolean(effectiveDestinationName || searchParams?.q || locationName)
  const fetchArgs = {
    q: shouldUseDirectDestination ? undefined : searchQuery || undefined,
    category: providerCategory || undefined,
    limit: INITIAL_RESULT_LIMIT,
    ...((shouldUseDirectDestination || !hasSearchContext) ? { destination: destination || undefined } : {})
  }

  try {
    items = await getNormalizedExperiences(fetchArgs)
  } catch (err) {
    console.warn('API route failed, falling back to mock data:', err)
    items = await getNormalizedExperiences(
      shouldUseDirectDestination
        ? { destination, category: providerCategory, limit: INITIAL_RESULT_LIMIT }
        : searchQuery
          ? { q: searchQuery, category: providerCategory, limit: INITIAL_RESULT_LIMIT }
          : {}
    )
    if (providerCategory) items = items.filter((i) => (i.category || '').toLowerCase() === providerCategory.toLowerCase())
    if (destination) items = items.filter((i) => (i.destination || '').toLowerCase() === destination.toLowerCase())
  }

  const contextParams = {
    locationName: effectiveDestinationName,
    category: thematicCategory || category,
    q: searchParams?.q
  }

  const pageTitle = buildPageHeading(contextParams)
  const pageDescription = buildSupportingCopy(contextParams)
  const eyebrow = buildEyebrow(contextParams)
  const filterSummary = buildFilterSummary(contextParams)
  const clearFiltersHref = buildClearFiltersHref(locationName)
  const fallbackLinks = buildFallbackLinks(thematicCategory || category)
  const relatedLinks = buildRelatedLinks({ locationName: effectiveDestinationName, category: thematicCategory || category })
  const activeFilterPills = buildActiveFilterPills(contextParams)
  const resultsLabel = buildResultsLabel(contextParams)
  const currentSearchParams = new URLSearchParams()

  if (category) currentSearchParams.set('category', category)
  if (destination) currentSearchParams.set('destination', destination)
  if (destinationName) currentSearchParams.set('destinationName', destinationName)
  if (searchParams?.q) currentSearchParams.set('q', searchParams.q)
  if (location) currentSearchParams.set('location', location)

  const returnTo = `/experiences${currentSearchParams.toString() ? `?${currentSearchParams.toString()}` : ''}`

  return (
    <section className="space-y-10">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.12),_transparent_26%),linear-gradient(140deg,_rgba(8,47,73,0.94),_rgba(4,20,31,1)_58%,_rgba(2,12,27,1)_100%)] p-6 shadow-[0_32px_90px_rgba(2,12,27,0.34)] sm:p-10 lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),_transparent_30%)]" aria-hidden="true" />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-200">{eyebrow}</p>
            <h1 className="mt-4 text-[2.75rem] font-semibold tracking-tight leading-[1.02] text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">{pageTitle}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-ocean-50/82 sm:text-lg sm:leading-8">{pageDescription}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 px-5 py-5 shadow-inner shadow-black/10 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">Live results</div>
            <div className="mt-2 text-3xl font-semibold text-white">{items.length}</div>
            <div className="text-sm text-ocean-100/72">{items.length === 1 ? 'bookable experience' : 'bookable experiences'}</div>
          </div>
        </div>

        {activeFilterPills.length ? (
          <div className="mt-7 flex flex-wrap gap-2">
            {activeFilterPills.map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/8 px-3 py-2 text-sm font-medium text-emerald-50"
              >
                {pill}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-ocean-950/35 px-5 py-4 text-sm font-medium text-ocean-50/88 shadow-inner shadow-black/10 backdrop-blur">
          {filterSummary}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={clearFiltersHref}
            className="inline-flex items-center rounded-full bg-teal-500 px-5 py-3 text-sm font-semibold text-ocean-950 shadow-lg shadow-teal-500/20 transition hover:-translate-y-0.5 hover:bg-teal-400"
          >
            Clear filters
          </Link>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            New search
          </Link>
        </div>
      </section>

      {items.length ? (
        <section className="space-y-6">
          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] px-5 py-5 shadow-[0_16px_60px_rgba(2,12,27,0.2)] sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Available now</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{resultsLabel}</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-ocean-100/72">
                Review live partner listings, compare what fits your beach trip best, and click through only when something feels right.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((e: any, index: number) => (
              <ExperienceCard
                key={getExperienceRenderKey(e, index)}
                id={e.id}
                productCode={e.productCode}
                slug={e.slug}
                title={e.title}
                excerpt={e.excerpt}
                price={e.price}
                image={e.image}
                imageUrl={e.imageUrl}
                destination={e.destination}
                duration={e.duration}
                rating={e.rating}
                reviewsCount={e.review_count ?? e.reviews_count}
                returnTo={returnTo}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,_rgba(255,255,255,0.05),_rgba(15,23,42,0.22))] p-8 shadow-[0_24px_80px_rgba(2,12,27,0.3)] sm:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">No live matches yet</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Nothing matched this beach trip setup just yet</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-ocean-100/75">
            Availability can vary by destination, dates, and partner inventory. If this page feels too narrow, try clearing filters or browsing a nearby
            beach destination for a broader set of bookable experiences.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={clearFiltersHref}
              className="inline-flex items-center rounded-full bg-teal-500 px-5 py-3 text-sm font-semibold text-ocean-950 transition hover:-translate-y-0.5 hover:bg-teal-400"
            >
              Clear filters
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Start a new search
            </Link>
          </div>
          <div className="mt-10 rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-6 shadow-inner shadow-black/10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Try one of these instead</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {fallbackLinks.map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-ocean-50 transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,_rgba(15,23,42,0.5),_rgba(8,47,73,0.35))] p-8 shadow-[0_24px_80px_rgba(2,12,27,0.28)] sm:p-10">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Why Shoreline Concierge</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">A calmer way to plan a beach trip</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-ocean-100/75">
          Shoreline is built to make beach trip planning feel easier, with live partner inventory, helpful context, and fewer scattered tabs between you and a good plan.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div key={point} className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5 shadow-inner shadow-black/10">
              <p className="text-sm leading-6 text-ocean-50/82">{point}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-8 text-white shadow-[0_24px_80px_rgba(2,12,27,0.24)] sm:p-10">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Keep Exploring</p>
        <h2 className="mt-2 text-3xl font-semibold">Related links</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-ocean-100/72">
          Browse another beach destination, jump back to cruise excursions, or start over with a new search if this page helped narrow the trip down.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {relatedLinks.map((link) => (
            <Link
              key={`${link.label}-${link.href}`}
              href={link.href}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:-translate-y-0.5 hover:bg-white/12"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </section>
  )
}
