'use client'

import { FormEvent, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function Concierge(){
  const params = useSearchParams()
  const defaultDestination = params.get('destination') || ''
  const defaultInterests = params.get('interests') || ''
  const defaultNotes = params.get('notes') || ''

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/concierge/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: formData.get('destination'),
          startDate: formData.get('startDate'),
          endDate: formData.get('endDate'),
          groupType: formData.get('groupType'),
          interests: formData.get('interests'),
          budgetStyle: formData.get('budgetStyle'),
          notes: formData.get('notes')
        })
      })

      const data = await res.json()
      if (!res.ok || !data?.ok) {
        setStatus('error')
        setErrorMessage(data?.error || 'Something went wrong')
        return
      }

      setStatus('success')
      form.reset()
    } catch (err) {
      setStatus('error')
      setErrorMessage('Network error — please try again')
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-gradient-to-br from-ocean-50 via-white to-sand-50 p-8 ring-1 ring-emerald-50 shadow-sm">
        <div className="space-y-4 max-w-3xl">
          <p className="text-sm uppercase tracking-wide text-emerald-800">AI Trip Planner</p>
          <h1 className="text-4xl font-semibold text-slate-900">Build my shoreline trip with AI</h1>
          <p className="text-lg text-slate-700 leading-relaxed">Share your dates, destination, and vibe. Shoreline AI drafts coastal plans with experiences, dining ideas, and on-shore moments tailored to your group.</p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">AI-generated first pass</span>
            <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">Built for premium coastal trips</span>
            <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">VIP human planning later</span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-2xl font-semibold text-slate-900">Trip intake</h2>
          <p className="text-slate-600">Your answers help Shoreline AI propose destinations, experiences, and a smarter booking path without manual back-and-forth.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-800">Destination</label>
            <input
              name="destination"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:bg-white focus:outline-none"
              placeholder="Malibu, Nantucket, Monterey..."
              defaultValue={defaultDestination}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-800">Travel dates</label>
            <div className="grid grid-cols-2 gap-2">
              <input name="startDate" type="date" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:bg-white focus:outline-none" required />
              <input name="endDate" type="date" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:bg-white focus:outline-none" required />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-800">Group type</label>
            <select name="groupType" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:bg-white focus:outline-none" defaultValue="Couple">
              <option value="Couple">Couple</option>
              <option value="Family">Family</option>
              <option value="Friends">Friends</option>
              <option value="Corporate / Incentive">Corporate / Incentive</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-800">Interests</label>
            <input
              name="interests"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:bg-white focus:outline-none"
              placeholder="Sunset cruise, marine life, dining, wellness..."
              defaultValue={defaultInterests}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-800">Budget style</label>
            <select name="budgetStyle" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:bg-white focus:outline-none" defaultValue="Premium">
              <option value="Elevated essentials">Elevated essentials</option>
              <option value="Premium">Premium</option>
              <option value="Ultra / celebration">Ultra / celebration</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-800">Notes</label>
            <textarea
              rows={4}
              name="notes"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:bg-white focus:outline-none"
              placeholder="Allergies, must-see spots, celebration details, transfer needs..."
              defaultValue={defaultNotes}
            />
          </div>
          <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Sending...' : 'Start planning'}
            </button>
            <a href="/contact" className="text-sm font-semibold text-emerald-700">Need something custom later? Contact us →</a>
            <span className="text-xs text-slate-500">VIP human planning can be layered on later.</span>
          </div>
          {status === 'success' && (
            <div className="md:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Received — Shoreline AI is crafting your coastal plan.
            </div>
          )}
          {status === 'error' && (
            <div className="md:col-span-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage || 'Something went wrong. Please try again.'}
            </div>
          )}
        </form>
      </section>
    </div>
  )
}
