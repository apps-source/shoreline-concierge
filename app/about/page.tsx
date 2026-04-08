import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Shoreline Concierge | Coastal Trips, Cruise Excursions, and Better Travel Planning',
  description:
    'Learn why Shoreline Concierge was created and how it helps travelers find beach activities, excursions, cruise-friendly tours, and memorable coastal experiences more easily.',
  alternates: {
    canonical: '/about'
  },
  openGraph: {
    title: 'About Shoreline Concierge | Coastal Trips, Cruise Excursions, and Better Travel Planning',
    description:
      'Learn why Shoreline Concierge was created and how it helps travelers find beach activities, excursions, cruise-friendly tours, and memorable coastal experiences more easily.',
    url: '/about',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Shoreline Concierge | Coastal Trips, Cruise Excursions, and Better Travel Planning',
    description:
      'Learn why Shoreline Concierge was created and how it helps travelers find beach activities, excursions, cruise-friendly tours, and memorable coastal experiences more easily.'
  }
}

export default function About() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-ocean-50 via-white to-sand-50 p-8 shadow-sm ring-1 ring-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:ring-white/10">
        <p className="text-sm uppercase tracking-wide text-emerald-800 dark:text-emerald-300">About Shoreline Concierge</p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-900 dark:text-white">Plan less. Experience more.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-700 dark:text-slate-300">
          Shoreline Concierge helps travelers discover things to do near beach destinations, including tours, excursions, boat trips,
          water activities, and family-friendly experiences.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-white/10">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">What Shoreline Concierge helps with</h2>
          <div className="mt-5 space-y-4 text-slate-600 dark:text-slate-300">
            <p>
              This site is designed for travelers who know where they want to go, but do not want to waste hours figuring out what to
              do once they get there.
            </p>
            <p>
              Shoreline focuses on beach activities, excursions, boat tours, dolphin cruises, fishing charters, water adventures,
              romantic outings, and family-friendly experiences that can make a coastal trip feel more memorable.
            </p>
            <p>
              Instead of bouncing between scattered tabs and listings, travelers can use Shoreline to search destinations, compare
              options, and quickly understand what kinds of experiences are available near the coast.
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm ring-1 ring-white/10">
          <h2 className="text-2xl font-semibold">Why it exists</h2>
          <div className="mt-5 space-y-4 text-slate-200">
            <p>
              Shoreline Concierge was created from a simple idea: planning a beach trip should be exciting, easy, and full of
              possibility, not frustrating, overwhelming, or limited to whatever happens to show up first.
            </p>
            <p>
              Too often, travelers know the beach destination they want to visit, but they do not know how many worthwhile things they
              can actually do nearby.
            </p>
            <p>
              That gap between choosing the destination and discovering the best experiences is what inspired Shoreline Concierge.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-white/10">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">The story behind the site</h2>
        <div className="mt-5 space-y-5 text-slate-600 dark:text-slate-300">
          <p>
            I built this website because I believe there is not enough exposure for many of the incredible experiences available in
            coastal destinations. From sunset cruises and snorkeling trips to fishing charters, family activities, and hidden local
            gems, there is often far more available than most travelers ever realize.
          </p>
          <p>
            My goal is to help make coastal trip planning easier by bringing activities, excursions, and trusted booking options into
            one place. I want Shoreline Concierge to help people discover options they may not have known existed and make the process
            feel faster, clearer, and less confusing.
          </p>
          <p>
            I care about building a successful business, but I also genuinely enjoy simplifying things for travelers who just want a
            better way to plan a beach trip. If this site saves someone time, reduces confusion, or helps them find a memorable
            experience they might have otherwise missed, then it is doing exactly what I built it to do.
          </p>
        </div>
      </section>

      <section className="rounded-3xl bg-slate-50 p-8 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800/80 dark:ring-white/10">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Who Shoreline Concierge is for</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-100 dark:bg-slate-900/70 dark:ring-white/10">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Beach vacation planners</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Travelers who already know the destination but want help finding the best things to do nearby.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-100 dark:bg-slate-900/70 dark:ring-white/10">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Families, couples, and groups</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              People looking for activities that fit the pace, occasion, and style of their trip.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-100 dark:bg-slate-900/70 dark:ring-white/10">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Travelers short on time</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Anyone who wants a simpler way to compare beach experiences without digging through endless pages.
            </p>
          </div>
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
    </div>
  )
}
