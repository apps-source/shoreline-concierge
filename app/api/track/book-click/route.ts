import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type ClickPayload = {
  href: string
  title: string
  productCode?: string
  destination?: string
  source?: string
}

const MAX_TEXT = 1000

function sanitize(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, MAX_TEXT)
}

function validate(body: unknown): { ok: boolean; data?: ClickPayload; error?: string } {
  const candidate = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const href = sanitize(candidate.href)
  const title = sanitize(candidate.title)
  const productCode = sanitize(candidate.productCode)
  const destination = sanitize(candidate.destination)
  const source = sanitize(candidate.source) || 'unknown'

  if (!href) return { ok: false, error: 'href is required' }
  if (!title) return { ok: false, error: 'title is required' }

  return {
    ok: true,
    data: { href, title, productCode, destination, source }
  }
}

export async function POST(req: Request) {
  let body: unknown = null

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const validated = validate(body)
  if (!validated.ok || !validated.data) {
    return NextResponse.json({ ok: false, error: validated.error || 'Validation failed' }, { status: 400 })
  }

  const payload = {
    ...validated.data,
    created_at: new Date().toISOString()
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      })
      const { error } = await supabase.from('affiliate_clicks').insert([payload])

      if (!error) {
        return NextResponse.json({ ok: true, stored: true })
      }

      console.error('[track] Supabase insert error', error)
    } catch (error) {
      console.error('[track] Supabase client error', error)
    }
  }

  console.info('[track] affiliate click', payload)
  return NextResponse.json({ ok: true, stored: false })
}
