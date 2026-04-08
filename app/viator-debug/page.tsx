import Link from 'next/link'

type DebugResponse = {
  ok: boolean
  source?: 'sandbox' | 'production' | 'mock'
  endpointUsed?: string | null
  strategyUsed?: string | null
  methodUsed?: 'GET' | 'POST' | null
  statusCode?: number | null
  statusText?: string | null
  responseShapeHint?: string | null
  fallbackReason?: string | null
  resultCount?: number
  requestBodyPreview?: string | null
  requestHeadersPreview?: Record<string, string> | null
  responseBodyPreview?: string | null
  sampleTitles?: string[]
  error?: string
}

export const dynamic = 'force-dynamic'

export default async function ViatorDebugPage() {
  let payload: DebugResponse = { ok: false, error: 'No response' }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://shorelineconcierge.travel'}/api/viator/debug`, { cache: 'no-store' })
    payload = await res.json()
  } catch (err) {
    payload = { ok: false, error: String(err) }
  }

  return (
    <div className="container py-10">
      <div className="mb-4 text-sm text-amber-600">Temporary diagnostics page — not linked in public navigation.</div>
      <h1 className="text-2xl font-semibold mb-6">Viator Debug</h1>

      {!payload.ok && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 mb-4">{payload.error ?? 'Unknown error'}</div>
      )}

      <div className="grid gap-3">
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-slate-500">Source</div>
          <div className="font-semibold text-slate-800">{payload.source ?? 'unknown'}</div>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-slate-500">Endpoint used</div>
          <div className="font-semibold text-slate-800 break-words">{payload.endpointUsed ?? 'n/a'}</div>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-slate-500">Strategy</div>
          <div className="font-semibold text-slate-800 break-words">{payload.strategyUsed ?? 'n/a'}</div>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-slate-500">Method</div>
          <div className="font-semibold text-slate-800">{payload.methodUsed ?? 'n/a'}</div>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-slate-500">Status code</div>
          <div className="font-semibold text-slate-800">{payload.statusCode ?? 'n/a'}</div>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-slate-500">Status text</div>
          <div className="font-semibold text-slate-800">{payload.statusText ?? 'n/a'}</div>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-slate-500">Response shape</div>
          <div className="font-semibold text-slate-800">{payload.responseShapeHint ?? 'n/a'}</div>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-slate-500">Request headers (redacted)</div>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-700">{payload.requestHeadersPreview ? JSON.stringify(payload.requestHeadersPreview, null, 2) : 'n/a'}</pre>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-slate-500">Request body preview</div>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-700">{payload.requestBodyPreview ?? 'n/a'}</pre>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-slate-500">Response body preview</div>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-700">{payload.responseBodyPreview ?? 'n/a'}</pre>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-slate-500">Fallback reason</div>
          <div className="font-semibold text-slate-800">{payload.fallbackReason ?? 'n/a'}</div>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-slate-500">Result count</div>
          <div className="font-semibold text-slate-800">{payload.resultCount ?? 0}</div>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm text-slate-500">Sample titles (first 3)</div>
          <div className="font-semibold text-slate-800">
            {payload.sampleTitles && payload.sampleTitles.length > 0 ? payload.sampleTitles.join(', ') : 'none'}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/" className="text-amber-500 underline">Back to home</Link>
      </div>
    </div>
  )
}
