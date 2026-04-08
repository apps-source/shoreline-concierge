// Viator and internal types

// Raw mocked Viator-like product as returned by a provider API
export type RawViatorProduct = {
  ProductID: string | number
  Title: string
  Summary?: string
  Price?: {
    Amount?: number
    Currency?: string
    DisplayPrice?: string
  }
  Images?: Array<{ url: string }>
  Destination?: string
  Category?: string
  Duration?: string
  Rating?: number
  Reviews?: number
  Featured?: boolean
}

// Generic provider response wrappers we might see from sandbox/production/search
export type RawViatorApiResponse =
  | RawViatorProduct[]
  | {
      data?: RawViatorProduct[] | { products?: RawViatorProduct[]; items?: RawViatorProduct[] }
      products?: RawViatorProduct[]
      results?: RawViatorProduct[]
      items?: RawViatorProduct[]
      searchResults?: { products?: RawViatorProduct[]; items?: RawViatorProduct[] }
    }

export type ViatorDebugMeta = {
  source: 'sandbox' | 'production' | 'mock'
  method?: 'GET' | 'POST'
  methodUsed?: 'GET' | 'POST'
  endpointUsed: string | null
  strategyUsed?: string | null
  statusCode: number | null
  responseStatusText?: string | null
  responseShapeHint: string | null
  fallbackReason: string | null
  resultCount: number
  requestBodyPreview?: string | null
  requestHeadersPreview?: Record<string, string> | null
  responseBodyPreview?: string | null
  defaultDestinationUsed?: boolean
  freetextProductsRendered?: boolean
  pageExhausted?: boolean
}

export type ViatorFreeTextResolution = {
  destinationId?: string
  destinationName?: string
  productIds?: string[]
  destinationGuessSource?: string
  productCount?: number
}

// Normalized Experience model used by the app
export type Experience = {
  id: string
  slug: string
  productCode?: string
  title: string
  excerpt: string
  price?: string
  currency?: string
  image?: string
  imageUrl?: string
  destination?: string
  category?: string
  duration?: string
  durationMinutes?: number
  rating?: number
  reviews?: number
  providerUrl?: string
  featured?: boolean
}
