'use client'

type BookNowButtonProps = {
  href: string
  title: string
  productCode?: string
  destination?: string | null
}

function trackClick(payload: Record<string, string>) {
  const body = JSON.stringify(payload)

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([body], { type: 'application/json' })
    navigator.sendBeacon('/api/track/book-click', blob)
    return
  }

  void fetch('/api/track/book-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(() => {})
}

export default function BookNowButton({ href, title, productCode, destination }: BookNowButtonProps) {
  return (
    <a
      href={href}
      rel="noreferrer"
      onClick={() =>
        trackClick({
          href,
          title,
          productCode: productCode || '',
          destination: destination || '',
          source: 'experience-detail'
        })
      }
      className="block w-full rounded-full bg-emerald-900 px-4 py-3 text-center text-white font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      Book now
    </a>
  )
}
