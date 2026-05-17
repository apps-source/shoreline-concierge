import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use — Shoreline Concierge',
  description: 'Terms of use for Shoreline Concierge. Basic terms about site information and affiliate relationships.',
  alternates: { canonical: '/terms' },
  openGraph: { title: 'Terms of Use — Shoreline Concierge', description: 'Terms of use for Shoreline Concierge.', url: '/terms', type: 'website' }
}

export default function TermsPage(){
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-3xl font-semibold">Terms of Use</h1>
        <p className="mt-3 text-sm text-slate-700">Last updated: May 2026</p>
        <p className="mt-4 text-sm text-slate-600">Shoreline Concierge provides informational content about beach activities, excursions, and booking partners. By using the site you agree to these terms.</p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-xl font-semibold">Affiliate and booking partners</h2>
        <p className="mt-2 text-sm text-slate-600">Shoreline may link to third-party booking partners. Bookings and payments are processed by the partner and are subject to their terms and policies.</p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-xl font-semibold">No guarantees</h2>
        <p className="mt-2 text-sm text-slate-600">Information on Shoreline Concierge is provided for convenience. We do not guarantee availability, pricing, or accuracy of third-party listings.</p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="mt-2 text-sm text-slate-600">Questions: <a className="text-emerald-700" href="mailto:contactus@shorelineconcierge.travel">contactus@shorelineconcierge.travel</a>.</p>
      </section>
    </div>
  )
}
