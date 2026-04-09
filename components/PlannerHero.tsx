'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Destination = {
  slug: string
  name: string
  subtitle?: string
}

type Experience = {
  id?: string
  productCode?: string
  slug: string
  title: string
  excerpt?: string
  price?: string
  image?: string
  imageUrl?: string
  duration?: string
  rating?: number
  reviews?: number
  providerUrl?: string
  destination?: string | null
  category?: string | null
}

type PlannerHeroProps = {
  destinations: Destination[]
  featured: Experience[]
}

type PlannerResult = {
  destination: Destination
  experienceType: string
  summary: string
  experience?: Experience | null
}

type MatchSource = 'ai-viator' | 'curated-fallback' | null

type ApiPlan = {
  summary: string
  destination?: string
  destinationSlug?: string
  region?: string
  category?: string
  dates?: string
  groupType?: string
  occasion?: string
  keywords?: string[]
  searchQuery?: string
  highlights?: string[]
}

const MATCH_FETCH_TIMEOUT_MS = 20000
const INITIAL_MATCH_LIMIT = 12
const SHOW_MORE_INCREMENT = 12
const SEARCH_RESULT_CACHE_PREFIX = 'slrc_v1::'
const LAST_FOCUS_KEY = 'shoreline-last-focus-v1'

function normalizeSearchCandidate(value?: string | null) {
  const normalized = (value || '').trim()
  if (!normalized) return ''

  const lower = normalized.toLowerCase()
  if (lower === 'custom-destination' || lower === 'your destination' || lower === 'coastal escape') {
    return ''
  }

  return normalized
}

function getExperienceKey(experience: Experience) {
  return `${experience.productCode || experience.id || experience.slug}`
}

function buildSearchHref(
  prompt: string,
  startDate: string,
  endDate: string,
  selectedDestination: string,
  focus?: string
) {
  const params = new URLSearchParams()
  const normalizedPrompt = prompt.trim()
  const normalizedDestination = selectedDestination.trim()

  if (normalizedPrompt) params.set('prompt', normalizedPrompt)
  if (startDate) params.set('start', startDate)
  if (endDate) params.set('end', endDate)
  if (normalizedDestination) params.set('destination', normalizedDestination)
  if (focus) params.set('focus', focus)

  const query = params.toString()
  return `/${query ? `?${query}` : ''}#matches`
}

function buildSearchCacheKey(
  prompt: string,
  startDate: string,
  endDate: string,
  selectedDestination: string
) {
  return `${SEARCH_RESULT_CACHE_PREFIX}${buildSearchHref(prompt, startDate, endDate, selectedDestination).replace('#matches', '')}`
}

type SearchResultSnapshot = {
  prompt: string
  startDate: string
  endDate: string
  selectedDestination: string
  matches: Experience[]
  matchesSource: MatchSource
  resultCount: number
  serverPlan: ApiPlan | null
  lastSearchQuery: string
  lastResolvedDestinationId: string
  hasMoreResults: boolean
  savedAt: number
}

function saveSearchResultSnapshot(snapshot: SearchResultSnapshot) {
  try {
    const key = buildSearchCacheKey(snapshot.prompt, snapshot.startDate, snapshot.endDate, snapshot.selectedDestination)
    window.sessionStorage.setItem(key, JSON.stringify(snapshot))
  } catch (err) {
    console.warn('[planner] could not cache search result snapshot', err)
  }
}

function loadSearchResultSnapshot(prompt: string, startDate: string, endDate: string, selectedDestination: string) {
  try {
    const key = buildSearchCacheKey(prompt, startDate, endDate, selectedDestination)
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as SearchResultSnapshot
  } catch (err) {
    console.warn('[planner] could not load cached search result snapshot', err)
    return null
  }
}

function buildCuratedMatches(destSlug: string | undefined, category: string | undefined, pool: Experience[] = [], looseDestination?: string): Experience[] {
  const normalizedDest = destSlug?.toLowerCase()
  const normalizedCategory = category?.toLowerCase()
  const loose = looseDestination?.toLowerCase()

  let items = [...pool]
  if (normalizedDest) items = items.filter(e => (e.destination || '').toLowerCase() === normalizedDest)
  if (!items.length && loose) items = items.filter(e => (e.destination || '').toLowerCase().includes(loose))
  if (normalizedCategory) {
    items = items.filter(
      e => (e.category || '').toLowerCase() === normalizedCategory || e.title.toLowerCase().includes(normalizedCategory)
    )
  }

  if (!items.length) items = pool

  return items.slice(0, 3)
}

const slugify = (value?: string) => value?.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ''

export default function PlannerHero({ destinations, featured }: PlannerHeroProps) {
  const defaultPrompt = ''
  const defaultDestinationName = ''

  const [prompt, setPrompt] = useState(defaultPrompt)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedDestination, setSelectedDestination] = useState('')

  const [result, setResult] = useState<PlannerResult>(() => buildSuggestion(
    defaultPrompt,
    destinations,
    featured,
    defaultDestinationName
  ))
  const [serverPlan, setServerPlan] = useState<ApiPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [fallbackUsed, setFallbackUsed] = useState(false)
  const [matches, setMatches] = useState<Experience[]>([])
  const [matchesSource, setMatchesSource] = useState<MatchSource>(null)
  const [resultCount, setResultCount] = useState(0)
  const [lastSearchQuery, setLastSearchQuery] = useState('')
  const [lastResolvedDestinationId, setLastResolvedDestinationId] = useState('')
  const [matchLimit, setMatchLimit] = useState(INITIAL_MATCH_LIMIT)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMoreResults, setHasMoreResults] = useState(false)
  const handleStartRef = useRef<(() => Promise<void>) | null>(null)
  const pendingRestoreRef = useRef<{ prompt: string; startDate: string; endDate: string; selectedDestination: string } | null>(null)
  const pendingFocusKeyRef = useRef<string>('')
  const activeSearchTokenRef = useRef(0)
  const planControllerRef = useRef<AbortController | null>(null)
  const hasLiveMatches = matchesSource === 'ai-viator' && resultCount > 0 && matches.length > 0
  const hasCuratedMatches = matchesSource === 'curated-fallback' && resultCount > 0 && matches.length > 0
  const canShowMore = hasLiveMatches && hasMoreResults

  // URL is the source of truth for returning from detail pages.
  // If the homepage is loaded with search params, restore the fields and re-run the search.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const promptFromUrl = params.get('prompt') || ''
      const startFromUrl = params.get('start') || ''
      const endFromUrl = params.get('end') || ''
      const destinationFromUrl = params.get('destination') || ''
      const focusFromUrl = params.get('focus') || ''
      const storedFocus = !focusFromUrl ? window.sessionStorage.getItem(LAST_FOCUS_KEY) || '' : ''
      const hasUrlState = Boolean(promptFromUrl || startFromUrl || endFromUrl || destinationFromUrl)

      if (hasUrlState) {
        pendingFocusKeyRef.current = focusFromUrl || storedFocus
        setPrompt(promptFromUrl)
        setStartDate(startFromUrl)
        setEndDate(endFromUrl)
        setSelectedDestination(destinationFromUrl)
        const cached = loadSearchResultSnapshot(promptFromUrl, startFromUrl, endFromUrl, destinationFromUrl)

        if (cached && Array.isArray(cached.matches) && cached.matches.length > 0) {
          setMatches(cached.matches)
          setMatchesSource(cached.matchesSource)
          setResultCount(cached.resultCount)
          setServerPlan(cached.serverPlan)
          setLastSearchQuery(cached.lastSearchQuery)
          setLastResolvedDestinationId(cached.lastResolvedDestinationId)
          setHasMoreResults(cached.hasMoreResults)
          setError('')
          setFallbackUsed(false)
          setStatus('success')
        } else {
          setServerPlan(null)
          setMatches([])
          setMatchesSource(null)
          setResultCount(0)
          setLastSearchQuery('')
          setLastResolvedDestinationId('')
          setHasMoreResults(false)
          setError('')
          setFallbackUsed(false)
          setStatus('idle')
          pendingRestoreRef.current = {
            prompt: promptFromUrl,
            startDate: startFromUrl,
            endDate: endFromUrl,
            selectedDestination: destinationFromUrl
          }
          window.setTimeout(() => { void handleStartRef.current?.() }, 50)
        }
      }
    } catch (err) {
      console.warn('[planner] could not restore return state', err)
    }
  }, [])

  useEffect(() => {
    if (status !== 'success') {
      setLoadingMore(false)
    }
  }, [status])

  const resolveDestinationFromPlan = (planDestination?: string | null): Destination | null => {
    if (!planDestination) return null
    const lower = planDestination.toLowerCase()
    return (
      destinations.find(d => d.slug.toLowerCase() === lower) ||
      destinations.find(d => d.name.toLowerCase() === lower) ||
      destinations.find(d => lower.includes(d.name.toLowerCase())) ||
      null
    )
  }

  const beginSearchToken = () => {
    activeSearchTokenRef.current += 1
    return activeSearchTokenRef.current
  }

  const isActiveSearchToken = (token: number) => activeSearchTokenRef.current === token

  const fetchMatches = async (
    destinationSlug?: string,
    category?: string,
    queryText?: string,
    limit = INITIAL_MATCH_LIMIT,
    preserveExistingResults = false,
    start = 1,
    resolvedDestinationId?: string,
    searchToken?: number
  ): Promise<number> => {
    const attemptedQueries = resolvedDestinationId && preserveExistingResults && start > 1
      ? ['']
      : preserveExistingResults && start > 1
      ? [normalizeSearchCandidate(queryText)].filter(Boolean)
      : Array.from(
          new Set(
            [
              normalizeSearchCandidate(queryText),
              normalizeSearchCandidate(selectedDestination),
              normalizeSearchCandidate(destinationSlug),
              normalizeSearchCandidate(prompt)
            ].filter(Boolean)
          )
        )

    for (const freetext of attemptedQueries) {
      const params = new URLSearchParams()
      params.set('limit', String(limit))
      params.set('start', String(start))
      if (resolvedDestinationId) params.set('destination', resolvedDestinationId)
      if (freetext) params.set('q', freetext)
      if (prompt) params.set('prompt', prompt)

      console.log('[planner] viator fetch start', { destinationSlug, category, freetext, resolvedDestinationId, start, limit })
      const startedAt = performance.now()

      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), MATCH_FETCH_TIMEOUT_MS)

      try {
        const res = await fetch(`/api/viator/experiences?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error('Viator matching failed')
        const data = Array.isArray(json.data) ? (json.data as Experience[]) : []
        const meta = json.meta || {}

        console.log('[planner] viator fetch summary', {
          durationMs: Math.round(performance.now() - startedAt),
          start,
          limit,
          resultCount: data.length,
          meta,
          resolution: json.resolution
        })

        if (typeof searchToken === 'number' && !isActiveSearchToken(searchToken)) {
          console.warn('[planner] ignoring stale viator fetch result', { start, limit, freetext })
          return matches.length
        }

        if (data.length > 0) {
          const resolvedId = json?.resolution?.destinationId || resolvedDestinationId || ''
          if (typeof resolvedId === 'string') {
            setLastResolvedDestinationId(resolvedId)
          }
          const nextMatches = preserveExistingResults
            ? Array.from(
                new Map(
                  [...matches, ...data].map(item => [`${item.productCode || item.id || item.slug}`, item])
                ).values()
              )
            : data
          if (freetext) {
            setLastSearchQuery(freetext)
          }
          setMatches(nextMatches)
          setMatchesSource('ai-viator')
          setResultCount(nextMatches.length)
          setHasMoreResults(data.length >= limit)
          setFallbackUsed(false)
          setError('')
          return nextMatches.length
        }

        if (meta?.pageExhausted) {
          setHasMoreResults(false)
          throw new Error('No more results available')
        }
      } catch (err) {
        console.warn('[planner] viator fetch attempt failed', { freetext, err })
      } finally {
        window.clearTimeout(timeout)
      }
    }

    if (!preserveExistingResults) {
      setMatches([])
      setMatchesSource(null)
      setResultCount(0)
      setLastResolvedDestinationId('')
      setHasMoreResults(false)
    } else {
      setHasMoreResults(false)
    }
    throw new Error('No live matches returned')
  }

  const handleShowMore = async () => {
    if (!lastSearchQuery || loadingMore || !canShowMore) return

    const currentCount = matches.length
    const nextLimit = SHOW_MORE_INCREMENT
    const nextStart = currentCount + 1
    const searchToken = beginSearchToken()
    setLoadingMore(true)

    try {
      const returnedCount = await fetchMatches(
        result.destination?.slug,
        result.experienceType,
        lastSearchQuery,
        nextLimit,
        true,
        nextStart,
        lastResolvedDestinationId || undefined,
        searchToken
      )
      if (!isActiveSearchToken(searchToken)) return
      setMatchLimit(returnedCount)
      if (returnedCount <= currentCount || returnedCount < nextStart + nextLimit - 1) {
        setHasMoreResults(false)
      }
      if (returnedCount <= currentCount) {
        setError('You are already seeing all available results for this destination.')
      } else {
        setError('')
      }
    } catch (err) {
      console.warn('[planner] show more failed', err)
      if (err instanceof Error && err.message === 'No live matches returned') {
        setError('You are already seeing all available results for this destination.')
      } else if (err instanceof Error && err.message === 'No more results available') {
        setError('You are already seeing all available results for this destination.')
      } else {
        setError('We could not load more results right now.')
      }
    } finally {
      setLoadingMore(false)
    }
  }

  const handleStart = async () => {
    const restoreInput = pendingRestoreRef.current
    const activePrompt = restoreInput?.prompt ?? prompt
    const activeStartDate = restoreInput?.startDate ?? startDate
    const activeEndDate = restoreInput?.endDate ?? endDate
    const activeSelectedDestination = restoreInput?.selectedDestination ?? selectedDestination
    pendingRestoreRef.current = null

    console.log('[planner] button clicked', { prompt: activePrompt })
    const searchToken = beginSearchToken()
    planControllerRef.current?.abort()

    let next: PlannerResult
    try {
      next = buildSuggestion(activePrompt, destinations, featured, activeSelectedDestination)
    } catch (err) {
      console.error('[planner] local suggestion failed', err)
      setError('We could not build a suggestion right now. Please try again.')
      setStatus('error')
      setFallbackUsed(true)
      setMatches([])
      setResultCount(0)
      return
    }

    setResult(next)
    setLoading(true)
    setError('')
    setStatus('loading')
    setFallbackUsed(false)
    setMatches([])
    setMatchesSource(null)
    setResultCount(0)
    setLastResolvedDestinationId('')
    setHasMoreResults(false)
    setMatchLimit(INITIAL_MATCH_LIMIT)
    console.log('[planner] request started', { prompt: activePrompt, destination: next.destination?.slug || next.destination?.name })

    try {
      window.history.replaceState(null, '', buildSearchHref(activePrompt, activeStartDate, activeEndDate, activeSelectedDestination))
    } catch (err) {
      console.warn('[planner] could not sync search URL', err)
    }

    try {
      const controller = new AbortController()
      planControllerRef.current = controller
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: activePrompt,
          destination: activeSelectedDestination,
          startDate: activeStartDate,
          endDate: activeEndDate,
          interests: next.experienceType,
          budget: undefined
        })
      })

      const data = await res
        .json()
        .catch(err => {
          console.error('[planner] response parse failed', err)
          return null
        })
      if (!res.ok || !data?.ok || !data?.plan) {
        throw new Error('AI planning failed')
      }
      if (!isActiveSearchToken(searchToken)) {
        console.warn('[planner] ignoring stale plan response')
        return
      }
      const plan = data.plan as ApiPlan
      console.log('[planner] plan response', plan)
      setServerPlan(plan)

      if (!activeSelectedDestination && plan.destination) {
        setSelectedDestination(plan.destination)
      }

      const planDestination = resolveDestinationFromPlan(plan.destination) || resolveDestinationFromPlan(plan.destinationSlug || '')
      const destinationForMatch = planDestination || next.destination || (plan.destination ? { slug: plan.destinationSlug || undefined, name: plan.destination } as Destination : next.destination)
      const experienceCategory = plan.category || plan.groupType || next.experienceType

      const enhancedResult: PlannerResult = {
        destination: destinationForMatch,
        experienceType: experienceCategory,
        summary: plan.summary || next.summary,
        experience: next.experience
      }
      setResult(enhancedResult)

      try {
        await fetchMatches(
          destinationForMatch?.slug,
          experienceCategory,
          plan.searchQuery || activePrompt,
          INITIAL_MATCH_LIMIT,
          false,
          1,
          undefined,
          searchToken
        )
      } catch (matchErr) {
        if (!isActiveSearchToken(searchToken)) return
        console.warn('[planner] viator match fallback', matchErr)
        // Only show curated fallback if no live matches
        const curated = buildCuratedMatches(destinationForMatch?.slug, experienceCategory, featured, plan.destination)
        setMatches(curated)
        setMatchesSource(curated.length > 0 ? 'curated-fallback' : null)
        setResultCount(curated.length)
        setHasMoreResults(false)
        setFallbackUsed(curated.length > 0)
        if (curated.length === 0) {
          setError('We found the destination, but couldn’t load live matches. Please try again.')
          setStatus('error')
          return
        }
      }

      setStatus('success')
      console.log('[planner] request succeeded', { provider: data?.provider, plan: data?.plan })
    } catch (err) {
      if (!isActiveSearchToken(searchToken)) return
      console.error('[planner] request failed', err)
      setServerPlan(null)
      const fallbackQuery = activePrompt || activeSelectedDestination
      try {
        await fetchMatches(
          next.destination?.slug,
          next.experienceType,
          fallbackQuery,
          INITIAL_MATCH_LIMIT,
          false,
          1,
          undefined,
          searchToken
        )
        if (!isActiveSearchToken(searchToken)) return
        setError('AI plan took too long, so we showed live matches based on your request.')
        setFallbackUsed(true)
        setStatus('success')
      } catch (fallbackErr) {
        console.warn('[planner] live fallback fetch failed', fallbackErr)
        const curated = buildCuratedMatches(next.destination?.slug, next.experienceType, featured, activeSelectedDestination || activePrompt)
        setMatches(curated)
        setMatchesSource(curated.length > 0 ? 'curated-fallback' : null)
        setResultCount(curated.length)
        setHasMoreResults(false)
        setError('AI planning is unavailable right now, so we showed backup matches.')
        setFallbackUsed(curated.length > 0)
        setStatus('error')
      }
      console.log('[planner] fallback used', { prompt: activePrompt })
    } finally {
      if (planControllerRef.current?.signal.aborted) {
        planControllerRef.current = null
      } else if (isActiveSearchToken(searchToken)) {
        planControllerRef.current = null
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    handleStartRef.current = handleStart
  })

  useEffect(() => {
    const hasRestorableResults =
      matches.length > 0 &&
      (matchesSource === 'ai-viator' || matchesSource === 'curated-fallback') &&
      status === 'success'

    if (!hasRestorableResults) return

    saveSearchResultSnapshot({
      prompt,
      startDate,
      endDate,
      selectedDestination,
      matches,
      matchesSource,
      resultCount,
      serverPlan,
      lastSearchQuery,
      lastResolvedDestinationId,
      hasMoreResults,
      savedAt: Date.now()
    })
  }, [
    prompt,
    startDate,
    endDate,
    selectedDestination,
    matches,
    matchesSource,
    resultCount,
    serverPlan,
    lastSearchQuery,
    lastResolvedDestinationId,
    hasMoreResults,
    status
  ])

  useEffect(() => {
    if (!matches.length) return
    const focusKey = pendingFocusKeyRef.current
    if (!focusKey) return

    const scrollToFocusedCard = () => {
      const escaped = typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(focusKey) : focusKey
      const card = document.querySelector(`[data-match-key="${escaped}"]`) as HTMLElement | null
      if (card) {
        card.scrollIntoView({ block: 'center', behavior: 'smooth' })
      } else {
        document.getElementById('matches')?.scrollIntoView({ block: 'start', behavior: 'smooth' })
      }

      pendingFocusKeyRef.current = ''
      window.sessionStorage.removeItem(LAST_FOCUS_KEY)
      const params = new URLSearchParams(window.location.search)
      if (params.has('focus')) {
        params.delete('focus')
        const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}#matches`
        window.history.replaceState(null, '', next)
      }
    }

    window.setTimeout(scrollToFocusedCard, 80)
  }, [matches])

  useEffect(() => {
    return () => {
      planControllerRef.current?.abort()
    }
  }, [])

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl ring-1 ring-white/10">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30" aria-hidden />

      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="space-y-5 lg:max-w-2xl lg:pb-6">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-semibold leading-tight text-white drop-shadow-md">Find Things to Do for Your Coastal Vacation</h1>
            <p className="text-lg font-medium text-emerald-100/95">Plan less. Experience more.</p>
            <p className="max-w-2xl text-lg text-emerald-50/90 leading-relaxed">
              Search Shoreline Concierge to discover beach activities, excursions, tours, and trusted booking options for your next beach trip.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs text-emerald-50/90">
              {['Live results', 'Trusted partners', 'Top-rated experiences', 'Flexible booking on many options'].map((item) => (
                <span key={item} className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/10 p-4 sm:p-6 backdrop-blur-lg shadow-xl ring-1 ring-white/15 lg:self-stretch">
            <div className="flex flex-col gap-4">
              <div className="text-xs uppercase tracking-wide text-emerald-100">Search Shoreline Concierge</div>
              <div className="flex flex-col gap-3">
              <textarea
                tabIndex={1}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-base text-white placeholder:text-emerald-100/70 shadow-inner focus:border-emerald-300 focus:bg-white/20 focus:outline-none"
                rows={3}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Try: find me something fun to do in Tampa for my birthday weekend"
              />
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-emerald-50">When are you going?</label>
                  <input
                    tabIndex={2}
                    type="date"
                    value={startDate}
                    onChange={e => {
                      setStartDate(e.target.value)
                      const input = e.currentTarget
                      window.setTimeout(() => input.blur(), 0)
                    }}
                    className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-sm text-white placeholder:text-emerald-100/70 shadow-inner focus:border-emerald-300 focus:bg-white/20 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-emerald-50">Coming back</label>
                  <input
                    tabIndex={3}
                    type="date"
                    value={endDate}
                    onChange={e => {
                      setEndDate(e.target.value)
                      const input = e.currentTarget
                      window.setTimeout(() => input.blur(), 0)
                    }}
                    className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-sm text-white placeholder:text-emerald-100/70 shadow-inner focus:border-emerald-300 focus:bg-white/20 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-emerald-50">Destination</label>
                  <input
                    tabIndex={4}
                    type="text"
                    value={selectedDestination}
                    onChange={e => setSelectedDestination(e.target.value)}
                    placeholder="Leave blank if you already said it above"
                    className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-sm text-white placeholder:text-emerald-100/70 shadow-inner focus:border-emerald-300 focus:bg-white/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <button
                  tabIndex={5}
                  type="button"
                  onClick={handleStart}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Searching…' : 'Explore experiences'}
                </button>
                <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-100">
                  {status === 'loading' && <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-emerald-100 ring-1 ring-white/10">Searching live experiences…</span>}
                  {status === 'success' && serverPlan?.destination && <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-emerald-100 ring-1 ring-white/10">Results for {serverPlan.destination}</span>}
                  {status === 'error' && fallbackUsed && <span className="inline-flex items-center gap-2 rounded-full bg-amber-200/20 px-3 py-1 text-amber-200 ring-1 ring-amber-200/30">Showing backup matches</span>}
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
        <div id="matches" className="mt-6 rounded-3xl border border-white/10 bg-white/6 p-5 sm:p-6 backdrop-blur-lg ring-1 ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3 text-white">
            <div>
              <div className="text-sm font-semibold">Matches</div>
              {serverPlan?.summary ? (
                <div className="mt-2 max-w-3xl text-sm text-emerald-100/80">
                  {serverPlan.summary}
                </div>
              ) : null}
            </div>
            <div className="text-xs text-emerald-100">
              {hasLiveMatches
                ? `Live matches (${resultCount})`
                : hasCuratedMatches
                ? `Curated matches (${resultCount})`
                : 'Awaiting results'}
            </div>
          </div>
          {status === 'error' && error && (
            <div className="mt-4 rounded-2xl border border-amber-200/40 bg-amber-100/15 px-3 py-2 text-sm text-amber-100">
              {error || 'We hit a snag generating an AI plan. Showing curated matches instead.'}
            </div>
          )}
          {serverPlan?.highlights?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {serverPlan.highlights.slice(0, 3).map(highlight => (
                <span key={highlight} className="rounded-full bg-white/10 px-3 py-1 text-xs text-emerald-50 ring-1 ring-white/10">
                  {highlight}
                </span>
              ))}
            </div>
          ) : null}
          {hasLiveMatches || hasCuratedMatches ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {matches.map(match => {
                const detailBase = `/experiences/${match.slug}?id=${encodeURIComponent(match.id || '')}&productCode=${encodeURIComponent(match.productCode || '')}&title=${encodeURIComponent(match.title || '')}&destination=${encodeURIComponent((match.destination as string) || '')}`
                const returnTo = buildSearchHref(prompt, startDate, endDate, selectedDestination, getExperienceKey(match))
                return (
                <Link
                  key={match.slug}
                  href={`${detailBase}&returnTo=${encodeURIComponent(returnTo)}`}
                  onClick={() => {
                    try {
                      window.sessionStorage.setItem(LAST_FOCUS_KEY, getExperienceKey(match))
                    } catch {}
                  }}
                  data-match-key={getExperienceKey(match)}
                  className="block overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-white shadow-sm backdrop-blur hover:border-emerald-200/50"
                >
                  {match.imageUrl || match.image ? (
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={(match.imageUrl || match.image) as string}
                        alt={match.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      />
                    </div>
                  ) : null}
                  <div className="space-y-3 px-4 py-4">
                    <div className="text-base font-semibold leading-snug">{match.title}</div>
                    <div className="text-sm text-emerald-100/85 line-clamp-2">
                      {match.excerpt || (hasLiveMatches ? 'Live experience from Viator.' : 'Curated experience for your trip.')}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-emerald-100/90">
                      {match.price ? <span className="rounded-full bg-white/10 px-2 py-1">{match.price}</span> : null}
                      {typeof match.rating === 'number' ? <span className="rounded-full bg-white/10 px-2 py-1">★ {match.rating.toFixed(1)}{typeof match.reviews === 'number' ? ` (${match.reviews})` : ''}</span> : null}
                      {match.duration ? <span className="rounded-full bg-white/10 px-2 py-1">{match.duration}</span> : null}
                    </div>
                  </div>
                </Link>
              )})}
            </div>
          ) : (
            <p className="mt-4 text-sm text-emerald-100/80">Run a search to see tailored experiences show up here.</p>
          )}
          {hasLiveMatches ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm">
              <div className="text-emerald-100/85">
                {serverPlan?.destination ? `Showing ${resultCount} options for ${serverPlan.destination}` : `Showing ${resultCount} options based on your search`}
              </div>
              {canShowMore ? (
                <button
                  type="button"
                  onClick={handleShowMore}
                  disabled={loadingMore}
                  className="inline-flex items-center rounded-full bg-emerald-400 px-4 py-2 font-semibold text-emerald-950 shadow-lg hover:bg-emerald-300"
                >
                  {loadingMore ? 'Loading more…' : 'Show more results'}
                </button>
              ) : (
                <div className="text-xs text-emerald-100/75">
                  Showing top {resultCount} results
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function buildSuggestion(prompt: string, destinations: Destination[], featured: Experience[], preferredDestinationName?: string): PlannerResult {
  const lower = prompt.toLowerCase()

  const rules: Array<{ match: string[]; dest: string; experience: string; summary: string }> = [
    { match: ['romantic', 'couple', 'honeymoon'], dest: 'malibu', experience: 'Sunset Cruises', summary: 'Golden hour charters, cliffside dinners, and private driver add-ons.' },
    { match: ['family', 'kids', 'multi-gen'], dest: 'nantucket', experience: 'Family Activities', summary: 'Kid-friendly dolphin cruises, bike-to-beach days, and easy seafood suppers.' },
    { match: ['boat', 'sail', 'yacht'], dest: 'malibu', experience: 'Boat Tours', summary: 'Crewed boat day with swim stops, sundowners, and waterside dining holds.' },
    { match: ['budget', 'affordable'], dest: 'monterey', experience: 'Dolphin Tours', summary: 'Wildlife outings, harbor bites, and calm bay time that won’t break the bank.' },
    { match: ['food', 'foodie', 'dining', 'seafood'], dest: 'nantucket', experience: 'Nightlife', summary: 'Harbor seafood, chef tables, and sunset sail pairings.' },
    { match: ['girls', 'bachelorette'], dest: 'malibu', experience: 'Sunset Cruises', summary: 'Brunch, spa time, and a sunset cruise with champagne.' },
    { match: ['relax', 'reset', 'quiet'], dest: 'monterey', experience: 'Private Experiences', summary: 'Calm bay sails, wellness add-ons, and slow coastal dining.' }
  ]

  const matched = rules.find(rule => rule.match.some(k => lower.includes(k)))
  const preferredSlug = preferredDestinationName ? slugify(preferredDestinationName) : ''
  const destinationFromInput = preferredDestinationName
    ? destinations.find(d => d.slug === preferredSlug || d.name.toLowerCase() === preferredDestinationName.toLowerCase())
    : undefined
  const destination: Destination =
    destinationFromInput ||
    (preferredDestinationName
      ? { slug: preferredSlug || destinations[0]?.slug || 'custom-destination', name: preferredDestinationName }
      : { slug: 'custom-destination', name: 'Your destination' }) ||
    { slug: preferredSlug || 'shoreline', name: preferredDestinationName || 'Coastal Escape' }

  let experience: Experience | null = null
  if (destination?.slug) {
    experience = featured.find(exp => exp.destination === destination.slug) || featured[0] || null
  }

  return {
    destination,
    experienceType: matched?.experience || experience?.category || 'Coastal Experience',
    summary: matched?.summary || 'Private captains, trusted dining, and concierge-coordinated days that fit your vibe.',
    experience
  }
}
