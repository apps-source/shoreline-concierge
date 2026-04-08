import { destinations } from '../../../data/destinations'
import { experiences } from '../../../data/experiences'

type Props = { params: { slug: string } }

export default function DestinationPage({ params }: Props){
  const dest = destinations.find(d=> d.slug === params.slug)
  if (!dest) return <div>Destination not found</div>

  const list = experiences.filter(e=> e.destination === dest.slug)
  const featured = list[0]

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-50 via-white to-sand-50 p-8 ring-1 ring-emerald-50 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-wide text-emerald-800">Destination</p>
          <h1 className="text-4xl font-semibold text-slate-900">{dest.name}</h1>
          <p className="text-lg text-slate-600 leading-relaxed">{dest.subtitle}</p>
          <p className="text-base text-slate-700 leading-relaxed">{dest.intro}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href="/plan" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">Plan with Shoreline AI</a>
            <a href="#experiences" className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:border-emerald-300">Browse experiences</a>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Destination highlights">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="text-sm uppercase tracking-wide text-emerald-700">Best for</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {dest.bestFor?.map(item => <li key={item} className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />{item}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="text-sm uppercase tracking-wide text-emerald-700">Vibe</div>
          <p className="mt-3 text-sm text-slate-700 leading-relaxed">{dest.vibe}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="text-sm uppercase tracking-wide text-emerald-700">Popular activities</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {dest.popularActivities?.map(item => <li key={item} className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />{item}</li>)}
          </ul>
        </div>
      </section>

      {featured && (
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-emerald-800">Featured experience</p>
              <h2 className="text-2xl font-semibold text-slate-900">{featured.title}</h2>
              <p className="text-slate-600 mt-2 max-w-2xl">{featured.excerpt}</p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">From {featured.price}</span>
              <a href={`/experiences/${featured.slug}`} className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700">View experience</a>
              <a href="/plan" className="inline-flex items-center justify-center rounded-full border border-emerald-200 px-4 py-2 font-semibold text-emerald-700 hover:border-emerald-300">Plan with Shoreline AI</a>
            </div>
          </div>
        </section>
      )}

      <section id="experiences" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-wide text-emerald-800">Experiences in {dest.name}</p>
            <h3 className="text-2xl font-semibold text-slate-900">Pick, personalize, and we’ll confirm</h3>
            <p className="text-slate-600">Choose an outing or tell us your dates — we’ll coordinate captains, dining, and transfers.</p>
          </div>
          <a href="/plan" className="text-sm font-semibold text-emerald-700">Need ideas? Ask Shoreline AI →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {list.map(e=> (
            <div key={e.slug} className="card p-4 flex flex-col gap-2">
              <div className="font-semibold text-slate-900">{e.title}</div>
              <div className="text-sm text-slate-600">{e.excerpt}</div>
              <div className="text-sm font-semibold text-emerald-700">{e.price}</div>
              <div className="flex gap-2 pt-1">
                <a href={`/experiences/${e.slug}`} className="text-sm font-semibold text-emerald-700">View</a>
                <span className="text-slate-300">•</span>
                <a href="/plan" className="text-sm font-semibold text-emerald-700">Plan with Shoreline AI</a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
