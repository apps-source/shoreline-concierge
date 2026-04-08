/// <reference types="node" />
// Server-side Viator client helpers (search-first, mock-fallback)
// All provider logic stays server-side. Do NOT expose API keys to the browser or client bundles.
//
// MVP strategy: use the search model for real-time product retrieval (e.g., /products/search, /search/freetext).
// Ingestion model (/products/modified-since) can be added later for full catalog sync.

import { RawViatorProduct, RawViatorApiResponse, Experience, ViatorDebugMeta, ViatorFreeTextResolution } from './types'
import { extractProductsFromResponse, transformMany } from './transformers'

type SearchArgs = {
  q?: string
  destination?: string
  category?: string
  featured?: boolean
  limit?: number
  start?: number
}

function coerceDestinationId(dest?: string) {
  if (!dest) return undefined
  const trimmed = dest.trim()
  if (/^\d+$/.test(trimmed)) return trimmed
  return undefined
}

const SANDBOX_PRODUCTS_SEARCH_ENDPOINT = 'https://api.sandbox.viator.com/partner/products/search' // Assumed path; confirm with Viator docs
const SANDBOX_FREETEXT_SEARCH_ENDPOINT = 'https://api.sandbox.viator.com/partner/search/freetext' // Assumed path; confirm with Viator docs
const PRODUCTION_PRODUCTS_SEARCH_ENDPOINT = 'https://api.viator.com/partner/products/search' // Placeholder for future production
const PRODUCTION_FREETEXT_SEARCH_ENDPOINT = 'https://api.viator.com/partner/search/freetext' // Placeholder for future production

const CACHE_TTL_MS = 1000 * 60 * 60 // 1 hour per Viator guidance
type CacheEntry = { expires: number; products: RawViatorProduct[]; meta: Partial<ViatorDebugMeta> }
const searchCache = new Map<string, CacheEntry>()

type FreeTextResult = {
  products: RawViatorProduct[] | null
  meta: Partial<ViatorDebugMeta>
  resolution?: ViatorFreeTextResolution
}

function hasStrongIntentQuery(query?: string) {
  const value = (query || '').toLowerCase()
  return /\b(charter|private charter|boat rental|pontoon|captain|fishing|angler|offshore|inshore|jetski|jet ski|jetskis|jet skis|waverunner|wave runner|dolphin|snorkel|scuba|kayak|paddleboard)\b/.test(
    value
  )
}

function mergeRawProducts(primary: RawViatorProduct[], secondary: RawViatorProduct[]) {
  const merged = new Map<string, RawViatorProduct>()

  for (const product of [...primary, ...secondary]) {
    const key = String(
      product?.ProductID ||
        (product as any)?.productId ||
        (product as any)?.id ||
        (product as any)?.productCode ||
        (product as any)?.Title ||
        (product as any)?.title
    )

    if (key && !merged.has(key)) {
      merged.set(key, product)
    }
  }

  return Array.from(merged.values())
}

/**
 * Return an array of mocked raw Viator-like products. This simulates the provider
 * response so the frontend can be developed against server routes without secrets.
 */
export function getMockViatorProducts(): RawViatorProduct[] {
  return [
    {
      ProductID: 1001,
      Title: 'Private Sunset Cruise',
      Summary: 'An intimate sunset charter with champagne and coastal vistas.',
      Price: { Amount: 420, Currency: 'USD', DisplayPrice: '$420' },
      Images: [{ url: '/images/sunset-cruise.jpg' }],
      Destination: 'malibu',
      Category: 'Sunset Cruises',
      Duration: '3 hours',
      Rating: 4.9,
      Reviews: 128,
      Featured: true
    },
    {
      ProductID: 1002,
      Title: 'Family Dolphin Tour',
      Summary: 'Kid-friendly dolphin watching with a naturalist guide.',
      Price: { Amount: 260, Currency: 'USD', DisplayPrice: '$260' },
      Images: [{ url: '/images/dolphin-tour.jpg' }],
      Destination: 'nantucket',
      Category: 'Dolphin Tours',
      Duration: '2 hours',
      Rating: 4.7,
      Reviews: 64,
      Featured: false
    },
    {
      ProductID: 1003,
      Title: 'Sport Fishing Charter',
      Summary: 'Half-day fishing with an experienced captain and gear.',
      Price: { Amount: 600, Currency: 'USD', DisplayPrice: '$600' },
      Images: [{ url: '/images/fishing-charter.jpg' }],
      Destination: 'monterey',
      Category: 'Fishing Charters',
      Duration: '6 hours',
      Rating: 4.8,
      Reviews: 42,
      Featured: false
    }
  ]
}

function cacheKey(endpoint: string, body: unknown) {
  return `${endpoint}::${JSON.stringify(body)}`
}

function getCached(key: string) {
  const hit = searchCache.get(key)
  if (!hit) return null
  if (Date.now() > hit.expires) {
    searchCache.delete(key)
    return null
  }
  return hit
}

function setCached(key: string, products: RawViatorProduct[], meta: Partial<ViatorDebugMeta>) {
  searchCache.set(key, { expires: Date.now() + CACHE_TTL_MS, products, meta })
}

function getCampaignValue() {
  return (process.env.VIATOR_CAMPAIGN_VALUE || 'shoreline-mvp').trim()
}

function withCampaignValue(endpoint: string) {
  const campaignValue = getCampaignValue()
  if (!campaignValue) return endpoint

  const url = new URL(endpoint)
  url.searchParams.set('campaign-value', campaignValue)
  return url.toString()
}

function capLimit(limit?: number) {
  if (!limit || limit <= 0) return 20
  return Math.min(limit, 50)
}

function buildProductsSearchPayload(params: SearchArgs) {
  const count = capLimit(params.limit)
  const start = params.start && params.start > 0 ? params.start : 1
  const destinationId = coerceDestinationId(params.destination)
  const filtering: any = {}

  if (destinationId) {
    filtering.destination = destinationId
  }

  if (params.category) {
    const maybeTag = Number(params.category)
    if (!Number.isNaN(maybeTag)) filtering.tags = [maybeTag]
  }

  const sorting = params.featured
    ? { sort: 'DEFAULT' }
    : { sort: 'DEFAULT' }

  const pagination = { start, count }

  return {
    filtering,
    sorting,
    pagination,
    currency: 'USD'
  }
}

function buildFreeTextSearchPayload(params: SearchArgs) {
  const count = capLimit(params.limit)
  const start = params.start && params.start > 0 ? params.start : 1
  const destinationId = coerceDestinationId(params.destination)
  const productFiltering: any = {}
  if (destinationId) productFiltering.destination = destinationId
  if (params.category) {
    const maybeTag = Number(params.category)
    if (!Number.isNaN(maybeTag)) productFiltering.tags = [maybeTag]
  }

  const productSorting = params.featured
    ? { sort: 'DEFAULT' }
    : { sort: 'DEFAULT' }

  return {
    searchTerm: params.q || '',
    productFiltering,
    productSorting,
    searchTypes: [
      {
        searchType: 'PRODUCTS',
        pagination: { start, count }
      },
      {
        searchType: 'DESTINATIONS',
        pagination: { start: 1, count: 3 }
      }
    ],
    currency: 'USD'
  }
}

type SandboxStrategy = {
  name: string
  endpoint: string
  method: 'POST'
  body: any
  contentType?: string
}

function safePreview(obj: any) {
  try {
    return JSON.stringify(obj).slice(0, 1000)
  } catch {
    return null
  }
}

function redactHeaders(headers: Record<string, string>) {
  const copy: Record<string, string> = { ...headers }
  if (copy['exp-api-key']) copy['exp-api-key'] = 'REDACTED'
  if (copy['API-Key']) copy['API-Key'] = 'REDACTED'
  if (copy['api-key']) copy['api-key'] = 'REDACTED'
  return copy
}

function extractDestinationId(value?: any): string | undefined {
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (value && typeof value === 'object') {
    const candidate = value.destinationId || value.id || value.destination || value.destId || value.ref || value.refId
    if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) return candidate.trim()
    if (typeof candidate === 'number' && Number.isFinite(candidate)) return String(candidate)
  }
  return undefined
}

function extractFreeTextResolution(resp: any): ViatorFreeTextResolution {
  const resolution: ViatorFreeTextResolution = {}

  // Prefer explicit destinations.results shape first
  const destinationsResults = resp?.destinations?.results || resp?.data?.destinations?.results || resp?.destinations || resp?.data?.destinations || []
  const productsResults = resp?.products?.results || resp?.data?.products?.results || resp?.products || resp?.data?.products || []

  const destinations: any[] = Array.isArray(destinationsResults) ? destinationsResults : []
  const products: any[] = Array.isArray(productsResults) ? productsResults : []

  const fallbackCollections: any[] = [
    resp?.searchResults,
    resp?.data?.searchResults,
    resp?.results,
    resp?.items
  ].filter(Boolean)

  for (const collection of fallbackCollections) {
    if (Array.isArray(collection)) {
      for (const entry of collection) {
        if (entry?.searchType && `${entry.searchType}`.toLowerCase().includes('dest')) {
          const items = entry.items || entry.results || entry.destinations || []
          if (Array.isArray(items)) destinations.push(...items)
        } else if (entry?.searchType && `${entry.searchType}`.toLowerCase().includes('product')) {
          const items = entry.items || entry.results || entry.products || []
          if (Array.isArray(items)) products.push(...items)
        } else {
          if (entry?.destinationId || entry?.destination || entry?.id) destinations.push(entry)
          if (entry?.ProductID || entry?.productId || entry?.title || entry?.Title) products.push(entry)
        }
      }
    }
  }

  const firstDest = destinations.find(d => extractDestinationId(d)) || destinations[0]
  const destId = extractDestinationId(firstDest)
  const destName = (firstDest && (firstDest.name || firstDest.title || firstDest.label || firstDest.destinationName)) || undefined
  if (destId) {
    resolution.destinationId = destId
    resolution.destinationName = destName
    resolution.destinationGuessSource = 'freetext'
  }

  const productIds = products
    .map(p => p?.ProductID || p?.productId || p?.id)
    .filter(Boolean)
    .map(String)

  if (productIds.length) {
    resolution.productIds = productIds.slice(0, 10)
    resolution.productCount = productIds.length
  }

  return resolution
}

function extractProductsFromFreetext(resp: any): RawViatorProduct[] {
  const buckets: any[] = [
    resp?.products?.results,
    resp?.data?.products?.results,
    resp?.products,
    resp?.data?.products,
    resp?.searchResults?.products,
    resp?.data?.searchResults?.products
  ]

  for (const bucket of buckets) {
    if (Array.isArray(bucket)) return bucket as RawViatorProduct[]
    if (bucket && Array.isArray(bucket.items)) return bucket.items as RawViatorProduct[]
  }
  return []
}

async function performSandboxWithStrategies(strategies: SandboxStrategy[], cacheTag: string): Promise<{ products: RawViatorProduct[] | null; meta: Partial<ViatorDebugMeta> }> {
  const key = process.env.VIATOR_SANDBOX_KEY
  if (!key) {
    console.warn('[viator] VIATOR_SANDBOX_KEY missing; falling back to mock data')
    return { products: null, meta: { source: 'mock', endpointUsed: strategies[0]?.endpoint ?? null, fallbackReason: 'sandbox key missing', method: 'POST', methodUsed: 'POST' } }
  }

  let lastMeta: Partial<ViatorDebugMeta> = { source: 'sandbox', endpointUsed: null, strategyUsed: null, fallbackReason: 'unattempted', method: 'POST', methodUsed: 'POST' }

  for (const strat of strategies) {
    const endpointWithCampaign = withCampaignValue(strat.endpoint)
    const cacheId = cacheKey(`${endpointWithCampaign}:${cacheTag}:${strat.name}`, strat.body)
    const cached = getCached(cacheId)
    if (cached) {
      return { products: cached.products, meta: { ...cached.meta, source: 'sandbox', strategyUsed: cached.meta.strategyUsed ?? strat.name, fallbackReason: 'cache-hit', method: strat.method, methodUsed: strat.method } }
    }

    const headers = {
      'exp-api-key': key,
      Accept: 'application/json;version=2.0',
      'Accept-Language': 'en-US',
      'Content-Type': strat.contentType || 'application/json;version=2.0'
    }

    const requestBodyPreview = safePreview(strat.body)
    const requestHeadersPreview = redactHeaders(headers)

    try {
      const res = await fetch(endpointWithCampaign, {
        method: strat.method,
        headers,
        cache: 'no-store',
        body: JSON.stringify(strat.body)
      })

      const responseText = await res.text()
      const responseBodyPreview = responseText.slice(0, 1000)

      if (!res.ok) {
        lastMeta = {
          source: 'sandbox',
          endpointUsed: endpointWithCampaign,
          strategyUsed: strat.name,
          statusCode: res.status,
          responseStatusText: res.statusText,
          fallbackReason: `${res.status} ${res.statusText || 'Error'} (${strat.name})`,
          method: strat.method,
          methodUsed: strat.method,
          requestBodyPreview,
          requestHeadersPreview,
          responseBodyPreview
        }
        console.warn('[viator] Sandbox search failed', res.status, res.statusText, strat.name)
        continue
      }

      let json: RawViatorApiResponse | null = null
      try {
        json = responseText ? JSON.parse(responseText) : null
      } catch (parseErr) {
        console.warn('[viator] Sandbox response parse error; treating as empty', parseErr)
      }

      const { products, shapeHint } = extractProductsFromResponse(json || {})
      if (!products.length) {
        const requestedStart = Number(strat?.body?.pagination?.start || 1)
        const isPaginatedFollowUp = Number.isFinite(requestedStart) && requestedStart > 1
        lastMeta = {
          source: 'sandbox',
          endpointUsed: endpointWithCampaign,
          strategyUsed: strat.name,
          statusCode: res.status,
          responseStatusText: res.statusText,
          responseShapeHint: shapeHint,
          fallbackReason: isPaginatedFollowUp ? `page exhausted (${strat.name})` : `empty or invalid (${strat.name})`,
          method: strat.method,
          methodUsed: strat.method,
          requestBodyPreview,
          requestHeadersPreview,
          responseBodyPreview,
          pageExhausted: isPaginatedFollowUp
        }
        console.warn(
          isPaginatedFollowUp
            ? '[viator] Sandbox search returned no paginated results; treating as exhausted page'
            : '[viator] Sandbox search empty/invalid; falling back to next strategy',
          strat.name
        )
        continue
      }

      setCached(cacheId, products, {
        source: 'sandbox',
        endpointUsed: endpointWithCampaign,
        strategyUsed: strat.name,
        statusCode: res.status,
        responseShapeHint: shapeHint,
        responseStatusText: res.statusText,
        method: strat.method,
        methodUsed: strat.method,
        requestBodyPreview,
        requestHeadersPreview,
        responseBodyPreview
      })
      console.info('[viator] Using sandbox search data via strategy', strat.name)
      return {
        products,
        meta: {
          source: 'sandbox',
          endpointUsed: endpointWithCampaign,
          strategyUsed: strat.name,
          statusCode: res.status,
          responseStatusText: res.statusText,
          responseShapeHint: shapeHint,
          fallbackReason: null,
          resultCount: products.length,
          method: strat.method,
          methodUsed: strat.method,
          requestBodyPreview,
          requestHeadersPreview,
          responseBodyPreview,
          pageExhausted: false
        }
      }
    } catch (err) {
      lastMeta = {
        source: 'sandbox',
        endpointUsed: endpointWithCampaign,
        strategyUsed: strat.name,
        fallbackReason: `exception (${strat.name})`,
        method: strat.method,
        methodUsed: strat.method,
        requestBodyPreview,
        requestHeadersPreview,
        responseBodyPreview: lastMeta.responseBodyPreview ?? null
      }
      console.warn('[viator] Sandbox search error; falling back to next strategy', strat.name, err)
      continue
    }
  }

  return { products: null, meta: lastMeta }
}

async function performDirectFreeTextSearch(params: SearchArgs): Promise<FreeTextResult> {
  const key = process.env.VIATOR_SANDBOX_KEY
  const body = buildFreeTextSearchPayload(params)
  const endpointWithCampaign = withCampaignValue(SANDBOX_FREETEXT_SEARCH_ENDPOINT)

  if (!key) {
    return {
      products: null,
      resolution: undefined,
      meta: {
        source: 'mock',
        endpointUsed: endpointWithCampaign,
        fallbackReason: 'sandbox key missing',
        method: 'POST',
        methodUsed: 'POST'
      }
    }
  }

  const headers = {
    'exp-api-key': key,
    Accept: 'application/json;version=2.0',
    'Accept-Language': 'en-US',
    'Content-Type': 'application/json;version=2.0'
  }

  const requestBodyPreview = safePreview(body)
  const requestHeadersPreview = redactHeaders(headers)

  try {
    console.info('[viator] freetext request', { endpoint: endpointWithCampaign, body })
    const res = await fetch(endpointWithCampaign, {
      method: 'POST',
      headers,
      cache: 'no-store',
      body: JSON.stringify(body)
    })

    const responseText = await res.text()
    let json: RawViatorApiResponse | null = null
    try {
      json = responseText ? JSON.parse(responseText) : null
    } catch (err) {
      console.warn('[viator] freetext parse error', err)
    }

  const directProducts = extractProductsFromFreetext(json)
  const { products, shapeHint } = directProducts.length ? { products: directProducts, shapeHint: 'products.results' } : extractProductsFromResponse(json || {})
  const resolution = extractFreeTextResolution(json)
    const responseBodyPreview = responseText.slice(0, 1000)

    const meta: Partial<ViatorDebugMeta> = {
      source: 'sandbox',
      endpointUsed: endpointWithCampaign,
      statusCode: res.status,
      responseStatusText: res.statusText,
      responseShapeHint: shapeHint,
      fallbackReason: products.length ? null : 'empty freetext',
      resultCount: products.length,
      method: 'POST',
      methodUsed: 'POST',
      requestBodyPreview,
      requestHeadersPreview,
      responseBodyPreview
    }

    console.info('[viator] freetext result summary', {
      searchTerm: body.searchTerm,
      destinationId: resolution.destinationId,
      destinationName: resolution.destinationName,
      productCount: products.length
    })

    if (!res.ok) {
      meta.fallbackReason = `${res.status} ${res.statusText}`
      return { products: null, resolution, meta }
    }

    return { products: products.length ? products : null, resolution, meta }
  } catch (err) {
    console.warn('[viator] freetext request failed', err)
    return {
      products: null,
      resolution: undefined,
      meta: {
        source: 'sandbox',
        endpointUsed: endpointWithCampaign,
        fallbackReason: 'exception freetext',
        resultCount: 0,
        method: 'POST',
        methodUsed: 'POST',
        requestBodyPreview,
        requestHeadersPreview
      }
    }
  }
}

// Placeholder for future production search calls. Keep server-only.
async function performProductionPost(endpoint: string, body: any): Promise<{ products: RawViatorProduct[] | null; meta: Partial<ViatorDebugMeta> }> {
  const key = process.env.VIATOR_API_KEY
  const endpointWithCampaign = withCampaignValue(endpoint)
  if (!key) return { products: null, meta: { source: 'mock', endpointUsed: endpointWithCampaign, fallbackReason: 'production key missing', method: 'POST' } }
  // TODO: Implement production search when ready.
  return { products: null, meta: { source: 'production', endpointUsed: endpointWithCampaign, fallbackReason: 'not implemented', method: 'POST' } }
}

export async function searchViatorProducts(params: SearchArgs): Promise<{ products: RawViatorProduct[] | null; meta: Partial<ViatorDebugMeta> }> {
  const structured = buildProductsSearchPayload(params)
  const destinationId = coerceDestinationId(params.destination)
  const defaultDestinationUsed = !destinationId

  console.info('[viator] products/search request body', {
    body: structured,
    destinationParam: params.destination,
    defaultDestinationUsed
  })

  if (!destinationId) {
    return { products: null, meta: { source: 'mock', fallbackReason: 'destination missing for products/search', method: 'POST', methodUsed: 'POST', endpointUsed: null, defaultDestinationUsed } }
  }

  const strategies: SandboxStrategy[] = [
    { name: 'products-structured', endpoint: SANDBOX_PRODUCTS_SEARCH_ENDPOINT, method: 'POST', body: structured }
  ]
  const sandbox = await performSandboxWithStrategies(strategies, 'products')
  if (sandbox.products) return sandbox
  if (sandbox.meta.pageExhausted) return { products: [], meta: sandbox.meta }
  const prod = await performProductionPost(PRODUCTION_PRODUCTS_SEARCH_ENDPOINT, structured)
  if (prod.products) return prod
  return { products: null, meta: { source: 'mock', fallbackReason: sandbox.meta.fallbackReason || prod.meta.fallbackReason || 'all fetches failed', method: 'POST', methodUsed: 'POST', endpointUsed: sandbox.meta.endpointUsed ?? prod.meta.endpointUsed ?? null, requestBodyPreview: safePreview(structured), defaultDestinationUsed } as any }
}

export async function searchViatorFreeText(params: SearchArgs): Promise<FreeTextResult> {
  const direct = await performDirectFreeTextSearch(params)
  if (direct.products || direct.resolution) return direct

  const structured = buildFreeTextSearchPayload(params)
  const strategies: SandboxStrategy[] = [
    { name: 'freetext-structured', endpoint: SANDBOX_FREETEXT_SEARCH_ENDPOINT, method: 'POST', body: structured }
  ]
  const sandbox = await performSandboxWithStrategies(strategies, 'freetext')
  if (sandbox.products) return { products: sandbox.products, meta: sandbox.meta, resolution: undefined }
  const prod = await performProductionPost(PRODUCTION_FREETEXT_SEARCH_ENDPOINT, structured)
  if (prod.products) return { products: prod.products, meta: prod.meta, resolution: undefined }
  return { products: null, meta: { source: 'mock', fallbackReason: sandbox.meta.fallbackReason || prod.meta.fallbackReason || 'all fetches failed', method: 'POST', methodUsed: 'POST' }, resolution: undefined }
}

export async function getFeaturedViatorProducts(params: SearchArgs): Promise<{ products: RawViatorProduct[] | null; meta: Partial<ViatorDebugMeta> }> {
  return searchViatorProducts({ ...params, featured: true })
}

function applyLocalFilters(
  exps: Experience[],
  params: SearchArgs,
  options?: { skipDestinationFilter?: boolean; skipCategoryFilter?: boolean; skipQueryFilter?: boolean }
): Experience[] {
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const buildTokens = (value: string) =>
    normalize(value)
      .split(' ')
      .filter(token => token.length > 2 && !['the', 'and', 'for', 'with', 'around', 'near', 'things', 'activities'].includes(token))

  const INTENT_GROUPS: Array<{ name: string; match: RegExp; terms: string[]; hardBoostTerms?: string[] }> = [
    {
      name: 'boating',
      match: /\b(charter|boat|boating|sail|sailing|yacht|cruise|captain|rental|tiki boat)\b/i,
      terms: ['charter', 'boat', 'boats', 'boating', 'sail', 'sailing', 'yacht', 'cruise', 'captain', 'catamaran', 'rental', 'private charter', 'boat rental', 'tiki boat'],
      hardBoostTerms: ['charter', 'private charter', 'boat rental', 'captain', 'yacht']
    },
    {
      name: 'water-sports',
      match: /\b(jetski|jet ski|waverunner|wave runner|parasail|watersports?|water sports?)\b/i,
      terms: ['jetski', 'jet ski', 'waverunner', 'wave runner', 'parasail', 'water sport', 'watersport', 'water sports', 'watersports'],
      hardBoostTerms: ['jetski', 'jet ski', 'waverunner', 'wave runner']
    },
    {
      name: 'fishing',
      match: /\b(fish|fishing|angler|offshore|inshore)\b/i,
      terms: ['fishing', 'fish', 'angler', 'offshore', 'inshore', 'deep sea', 'charter'],
      hardBoostTerms: ['fishing', 'angler', 'offshore', 'inshore']
    },
    {
      name: 'wildlife',
      match: /\b(dolphin|manatee|whale|wildlife|eco tour)\b/i,
      terms: ['dolphin', 'manatee', 'whale', 'wildlife', 'eco tour', 'eco cruise'],
      hardBoostTerms: ['dolphin', 'manatee', 'whale']
    },
    {
      name: 'paddling',
      match: /\b(kayak|kayaking|paddle|paddleboard|sup)\b/i,
      terms: ['kayak', 'kayaking', 'paddle', 'paddleboard', 'sup', 'clear kayak'],
      hardBoostTerms: ['kayak', 'clear kayak', 'paddleboard']
    },
    {
      name: 'diving',
      match: /\b(snorkel|snorkeling|scuba|dive|diving)\b/i,
      terms: ['snorkel', 'snorkeling', 'scuba', 'dive', 'diving'],
      hardBoostTerms: ['snorkel', 'scuba', 'diving']
    },
    {
      name: 'food-drink',
      match: /\b(food|dining|restaurant|seafood|brunch|cocktail|drink|brewery)\b/i,
      terms: ['food', 'dining', 'restaurant', 'seafood', 'brunch', 'cocktail', 'drink', 'brewery', 'tasting'],
      hardBoostTerms: ['food', 'seafood', 'brunch', 'cocktail']
    },
    {
      name: 'romantic',
      match: /\b(sunset|romantic|couple|honeymoon|anniversary|date night)\b/i,
      terms: ['sunset', 'romantic', 'couple', 'honeymoon', 'anniversary', 'date night', 'dinner cruise'],
      hardBoostTerms: ['sunset', 'romantic', 'dinner cruise']
    },
    {
      name: 'family',
      match: /\b(family|kids|children|child friendly|all ages)\b/i,
      terms: ['family', 'kids', 'children', 'child friendly', 'all ages'],
      hardBoostTerms: ['family', 'kids', 'all ages']
    },
    {
      name: 'nightlife',
      match: /\b(nightlife|bar|club|night|party|music)\b/i,
      terms: ['nightlife', 'bar', 'club', 'night', 'party', 'music', 'live music'],
      hardBoostTerms: ['nightlife', 'bar', 'party']
    }
  ]

  const buildIntentTerms = () => {
    const source = [params.q || '', params.category || ''].join(' ').trim()
    const tokens = buildTokens(source)
    const terms = new Set(tokens)
    const activeGroups: string[] = []

    for (const group of INTENT_GROUPS) {
      if (group.match.test(source)) {
        activeGroups.push(group.name)
        group.terms.forEach(term => terms.add(term))
        group.hardBoostTerms?.forEach(term => terms.add(term))
      }
    }

    if ((params.category || '').toLowerCase().includes('boat')) {
      ;['charter', 'boat', 'cruise', 'sailing', 'yacht', 'captain'].forEach(term => terms.add(term))
    }
    if ((params.category || '').toLowerCase().includes('fish')) {
      ;['fishing', 'fish', 'angler'].forEach(term => terms.add(term))
    }

    return {
      terms: Array.from(terms),
      activeGroups
    }
  }

  const querySource = normalize([params.q || '', params.category || ''].join(' '))
  const isExplicitCharterQuery = /\b(charter|private charter|boat rental|captain|pontoon)\b/.test(querySource)
  const isExplicitFishingQuery = /\b(fishing|fishing charter|angler|offshore|inshore)\b/.test(querySource)
  const isExplicitJetSkiQuery = /\b(jetski|jet ski|jetskis|jet skis|waverunner|wave runner)\b/.test(querySource)
  const isExplicitDolphinQuery = /\b(dolphin|manatee|wildlife cruise|eco cruise)\b/.test(querySource)

  const scoreByIntent = (item: Experience, intentTerms: string[], activeGroups: string[]) => {
    if (!intentTerms.length && !activeGroups.length) return 0

    const title = normalize(item.title || '')
    const excerpt = normalize(item.excerpt || '')
    const category = normalize(item.category || '')
    const destination = normalize(item.destination || '')
    const full = [title, category, excerpt, destination].filter(Boolean).join(' ')

    let score = 0
    for (const rawTerm of intentTerms) {
      const term = normalize(rawTerm)
      if (!term) continue
      if (title.includes(term)) score += 12
      if (category.includes(term)) score += 10
      if (excerpt.includes(term)) score += 5
      if (full.includes(term)) score += 2
    }

    const exactQuery = normalize(params.q || '')
    if (exactQuery && title.includes(exactQuery)) score += 35

    if (activeGroups.includes('boating')) {
      if (/charter|private charter|boat rental|captain|yacht/.test(title)) score += 30
      if (/charter|boat|cruise|captain|yacht/.test(category)) score += 18
      if (/pontoon|private boat|private tour|captained|captain included/.test(title)) score += 22
    }
    if (activeGroups.includes('water-sports')) {
      if (/jetski|jet ski|waverunner|wave runner|parasail/.test(title)) score += 30
      if (/water sport|watersport|parasail/.test(category)) score += 18
      if (/rental|ride the waves|jet ski rental/.test(title)) score += 18
    }
    if (activeGroups.includes('fishing')) {
      if (/fishing|angler|offshore|inshore/.test(title)) score += 28
      if (/fishing|angler/.test(category)) score += 16
      if (/charter|captain|deep sea|sportfishing/.test(title)) score += 22
    }
    if (activeGroups.includes('wildlife')) {
      if (/dolphin|manatee|whale|eco/.test(title)) score += 24
    }
    if (activeGroups.includes('paddling')) {
      if (/kayak|clear kayak|paddleboard|sup/.test(title)) score += 24
    }
    if (activeGroups.includes('diving')) {
      if (/snorkel|scuba|diving|dive/.test(title)) score += 24
    }
    if (activeGroups.includes('food-drink')) {
      if (/food|seafood|cocktail|brewery|brunch|dinner/.test(title)) score += 22
    }
    if (activeGroups.includes('romantic')) {
      if (/sunset|romantic|dinner cruise|couple/.test(title)) score += 22
    }
    if (activeGroups.includes('family')) {
      if (/family|kids|children|all ages/.test(title)) score += 18
    }
    if (activeGroups.includes('nightlife')) {
      if (/bar|party|club|night|live music/.test(title)) score += 20
    }

    const genericLandAttractionPattern = /\b(golf cart|city tour|trolley|walking tour|history tour|museum|aquarium|skydiving|escape game|art tour)\b/
    const genericCruisePattern = /\b(dolphin cruise|sunset cruise|sightseeing cruise|eco dolphin cruise)\b/

    if (isExplicitCharterQuery) {
      if (/charter|private charter|pontoon|captain|boat rental|private boat/.test(title)) score += 55
      if (/charter|boat rental|captain|pontoon/.test(category)) score += 30
      if (/crab island|sandbar|pontoon boat/.test(title)) score += 24
      if (genericLandAttractionPattern.test(title)) score -= 45
      if (genericCruisePattern.test(title) && !/charter|private|pontoon/.test(title)) score -= 18
    }

    if (isExplicitFishingQuery) {
      if (/fishing charter|private fishing|sportfishing|deep sea|offshore|inshore/.test(title)) score += 60
      if (/fishing|angler|charter/.test(category)) score += 28
      if (genericLandAttractionPattern.test(title)) score -= 50
      if (/dolphin|sunset|history|aquarium/.test(title) && !/fishing/.test(title)) score -= 24
    }

    if (isExplicitJetSkiQuery) {
      if (/jetski|jet ski|waverunner|wave runner/.test(title)) score += 70
      if (/water sport|watersport|jet ski|waverunner/.test(category)) score += 30
      if (genericLandAttractionPattern.test(title)) score -= 50
      if (/dolphin cruise|sunset cruise|boat tour|pontoon/.test(title) && !/jet ski|waverunner/.test(title)) score -= 18
    }

    if (isExplicitDolphinQuery && /dolphin|manatee|whale/.test(title)) {
      score += 35
    }

    if (typeof item.rating === 'number') score += Math.max(0, Math.round(item.rating))

    return score
  }

  const matchesLocationLikeQuery = (item: Experience, value: string) => {
    const phrase = normalize(value)
    if (!phrase) return true

    const haystack = normalize([item.destination, item.title, item.excerpt].filter(Boolean).join(' '))
    if (!haystack) return false
    if (haystack.includes(phrase)) return true

    const tokens = buildTokens(value)
    if (!tokens.length) return false

    const matchedCount = tokens.filter(token => haystack.includes(token)).length
    return tokens.length === 1 ? matchedCount === 1 : matchedCount >= 2
  }

  let items = [...exps]
  const normalizedCategory = (params.category || '').trim().toLowerCase()
  const normalizedDestination = (params.destination || '').trim().toLowerCase()
  const skipDestinationFilter = !!options?.skipDestinationFilter
  const skipCategoryFilter = !!options?.skipCategoryFilter
  const skipQueryFilter = !!options?.skipQueryFilter
  const { terms: intentTerms, activeGroups } = buildIntentTerms()

  if (!skipCategoryFilter && normalizedCategory && normalizedCategory !== 'not specified') {
    items = items.filter(i => {
      const category = (i.category || '').toLowerCase()
      const title = i.title.toLowerCase()
      const excerpt = (i.excerpt || '').toLowerCase()
      return category.includes(normalizedCategory) || title.includes(normalizedCategory) || excerpt.includes(normalizedCategory)
    })
  }
  if (!skipDestinationFilter && normalizedDestination) {
    items = items.filter(i => matchesLocationLikeQuery(i, normalizedDestination))
  }
  if (params.featured) items = items.filter(i => i.featured)
  if (!skipQueryFilter && params.q) {
    const q = params.q.toLowerCase()
    const qTokens = buildTokens(q)
    if (qTokens.length) {
      items = items.filter(i => {
        const haystack = normalize([i.destination, i.title, i.excerpt].filter(Boolean).join(' '))
        if (!haystack) return false
        if (haystack.includes(normalize(q))) return true
        const matchedCount = qTokens.filter(token => haystack.includes(token)).length
        return qTokens.length === 1 ? matchedCount === 1 : matchedCount >= 2
      })
    }
  }
  items = items
    .map((item, index) => ({ item, index, score: scoreByIntent(item, intentTerms, activeGroups) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.index - b.index
    })
    .map(entry => entry.item)
  if (params.limit && params.limit > 0) items = items.slice(0, params.limit)
  return items
}

/**
 * Returns normalized experiences using the search model first (sandbox),
 * then production placeholder, then mock fallback. All data flows through the
 * transformer layer so UI stays stable.
 */
export async function getNormalizedExperiencesWithMeta(params: SearchArgs = {}): Promise<{ data: Experience[]; meta: ViatorDebugMeta; resolution?: ViatorFreeTextResolution }> {
  let meta: ViatorDebugMeta = {
    source: 'mock',
    endpointUsed: null,
    statusCode: null,
    responseShapeHint: null,
    fallbackReason: null,
    resultCount: 0,
    method: undefined,
    methodUsed: undefined,
    requestBodyPreview: null,
    requestHeadersPreview: null,
    responseBodyPreview: null,
    responseStatusText: null
  }

  let raw: RawViatorProduct[] | null = null
  let resolution: ViatorFreeTextResolution | undefined
  let freetextUsed = false
  let freetextUsableCount = 0
  let fallbackOverwroteLiveResults = false
  let usedExpandedDestinationCatalog = false

  const rawFreeText = params.q || ''
  const destinationId = rawFreeText ? undefined : coerceDestinationId(params.destination)
  const searchParams = { ...params, destination: destinationId }

  console.info('[viator] planner inbound', {
    rawInput: rawFreeText,
    destinationParam: params.destination,
    category: params.category
  })

  // Prefer free-text search when q is provided; use it to resolve a destination/product context before product search.
  if (rawFreeText) {
    const free = await searchViatorFreeText(searchParams)
    resolution = free.resolution
    if (free.products && free.products.length) {
      raw = free.products
      freetextUsed = true
      freetextUsableCount = free.products.length
      meta = { ...meta, ...free.meta, source: free.meta.source || 'sandbox', resultCount: free.products.length, freetextProductsRendered: true }
      console.info('[viator] freetext usable products', {
        count: free.products.length,
        destinationId: resolution?.destinationId,
        destinationName: resolution?.destinationName,
        renderedDirect: true
      })
    } else {
      meta = { ...meta, ...free.meta }
    }
  }

  // If freetext gave us a destinationId, expand into products/search so we can
  // return a fuller catalog for that destination instead of a tiny freetext sample.
  const destinationForProducts = resolution?.destinationId
  if (destinationForProducts) {
    const prodSearch = await searchViatorProducts({ ...searchParams, destination: destinationForProducts })
    console.info('[viator] products search request', {
      destination: destinationForProducts,
      category: params.category,
      featured: params.featured,
      limit: params.limit
    })
    if (prodSearch.products && prodSearch.products.length) {
      raw =
        rawFreeText && hasStrongIntentQuery(rawFreeText) && raw && raw.length
          ? mergeRawProducts(raw, prodSearch.products)
          : prodSearch.products
      freetextUsed = false
      usedExpandedDestinationCatalog = true
      meta = {
        ...meta,
        ...prodSearch.meta,
        source: prodSearch.meta.source || 'sandbox',
        resultCount: raw.length
      }
    } else {
      meta = { ...meta, ...prodSearch.meta }
      if (prodSearch.meta.pageExhausted) {
        raw = []
      }
    }
  }

  // For deterministic follow-up pages, allow direct destination paging without
  // forcing another freetext resolution pass.
  if (!rawFreeText && destinationId) {
    const prodSearch = await searchViatorProducts({ ...searchParams, destination: destinationId })
    console.info('[viator] direct destination search request', {
      destination: destinationId,
      category: params.category,
      featured: params.featured,
      limit: params.limit,
      start: params.start
    })
    if (prodSearch.products && prodSearch.products.length) {
      raw = prodSearch.products
      freetextUsed = false
      usedExpandedDestinationCatalog = true
      meta = { ...meta, ...prodSearch.meta, source: prodSearch.meta.source || 'sandbox', resultCount: prodSearch.products.length }
      resolution = {
        ...(resolution || {}),
        destinationId,
        destinationGuessSource: resolution?.destinationGuessSource || 'direct-destination'
      }
    } else {
      meta = { ...meta, ...prodSearch.meta }
      if (prodSearch.meta.pageExhausted) {
        raw = []
      }
    }
  }

  if (!raw || raw.length === 0) {
    if (meta.pageExhausted) {
      meta = { ...meta, resultCount: 0, freetextProductsRendered: false }
      console.info('[viator] paginated destination page exhausted', {
        destinationId: destinationForProducts,
        start: params.start,
        limit: params.limit
      })
      return { data: [], meta, resolution }
    }
    raw = getMockViatorProducts()
    meta = {
      ...meta,
      source: 'mock',
      endpointUsed: meta.endpointUsed,
      fallbackReason: meta.fallbackReason || 'using mock fallback',
      resultCount: raw.length,
      method: meta.method ?? 'POST',
      methodUsed: meta.methodUsed ?? meta.method ?? 'POST'
    }
    console.info('[viator] Using mock data fallback', { fallbackReason: meta.fallbackReason })
  }

  const transformed = transformMany(raw)
  let normalized = applyLocalFilters(transformed, params, {
    // Freetext result sets are already provider-ranked and should not be over-filtered locally.
    skipCategoryFilter: freetextUsed,
    skipDestinationFilter: freetextUsed,
    // Once free-text has resolved a destination and we expand into that destination's
    // full catalog, the natural-language query is too broad/noisy to use as a strict
    // local filter. Keep the destination context, but don't zero out valid results.
    skipQueryFilter: freetextUsed || usedExpandedDestinationCatalog
  })

  // Guardrail: never let non-empty live results collapse to zero due local normalization.
  if ((freetextUsed || usedExpandedDestinationCatalog) && raw.length > 0 && normalized.length === 0) {
    normalized = params.limit && params.limit > 0 ? transformed.slice(0, params.limit) : transformed
    fallbackOverwroteLiveResults = true
    console.warn('[viator] normalization dropped live results; restored transformed live set', {
      freetextUsableCount,
      usedExpandedDestinationCatalog,
      restoredCount: normalized.length
    })
  }

  const finalCount = normalized.length
  meta = { ...meta, resultCount: finalCount, freetextProductsRendered: freetextUsed }

  console.info('[viator] freetext pipeline summary', {
    freetextUsableCount,
    normalizedCount: finalCount,
    finalReturnedDataLength: finalCount,
    fallbackOverwroteLiveResults,
    resultCount: finalCount,
    metaResultCount: meta.resultCount
  })

  return { data: normalized, meta, resolution }
}

// Convenience wrapper for existing callers
export async function getNormalizedExperiences(params: SearchArgs = {}): Promise<Experience[]> {
  const { data } = await getNormalizedExperiencesWithMeta(params)
  return data
}
