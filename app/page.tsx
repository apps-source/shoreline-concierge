import type { Metadata } from 'next'
import Link from 'next/link'
import PlannerHero from '../components/PlannerHero'
import { destinations } from '../data/destinations'
import { coastalDestinationTiers, featuredActivityTypes, homeFaqs, howItWorksSteps } from '../data/site-content'

export const metadata: Metadata = {
  title: 'Things to Do for Coastal Vacations, Shore Excursions, and Cruise Stops',
  description:
    'Find tours, excursions, shore excursions, and beach activities for your next coastal trip or cruise stop. Search destinations, compare options, and book through trusted partners.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Things to Do for Coastal Vacations, Shore Excursions, and Cruise Stops',
    description:
      'Find tours, excursions, shore excursions, and beach activities for your next coastal trip or cruise stop. Search destinations, compare options, and book through trusted partners.',
    url: '/',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Things to Do for Coastal Vacations, Shore Excursions, and Cruise Stops',
    description:
      'Find tours, excursions, shore excursions, and beach activities for your next coastal trip or cruise stop. Search destinations, compare options, and book through trusted partners.'
  }
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: homeFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
}

export default async function Home() {
  return (
    <div className="space-y-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PlannerHero destinations={destinations} featured={[]} />

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl bg-white/90 p-8 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-white/10">
          <p className="text-sm uppercase tracking-wide text-emerald-700 dark:text-emerald-300">What You Can Find</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Beach activities and excursions worth your trip</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Shoreline Concierge helps travelers find things to do near beach destinations without digging through scattered listings.
            Search for dolphin cruises, boat tours, fishing charters, snorkeling trips, family-friendly activities, romantic
            excursions, beach experiences, and other highly rated things to do for a coastal vacation.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {featuredActivityTypes.map((item) => (
              <span
                key={item}
                className="rounded-full bg-emerald-50 px-3 py-2 text-sm text-emerald-900 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-400/20"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-sm ring-1 ring-white/10">
          <p className="text-sm uppercase tracking-wide text-emerald-200">Why It Helps</p>
          <h2 className="mt-2 text-2xl font-semibold">A clearer way to plan what to do near the beach</h2>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            Instead of bouncing between tabs, Shoreline gives you one place to search coastal activities, compare options, and click
            through to trusted booking partners.
          </p>
          <div className="mt-6 space-y-3 text-sm text-slate-100/90">
            <p>Useful for family vacations, couples getaways, group trips, and quick weekends by the water.</p>
            <p>Helpful when you know where you are staying but still need to figure out the best things to do nearby.</p>
            <p>
              <Link href="/about" className="font-medium text-emerald-200 underline-offset-4 hover:underline">
                Learn more about Shoreline Concierge
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white/90 p-8 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-white/10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Destinations We Help With</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Need help finding a destination?</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            We keep track of some of the most searched coastal destinations so it is easier to compare popular places and decide where
            you might want to go next.
          </p>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {coastalDestinationTiers.map((tier) => (
            <div key={tier.title} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100 dark:bg-slate-800/80 dark:ring-white/10">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{tier.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{tier.description}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {tier.destinations.map((destination) => (
                  <div
                    key={destination}
                    className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-800 ring-1 ring-slate-100 dark:bg-slate-900/70 dark:text-slate-100 dark:ring-white/10"
                  >
                    {destination}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white/90 p-8 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-white/10">
        <p className="text-sm uppercase tracking-wide text-emerald-700 dark:text-emerald-300">How It Works</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Three simple steps to find coastal activities</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {howItWorksSteps.map((step, index) => (
            <div key={step.title} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100 dark:bg-slate-800/80 dark:ring-white/10">
              <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">0{index + 1}</div>
              <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300">
            Start searching coastal activities
          </Link>
          <Link href="/affiliate" className="font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300">
            Read our affiliate disclosure
          </Link>
        </div>
      </section>

      <section className="rounded-3xl bg-white/90 p-8 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-white/10">
        <p className="text-sm uppercase tracking-wide text-emerald-700 dark:text-emerald-300">FAQ</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Questions travelers often ask</h2>
        <div className="mt-6 space-y-4">
          {homeFaqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100 dark:bg-slate-800/80 dark:ring-white/10">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{faq.question}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
