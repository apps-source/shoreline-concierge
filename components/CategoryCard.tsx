import Link from 'next/link'

const descriptions: Record<string, string> = {
  'Boat Tours': 'Slow days on the water with captains who know every cove.',
  'Fishing Charters': 'Early lines, patient crews, and docksiders worth bragging about.',
  'Sunset Cruises': 'Golden hour playlists, champagne, and glassy horizons.',
  'Dolphin Tours': 'Marine-life moments with guides who read the tides.',
  'Family Activities': 'Kid-happy, parent-relaxed, with snacks dialed in.',
  'Private Experiences': 'Space to yourself—no crowds, just your crew.',
  'Water Sports': 'Calm bays, quality gear, and easy takeoffs.',
  'Nightlife': 'Harborside suppers and after-dark hideaways we love.'
}

export default function CategoryCard({ title, href }: { title: string; href: string }) {
  const copy = descriptions[title] ?? 'Coastal picks curated by locals who live for the water.'

  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl bg-gradient-to-br from-white via-sand-50 to-ocean-50/30 p-4 shadow-md ring-1 ring-white/80 transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-50 to-sand-100 text-lg font-semibold text-emerald-900 ring-1 ring-white/70">
        {title[0]}
      </div>
      <div className="space-y-1">
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="text-sm text-slate-600 leading-relaxed">{copy}</div>
      </div>
      <span className="ml-auto text-ocean-600 transition group-hover:translate-x-1">→</span>
    </Link>
  )
}
