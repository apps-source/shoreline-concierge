'use client'

import { useEffect, useRef } from 'react'

type BackToResultsButtonProps = {
  href: string
}

export default function BackToResultsButton({ href }: BackToResultsButtonProps) {
  const isNavigatingRef = useRef(false)

  useEffect(() => {
    const marker = '__shorelineReturnGuard'

    if (!window.history.state?.[marker]) {
      window.history.pushState(
        { ...(window.history.state || {}), [marker]: href },
        '',
        window.location.href
      )
    }

    const handlePopState = () => {
      if (isNavigatingRef.current) return
      isNavigatingRef.current = true
      window.location.replace(href)
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [href])

  return (
    <button
      type="button"
      onClick={() => {
        isNavigatingRef.current = true
        window.location.assign(href)
      }}
      className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 dark:text-white dark:ring-white/10"
    >
      Back to results
    </button>
  )
}
