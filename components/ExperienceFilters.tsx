"use client"
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

type Props = {
  categories: string[]
  destinations: string[]
  selectedCategory?: string | null
  selectedDestination?: string | null
  selectedDestinationName?: string | null
}

export default function ExperienceFilters({ categories, destinations, selectedCategory, selectedDestination, selectedDestinationName }: Props){
  const router = useRouter()
  const searchParams = useSearchParams()
  const showCategoryFilter = categories.length > 1
  const showDestinationFilter = !selectedDestinationName && destinations.length > 1
  const showReset = showCategoryFilter || showDestinationFilter

  if (!showCategoryFilter && !showDestinationFilter && !showReset) {
    return null
  }

  const update = (key: string, value?: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    if (value) params.set(key, value)
    else params.delete(key)
    const qs = params.toString()
    router.push(`/experiences${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-100 sm:flex-row sm:items-end sm:gap-4">
      {showCategoryFilter ? (
        <div className="w-full sm:w-64">
          <label className="block text-sm font-semibold text-slate-800">Category</label>
          <select
            value={selectedCategory ?? ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update('category', e.target.value || undefined)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      ) : null}

      {showDestinationFilter ? (
        <div className="w-full sm:w-64">
          <label className="block text-sm font-semibold text-slate-800">Destination</label>
          <select
            value={selectedDestination ?? ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update('destination', e.target.value || undefined)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All destinations</option>
            {destinations.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      ) : null}

      {showReset ? (
        <div className="flex gap-2 sm:mt-0">
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams?.toString() ?? '')
              params.delete('category')
              params.delete('destination')
              params.delete('destinationName')
              params.delete('q')
              const qs = params.toString()
              router.push(`/experiences${qs ? `?${qs}` : ''}`)
            }}
            className="rounded-full border border-emerald-900/15 px-4 py-3 text-sm font-semibold text-emerald-900 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Reset filters
          </button>
        </div>
      ) : null}
    </div>
  )
}
