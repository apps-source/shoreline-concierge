import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type LeadPayload = {
  destination: string
  startDate: string
  endDate: string
  groupType: string
  interests?: string
  budgetStyle?: string
  notes?: string
  status: string
  source: string
}

const MAX_TEXT = 800

function sanitize(value: any) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, MAX_TEXT)
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function validate(body: any): { ok: boolean; errors?: string[]; data?: LeadPayload } {
  const errors: string[] = []
  const destination = sanitize(body?.destination)
  const startDate = sanitize(body?.startDate)
  const endDate = sanitize(body?.endDate)
  const groupType = sanitize(body?.groupType)
  const interests = sanitize(body?.interests)
  const budgetStyle = sanitize(body?.budgetStyle)
  const notes = sanitize(body?.notes)

  if (!destination) errors.push('destination is required')
  if (!startDate || !isIsoDate(startDate)) errors.push('startDate is required')
  if (!endDate || !isIsoDate(endDate)) errors.push('endDate is required')
  if (!groupType) errors.push('groupType is required')

  if (errors.length) return { ok: false, errors }

  return {
    ok: true,
    data: {
      destination,
      startDate,
      endDate,
      groupType,
      interests,
      budgetStyle,
      notes,
      status: 'new',
      source: 'concierge-form'
    }
  }
}

export async function POST(req: Request) {
  let body: any = null

  try {
    body = await req.json()
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const validated = validate(body)
  if (!validated.ok || !validated.data) {
    return NextResponse.json({ ok: false, error: validated.errors?.join(', ') ?? 'Validation failed' }, { status: 400 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Use timestamp server-side regardless of client input
  const payload = {
    ...validated.data,
    created_at: new Date().toISOString()
  }

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      })
  const { error } = await supabase.from('concierge_leads').insert([payload])
      if (error) {
        console.error('[concierge] Supabase insert error', error)
        return NextResponse.json({ ok: false, error: 'Storage error' }, { status: 500 })
      }
      return NextResponse.json({ ok: true, stored: true })
    } catch (err) {
      console.error('[concierge] Supabase client error', err)
      return NextResponse.json({ ok: false, error: 'Storage unavailable' }, { status: 500 })
    }
  }

  // Fallback: no Supabase env — still acknowledge success for UX, log server-side.
  console.info('[concierge] Supabase not configured; logging payload', payload)
  return NextResponse.json({ ok: true, stored: false, message: 'Stored in memory/log only' })
}