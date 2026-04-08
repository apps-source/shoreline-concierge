import { NextResponse } from 'next/server'
import OpenAI from 'openai'

type ParsedPlan = {
  destination: string
  destinationSlug?: string
  region?: string
  category?: string
  tripType?: string
  occasion?: string
  keywords?: string[]
  searchQuery?: string
  summary: string
  highlights?: string[]
}

type AIPlan = {
  destination?: string
  destinationSlug?: string
  region?: string
  category?: string
  tripType?: string
  occasion?: string
  keywords?: string[]
  searchQuery?: string
  summary?: string
  highlights?: string[]
}

let geminiUnavailableReason = ''

function isGeminiDisabled() {
  return geminiUnavailableReason.length > 0
}

function getPlannerProvider() {
  if (process.env.GEMINI_API_KEY && !isGeminiDisabled()) return 'gemini'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return null
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function stripLeadingIntentWords(value: string) {
  return value
    .replace(/^(find|show|book|need|want|get|looking for|search for|see|plan)\s+/i, '')
    .replace(/^(me|us|some|something)\s+/i, '')
    .trim()
}

function extractDestination(prompt: string) {
  const normalized = prompt.replace(/\s+/g, ' ').trim()
  const patterns = [
    /\b(?:in|around|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}(?:,\s*[A-Z][a-z]+)?)\b/,
    /\b(?:in|around|near)\s+([a-z]+(?:\s+[a-z]+){0,2}(?:,\s*[a-z]+)?)\b/i
  ]

  for (const pattern of patterns) {
    const match = normalized.match(pattern)
    const candidate = match?.[1]?.trim()
    if (candidate) {
      const cleaned = candidate.replace(/\b(for|with|on|this|next|during|at)\b.*$/i, '').trim()
      if (cleaned) return toTitleCase(cleaned)
    }
  }

  return ''
}

function isBadDestinationCandidate(value?: string | null) {
  const normalized = (value || '').trim().toLowerCase()
  if (!normalized) return true
  return ['do', 'something', 'anything', 'activities', 'things', 'coastal escape', 'custom destination', 'your destination'].includes(normalized)
}

function isBadSearchQueryCandidate(value?: string | null) {
  const normalized = (value || '').trim().toLowerCase()
  if (!normalized) return true
  if (normalized.length < 4) return true
  if (['do', 'todo', 'something', 'anything', 'activities', 'things to do'].includes(normalized)) return true
  return false
}

function extractCityState(prompt: string) {
  const normalized = prompt.replace(/\s+/g, ' ').trim()
  const contextualMatch = normalized.match(/\b(?:in|to|around|near)\s+([A-Za-z][A-Za-z\s'-]{1,40}?)\s*,\s*([A-Za-z]{2,}|Florida|California|Alabama|Mississippi|Georgia|Texas|Louisiana|South Carolina|North Carolina)\b/i)
  if (contextualMatch) {
    return {
      city: toTitleCase(stripLeadingIntentWords(contextualMatch[1] || '')),
      state: toTitleCase((contextualMatch[2] || '').trim())
    }
  }

  const simpleMatch = normalized.match(/\b([A-Za-z][A-Za-z\s'-]{1,40}?)\s*,\s*([A-Za-z]{2,}|Florida|California|Alabama|Mississippi|Georgia|Texas|Louisiana|South Carolina|North Carolina)\b/i)
  if (simpleMatch) {
    return {
      city: toTitleCase(stripLeadingIntentWords(simpleMatch[1] || '')),
      state: toTitleCase((simpleMatch[2] || '').trim())
    }
  }

  return null
}

function extractSearchIntent(prompt: string) {
  const lower = prompt.toLowerCase()
  const mappings: Array<{ match: RegExp; category: string; searchLabel: string; tripType: string }> = [
    { match: /\b(fishing charters?|fishing trips?|inshore fishing|offshore fishing)\b/i, category: 'Fishing Charters', searchLabel: 'fishing charters', tripType: 'adventure' },
    { match: /\b(boat charters?|private charters?|boat rentals?|pontoon charters?|captained boats?)\b/i, category: 'Boat Charters', searchLabel: 'boat charters', tripType: 'on-the-water' },
    { match: /\b(jetski|jet ski|jetskis|jet skis|waverunner|wave runner|waverunners|wave runners)\b/i, category: 'Jet Ski Rentals', searchLabel: 'jet ski rentals', tripType: 'adventure' },
    { match: /\b(dolphin cruises?|dolphin tours?|dolphin watch)\b/i, category: 'Dolphin Cruises', searchLabel: 'dolphin cruises', tripType: 'wildlife' },
    { match: /\b(snorkel|snorkeling|scuba|dive|diving)\b/i, category: 'Snorkeling & Diving', searchLabel: 'snorkeling trips', tripType: 'adventure' },
    { match: /\b(kayak|kayaking|paddleboard|sup|clear kayak)\b/i, category: 'Kayak & Paddle Tours', searchLabel: 'kayak tours', tripType: 'adventure' },
    { match: /\b(sunset cruises?|sunset tours?|romantic cruises?)\b/i, category: 'Sunset Cruises', searchLabel: 'sunset cruises', tripType: 'romantic' },
    { match: /\b(food tours?|seafood tours?|brunch cruises?|cocktail cruises?)\b/i, category: 'Food & Drink', searchLabel: 'food tours', tripType: 'foodie' },
    { match: /\b(family activities?|kid friendly|kids activities?)\b/i, category: 'Family Activities', searchLabel: 'family activities', tripType: 'family' },
    { match: /\b(boat|sail|sailing|yacht|cruise|captain)\b/i, category: 'Boat Tours', searchLabel: 'boat tours', tripType: 'on-the-water' },
    { match: /\b(water sports?|parasail)\b/i, category: 'Water Sports', searchLabel: 'water sports', tripType: 'adventure' },
    { match: /\b(food|dining|restaurant|seafood|brunch)\b/i, category: 'Food & Drink', searchLabel: 'food and drink', tripType: 'foodie' },
    { match: /\b(adventure|fish|fishing)\b/i, category: 'Fishing Charters', searchLabel: 'fishing charters', tripType: 'adventure' },
    { match: /\b(relax|reset|spa|quiet)\b/i, category: 'Private Experiences', searchLabel: 'private experiences', tripType: 'relaxation' }
  ]

  return mappings.find(item => item.match.test(lower))
}

function parsePrompt(prompt: string): ParsedPlan {
  const lower = prompt.toLowerCase()
  const cityStateMatch = extractCityState(prompt)
  const city = cityStateMatch?.city?.trim()
  const state = cityStateMatch?.state?.trim()
  const extractedDestination = extractDestination(prompt)
  const matched = extractSearchIntent(prompt)
  const occasion = /(birthday|bday|anniversary|honeymoon|bachelorette|celebration)/i.exec(prompt)?.[1]
  const destination = city
    ? `${city}${state ? ', ' + state : ''}`
    : extractedDestination
      ? extractedDestination
    : lower.includes('malibu')
      ? 'Malibu'
      : lower.includes('nantucket')
        ? 'Nantucket'
        : lower.includes('monterey')
          ? 'Monterey'
          : 'Coastal Escape'

  const destinationSlug = city ? slugify(city) : slugify(destination)
  const region = state || undefined
  const searchQuery =
    destination !== 'Coastal Escape'
      ? matched?.searchLabel
        ? `${matched.searchLabel} in ${destination}`
        : destination
      : prompt

  return {
    destination,
    destinationSlug,
    region,
    category: matched?.category,
    tripType: matched?.tripType,
    occasion: occasion ? occasion.toLowerCase() : undefined,
    keywords: [destination, matched?.category, matched?.tripType, matched?.searchLabel, occasion]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .slice(0, 5),
    searchQuery,
    summary: `Suggested first itinerary for ${destination}: ${matched?.category || 'coastal experiences'} matched to your vibe and dates.`,
    highlights: [
      'Best-fit coastal experiences',
      'Suggested day structure',
      'Add-on ideas for dining or transfers'
    ]
  }
}

function stripCodeFences(value: string) {
  return value
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function normalizeAIPlan(raw: unknown, fallback: ParsedPlan): ParsedPlan {
  const candidate = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const candidateDestination =
    typeof candidate.destination === 'string' && candidate.destination.trim() ? candidate.destination.trim() : ''
  const destination = !isBadDestinationCandidate(candidateDestination) ? candidateDestination : fallback.destination
  const destinationSlug =
    typeof candidate.destinationSlug === 'string' && candidate.destinationSlug.trim()
      ? slugify(candidate.destinationSlug)
      : slugify(destination)

  return {
    destination,
    destinationSlug,
    region:
      typeof candidate.region === 'string' && candidate.region.trim()
        ? candidate.region.trim()
        : fallback.region,
    category:
      typeof candidate.category === 'string' && candidate.category.trim()
        ? candidate.category.trim()
        : fallback.category,
    tripType:
      typeof candidate.tripType === 'string' && candidate.tripType.trim()
        ? candidate.tripType.trim()
        : fallback.tripType,
    summary:
      typeof candidate.summary === 'string' && candidate.summary.trim()
        ? candidate.summary.trim()
        : fallback.summary,
    occasion:
      typeof candidate.occasion === 'string' && candidate.occasion.trim()
        ? candidate.occasion.trim()
        : fallback.occasion,
    keywords: Array.isArray(candidate.keywords)
      ? candidate.keywords.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 6)
      : fallback.keywords,
    searchQuery:
      typeof candidate.searchQuery === 'string' && candidate.searchQuery.trim() && !isBadSearchQueryCandidate(candidate.searchQuery)
        ? candidate.searchQuery.trim()
        : fallback.searchQuery,
    highlights: Array.isArray(candidate.highlights)
      ? candidate.highlights.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 4)
      : fallback.highlights
  }
}

function buildPlannerPrompt(input: {
  prompt: string
  destination: string
  startDate: string
  endDate: string
  groupType: string
}) {
  const requestSummary = [
    input.prompt ? `Prompt: ${input.prompt}` : null,
    input.destination ? `Destination: ${input.destination}` : null,
    input.startDate ? `Start date: ${input.startDate}` : null,
    input.endDate ? `End date: ${input.endDate}` : null,
    input.groupType ? `Group type: ${input.groupType}` : null
  ]
    .filter(Boolean)
    .join('\n')

  return [
    'You are generating structured intent for an AI-first coastal trip planner.',
    'Return JSON only with this exact shape:',
    '{"destination":"string","destinationSlug":"string","region":"string","category":"string","tripType":"string","occasion":"string","keywords":["string"],"searchQuery":"string","summary":"string","highlights":["string"]}',
    'Rules:',
    '- keep the destination if the user already named one',
    '- destination accuracy matters more than creativity',
    '- choose one best-fit category',
    '- searchQuery should be short and search-friendly, usually the destination or destination plus a simple interest',
    '- summary must be under 35 words',
    '- highlights should be 3 to 4 short bullets',
    '',
    requestSummary
  ].join('\n')
}

function shouldSkipAIPlanner(prompt: string, parsed: ParsedPlan) {
  const normalizedPrompt = prompt.toLowerCase().trim()
  if (!normalizedPrompt) return true

  const hasDestination =
    Boolean(parsed.destination && parsed.destination !== 'Coastal Escape') ||
    Boolean(parsed.region)

  const obviousIntentPatterns = [
    /\b(charter|boat|boating|sail|sailing|yacht|cruise|captain)\b/i,
    /\b(jetski|jetskis|jet ski|jet skis|waverunner|waverunners|wave runner|wave runners|water sports?)\b/i,
    /\b(fish|fishing|angler|fishing charter|fishing charters)\b/i,
    /\b(dolphin|manatee|wildlife)\b/i,
    /\b(kayak|kayaking|paddle|paddleboard|sup)\b/i,
    /\b(snorkel|snorkeling|scuba|dive|diving)\b/i,
    /\b(food|dining|restaurant|seafood|brunch)\b/i,
    /\b(sunset|romantic|honeymoon|bachelorette|birthday)\b/i
  ]

  const hasObviousIntent = obviousIntentPatterns.some(pattern => pattern.test(normalizedPrompt))
  const shortEnough = normalizedPrompt.split(/\s+/).filter(Boolean).length <= 14

  return hasDestination && hasObviousIntent && shortEnough
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string) {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    })
  ])
}

async function generateWithOpenAI(prompt: string) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-5-mini',
    input: prompt
  })

  return response.output_text?.trim() || ''
}

async function generateWithGemini(prompt: string) {
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview'
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY || ''
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    })
  })

  if (!res.ok) {
    if (res.status === 404) {
      geminiUnavailableReason = `Gemini model unavailable: ${model}`
    }
    throw new Error(`Gemini request failed with ${res.status}`)
  }

  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || '')
    .join('\n')
    .trim()

  return text || ''
}

async function generatePlan(input: {
  prompt: string
  destination: string
  startDate: string
  endDate: string
  groupType: string
  fallback: ParsedPlan
}) {
  const provider = getPlannerProvider()
  if (!provider) {
    return { provider: null, plan: input.fallback, usedFallback: true }
  }

  if (shouldSkipAIPlanner(input.prompt || input.destination, input.fallback)) {
    return { provider: 'rule-parser', plan: input.fallback, usedFallback: false }
  }

  const plannerPrompt = buildPlannerPrompt(input)

  try {
    const raw =
      provider === 'gemini'
        ? await withTimeout(generateWithGemini(plannerPrompt), 12000, 'Gemini planner request')
        : await withTimeout(generateWithOpenAI(plannerPrompt), 12000, 'OpenAI planner request')

    const parsed = JSON.parse(stripCodeFences(raw)) as AIPlan
    return {
      provider,
      plan: normalizeAIPlan(parsed, input.fallback),
      usedFallback: false
    }
  } catch (error) {
    if (provider === 'gemini' && error instanceof Error && /404/.test(error.message)) {
      console.warn('[plan] Gemini unavailable for current model; using fallback parser')
    } else {
      console.warn('[plan] AI generation failed, using fallback parser', error instanceof Error ? error.message : error)
    }
    return { provider, plan: input.fallback, usedFallback: true }
  }
}

export async function POST(req: Request) {
  let body: any = {}
  try {
    body = await req.json()
  } catch {
    // ignore, keep default
  }

  const prompt = (body?.prompt || '').toString().trim()
  const destination = (body?.destination || '').toString().trim()
  const startDate = (body?.startDate || '').toString().trim()
  const endDate = (body?.endDate || '').toString().trim()
  const groupType = (body?.groupType || '').toString().trim()

  const provider = getPlannerProvider()

  if (!provider) {
    return NextResponse.json({ ok: false, error: 'AI key missing' }, { status: 500 })
  }

  const parsed = parsePrompt(prompt || destination)
  if (shouldSkipAIPlanner(prompt || destination, parsed)) {
    return NextResponse.json({
      ok: true,
      provider: 'rule-parser',
      usedFallback: false,
      plan: {
        summary: parsed.summary,
        destination: parsed.destination,
        destinationSlug: parsed.destinationSlug,
        region: parsed.region,
        category: parsed.category,
        tripType: parsed.tripType,
        dates: startDate && endDate ? `${startDate} → ${endDate}` : undefined,
        groupType: groupType || parsed.tripType || 'Not specified',
        occasion: parsed.occasion,
        keywords: parsed.keywords || [],
        searchQuery: parsed.searchQuery || parsed.destination || prompt,
        highlights: parsed.highlights || []
      }
    })
  }

  const generated = await generatePlan({
    prompt,
    destination,
    startDate,
    endDate,
    groupType,
    fallback: parsed
  })

  return NextResponse.json({
    ok: true,
    provider: generated.provider || provider,
    usedFallback: generated.usedFallback,
    plan: {
      summary: generated.plan.summary,
      destination: generated.plan.destination,
      destinationSlug: generated.plan.destinationSlug,
      region: generated.plan.region,
      category: generated.plan.category,
      tripType: generated.plan.tripType,
      dates: startDate && endDate ? `${startDate} → ${endDate}` : undefined,
      groupType: groupType || generated.plan.tripType || 'Not specified',
      occasion: generated.plan.occasion,
      keywords: generated.plan.keywords || [],
      searchQuery: generated.plan.searchQuery || generated.plan.destination || prompt,
      highlights: generated.plan.highlights || []
    }
  })
}

export async function GET() {
  const openaiKey = process.env.OPENAI_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY
  const provider = geminiKey ? 'gemini' : openaiKey ? 'openai' : null

  if (!provider) {
    return NextResponse.json({ ok: false, error: 'AI key missing' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    provider,
    plan: {
      summary: 'AI coastal plan preview',
      highlights: ['Best-fit activities', 'Suggested flow', 'Booking-ready next steps']
    }
  })
}
