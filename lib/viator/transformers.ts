import { RawViatorProduct, RawViatorApiResponse, Experience } from './types'
function makeSlug(input: string) {
  return (input || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeImageUrl(url?: string): string | undefined {
  if (!url || typeof url !== 'string') return undefined
  const trimmed = url.trim()
  if (!trimmed) return undefined
  if (trimmed.startsWith('//')) return `https:${trimmed}`
  return trimmed
}

function pickImageUrl(image: any): string | undefined {
  if (!image) return undefined
  if (typeof image === 'string') return normalizeImageUrl(image)
  if (typeof image?.url === 'string') return normalizeImageUrl(image.url)
  if (typeof image?.link === 'string') return normalizeImageUrl(image.link)
  if (Array.isArray(image?.variants) && image.variants.length) {
    const variants = image.variants
      .filter((v: any) => typeof v?.url === 'string')
      .sort((a: any, b: any) => (b?.width || 0) - (a?.width || 0))
    return normalizeImageUrl(variants[0]?.url)
  }
  return undefined
}

function pickDurationInfo(duration: any): { text?: string; minutes?: number } {
  if (!duration) return {}
  if (typeof duration === 'string') return { text: duration }
  if (typeof duration === 'number') return { text: `${duration} min`, minutes: duration }
  const fixed = duration?.fixedDurationInMinutes
  if (typeof fixed === 'number') {
    if (fixed >= 60) {
      const hours = Math.floor(fixed / 60)
      const mins = fixed % 60
      return { text: mins ? `${hours}h ${mins}m` : `${hours}h`, minutes: fixed }
    }
    return { text: `${fixed} min`, minutes: fixed }
  }
  return {}
}

function pickRatingAndReviews(raw: any): { rating?: number; reviews?: number } {
  const rating = raw?.Rating ?? raw?.rating ?? raw?.reviews?.combinedAverageRating
  const reviews = raw?.Reviews ?? raw?.reviews ?? raw?.reviews?.totalReviews
  return {
    rating: typeof rating === 'number' ? rating : undefined,
    reviews: typeof reviews === 'number' ? reviews : undefined
  }
}

/**
 * Map a raw provider product into the app's normalized Experience shape.
 * Keep mapping rules centralized so swapping provider sources is easy.
 */
export function transformRawToExperience(r: RawViatorProduct): Experience {
  // Be tolerant of alternative field casing/naming in sandbox responses
  const title = (r as any).Title ?? (r as any).title ?? 'Untitled Experience'
  const summary = (r as any).Summary ?? (r as any).summary ?? (r as any).description ?? ''
  const priceObj = (r as any).Price ?? (r as any).price
  const amount = priceObj?.Amount ?? priceObj?.amount
  const currency = priceObj?.Currency ?? priceObj?.currency
  const displayPrice = priceObj?.DisplayPrice ?? priceObj?.displayPrice
  const price = displayPrice ?? (amount ? `${amount}` : undefined)

  const images = (r as any).Images ?? (r as any).images
  const primaryImage = images && images.length > 0 ? images[0] : undefined
  const image = pickImageUrl(primaryImage)
  const imageUrl = image
  const destination = (r as any).Destination ?? (r as any).destination
  const category = (r as any).Category ?? (r as any).category
  const durationRaw = (r as any).Duration ?? (r as any).duration
  const durationInfo = pickDurationInfo(durationRaw)
  const { rating, reviews } = pickRatingAndReviews(r as any)
  const featured = (r as any).Featured ?? (r as any).featured
  const productCode = (r as any).productCode ?? (r as any).ProductCode
  const canonicalId = String(productCode ?? (r as any).ProductID ?? (r as any).id ?? title)
  const providerUrl = (r as any).productUrl ?? (r as any).url

  return {
    id: canonicalId,
    productCode: productCode ? String(productCode) : undefined,
    slug: makeSlug(`${canonicalId}-${title}`),
    title,
    excerpt: summary,
    price,
    currency,
    image,
    imageUrl,
    destination,
    category,
    duration: durationInfo.text,
    durationMinutes: durationInfo.minutes,
    rating,
    reviews,
    providerUrl,
    featured: !!featured
  }
}

export function extractProductsFromResponse(resp: RawViatorApiResponse): { products: RawViatorProduct[]; shapeHint: string } {
  if (Array.isArray(resp)) return { products: resp, shapeHint: 'array' }

  const shapes: Array<{ data: any; hint: string }> = [
    { data: resp?.products, hint: 'products' },
    { data: resp?.results, hint: 'results' },
    { data: resp?.items, hint: 'items' },
    { data: (resp as any)?.data, hint: 'data' },
    { data: (resp as any)?.data?.products, hint: 'data.products' },
    { data: (resp as any)?.data?.items, hint: 'data.items' },
    { data: (resp as any)?.searchResults?.products, hint: 'searchResults.products' },
    { data: (resp as any)?.searchResults?.items, hint: 'searchResults.items' }
  ]

  for (const { data, hint } of shapes) {
    if (Array.isArray(data)) return { products: data, shapeHint: hint }
  }

  return { products: [], shapeHint: 'unknown/empty' }
}

export function transformMany(raw: RawViatorProduct[]): Experience[] {
  return raw.map(transformRawToExperience)
}
