import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Affiliate Disclosure | Shoreline Concierge',
  description:
    'Learn how Shoreline Concierge uses affiliate links for coastal activities, excursions, and cruise-friendly travel bookings at no extra cost to you.',
  alternates: {
    canonical: '/affiliate'
  },
  openGraph: {
    title: 'Affiliate Disclosure | Shoreline Concierge',
    description:
      'Learn how Shoreline Concierge uses affiliate links for coastal activities, excursions, and cruise-friendly travel bookings at no extra cost to you.',
    url: '/affiliate',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Affiliate Disclosure | Shoreline Concierge',
    description:
      'Learn how Shoreline Concierge uses affiliate links for coastal activities, excursions, and cruise-friendly travel bookings at no extra cost to you.'
  }
}

const sections = [
  {
    title: 'What this means',
    body:
      'Shoreline Concierge is an affiliate website. Some links on the site may be affiliate links, which means Shoreline Concierge may earn a commission if you make a qualifying booking or purchase after clicking through.'
  },
  {
    title: 'How affiliate links work',
    body:
      'When you click a partner link and complete a qualifying booking, the partner may attribute that booking to Shoreline Concierge. This helps support the operation and continued improvement of the site.'
  },
  {
    title: 'No extra cost to you',
    body:
      'Using an affiliate link does not add extra cost to your booking. The price you see is determined by the booking partner, not by whether Shoreline Concierge receives a commission.'
  },
  {
    title: 'Why recommendations are included',
    body:
      'The goal of Shoreline Concierge is to make coastal trip planning simpler by helping travelers discover tours, excursions, boat trips, and other things to do near beach destinations in a more organized and useful way.'
  },
  {
    title: 'Questions or contact information',
    body:
      'If you have questions about this disclosure or how the website works, Shoreline Concierge will publish direct contact information soon.'
  }
]

export default function AffiliatePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-ocean-50 via-white to-sand-50 p-8 shadow-sm ring-1 ring-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:ring-white/10">
        <p className="text-sm uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Affiliate Disclosure</p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-900 dark:text-white">Affiliate Disclosure</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-700 dark:text-slate-300">
          Shoreline Concierge includes affiliate links so some bookings can help support the site at no additional cost to travelers.
        </p>
      </section>

      <section className="grid gap-4">
        {sections.map((section) => (
          <div key={section.title} className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-white/10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{section.title}</h2>
            <p className="mt-3 text-slate-600 leading-relaxed dark:text-slate-300">{section.body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl bg-slate-50 p-8 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800/80 dark:ring-white/10">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Helpful links</h2>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300">
            Start searching coastal activities
          </Link>
          <Link href="/about" className="font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300">
            Learn more about Shoreline Concierge
          </Link>
          <span className="font-medium text-slate-500 dark:text-slate-400">Contact information coming soon</span>
        </div>
      </section>
    </div>
  )
}
