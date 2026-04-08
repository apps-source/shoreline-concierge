import { getNormalizedExperiencesWithMeta } from '../../../../lib/viator/client'

export async function GET(req: Request) {
  try {
    const { data, meta } = await getNormalizedExperiencesWithMeta({ featured: true, limit: 6 })
    const sampleTitles = data.slice(0, 3).map(d => d.title)

    return new Response(JSON.stringify({
      ok: true,
      source: meta.source,
      endpointUsed: meta.endpointUsed,
  strategyUsed: meta.strategyUsed,
      methodUsed: meta.methodUsed ?? meta.method,
      statusCode: meta.statusCode,
      statusText: meta.responseStatusText,
      responseShapeHint: meta.responseShapeHint,
      fallbackReason: meta.fallbackReason,
      resultCount: meta.resultCount,
      requestBodyPreview: meta.requestBodyPreview,
      requestHeadersPreview: meta.requestHeadersPreview,
      responseBodyPreview: meta.responseBodyPreview,
      sampleTitles
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Viator debug route error', err)
    return new Response(JSON.stringify({ ok: false, error: 'Internal server error' }), { status: 500 })
  }
}
