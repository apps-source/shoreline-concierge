import type { Metadata } from 'next'
import Link from 'next/link'
import DestinationLinkCard from '../../components/DestinationLinkCard'
import { cruisePortGroups } from '../../data/cruisePorts'

export const metadata: Metadata = {
  title: 'Cruise Excursions for Popular Ports of Call',
  description:
    'Find top-rated shore excursions, beach days, snorkeling trips, sightseeing tours, and easy port-day experiences for the cruise stops travelers book most.',
  alternates: {
    canonical: '/cruise-excursions'
  },
  openGraph: {
    title: 'Cruise Excursions for Popular Ports of Call',
    description:
      'Find top-rated shore excursions, beach days, snorkeling trips, sightseeing tours, and easy port-day experiences for the cruise stops travelers book most.',
    url: '/cruise-excursions',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cruise Excursions for Popular Ports of Call',
    description:
      'Find top-rated shore excursions, beach days, snorkeling trips, sightseeing tours, and easy port-day experiences for the cruise stops travelers book most.'
  }
}

const cruiseTrustPoints = [
  'Popular port-of-call destinations in one place',
  'Beach clubs, snorkeling, sightseeing, and easy day-trip ideas',
  'Trusted partner inventory that is simple to browse before booking'
]

export default function CruiseExcursionsPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-ocean-50 via-white to-sand-50 p-8 shadow-sm ring-1 ring-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:ring-white/10">
        <p className="text-sm uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Cruise Excursions</p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-900 dark:text-white">Cruise Excursions for Popular Ports of Call</h1>
        <p className="mt-4 max-w-4xl text-lg leading-relaxed text-slate-700 dark:text-slate-300">
          Find top-rated shore excursions, beach days, snorkeling trips, sightseeing tours, and easy port-day experiences for the cruise
          stops travelers book most.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300">
            Back to Shoreline search
          </Link>
          <Link href="/contact" className="font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300">
            Contact Shoreline Concierge
          </Link>
        </div>
      </section>

      {cruisePortGroups.map((group) => (
        <section key={group.title} className="rounded-3xl bg-white/90 p-8 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-white/10">
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">{group.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{group.description}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {group.items.map((port) => (
              <DestinationLinkCard
                key={port.slug}
                href={port.href}
                name={port.name}
                subtitle={port.subtitle}
                badge={group.title}
                imageSrc={port.imageSrc}
              />
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-3xl bg-slate-50 p-8 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800/80 dark:ring-white/10">
        <p className="text-sm uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Why Use Shoreline Concierge for Cruise Stops</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">What you&apos;ll find</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {cruiseTrustPoints.map((point) => (
            <div key={point} className="rounded-2xl bg-white p-5 ring-1 ring-slate-100 dark:bg-slate-900/70 dark:ring-white/10">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{point}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Cruise port photography is pulled from openly licensed Wikimedia Commons images when available.
        </p>
      </section>
    </div>
  )
}
