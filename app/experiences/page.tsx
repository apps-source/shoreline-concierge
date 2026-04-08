import ExperienceCard from '../../components/ExperienceCard'
import ExperienceFilters from '../../components/ExperienceFilters'
import { getNormalizedExperiences } from '../../lib/viator/client'

type Props = { searchParams?: { category?: string; destination?: string; destinationName?: string; q?: string } }
type Experience = {
  category?: string
  destination?: string
  [key: string]: any
}

export default async function ExperiencesPage({ searchParams }: Props) {
  const category = searchParams?.category
  const destination = searchParams?.destination
  const destinationName = searchParams?.destinationName
  const q = searchParams?.q || destinationName || destination

  let items: Experience[] = []
  const hasSearchContext = Boolean(destinationName || searchParams?.q)
  const fetchArgs = {
    q: q || undefined,
    category: category || undefined,
    limit: 24,
    ...(hasSearchContext ? {} : { destination: destination || undefined })
  }

  try {
    items = await getNormalizedExperiences(fetchArgs)
  } catch (err) {
    // Fallback to server-side mock function (still server-only)
    console.warn('API route failed, falling back to mock data:', err)
    items = await getNormalizedExperiences(q ? { q, category, limit: 24 } : {})
    if (category) items = items.filter(i => (i.category || '').toLowerCase() === category.toLowerCase())
    if (destination) items = items.filter(i => (i.destination || '').toLowerCase() === destination.toLowerCase())
  }

  // Derive available filters from the dataset
  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[]
  const destinations = Array.from(new Set(items.map((i) => i.destination).filter(Boolean))) as string[]

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-emerald-800">Experiences</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {destinationName ? destinationName : 'Browse experiences'}
          </h1>
          <p className="text-slate-600">
            {destinationName
              ? 'Live, bookable experiences pulled from trusted partner inventory.'
              : 'Browse the catalog, or use filters to narrow by destination and type.'}
          </p>
        </div>
        <div className="text-sm text-ocean-700 font-medium">
          {items.length} live {items.length === 1 ? 'experience' : 'experiences'}
        </div>
      </div>

      <div className="mb-8">
        {/* Filters are client-side for interactivity */}
        <ExperienceFilters
          categories={categories}
          destinations={destinations}
          selectedCategory={category}
          selectedDestination={destination}
          selectedDestinationName={destinationName}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((e: any) => (
          <ExperienceCard
            key={e.slug}
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
          />
        ))}
      </div>
    </section>
  )
}
