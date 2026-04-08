import { getNormalizedExperiencesWithMeta } from '../../../../lib/viator/client'

export async function GET(req: Request) {
  const startedAt = Date.now()
  try {
    const url = new URL(req.url)
    const params = url.searchParams
    const category = params.get('category')
    const destination = params.get('destination')
    const q = params.get('q') || params.get('query')
    const prompt = params.get('prompt') || undefined
    const featured = params.get('featured')
    const limitParam = params.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : undefined
    const startParam = params.get('start')
    const start = startParam ? parseInt(startParam, 10) : undefined

    const { data: items, meta, resolution } = await getNormalizedExperiencesWithMeta({
      category: category || undefined,
      destination: destination || undefined,
      featured: featured === 'true',
      limit,
      start,
      q: q || undefined
    })

    console.info('[planner] viator flow', {
      durationMs: Date.now() - startedAt,
      prompt,
      freetextQuery: q,
      freetextResolution: resolution,
      destinationParam: destination,
      category,
      start,
      resultCount: items.length,
      meta
    })

    return new Response(JSON.stringify({ data: items, meta, resolution }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Viator API route error', { durationMs: Date.now() - startedAt, err })
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
