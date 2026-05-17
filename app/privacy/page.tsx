import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Shoreline Concierge',
  description: 'Privacy policy for Shoreline Concierge. Learn what data is collected and how it is used.',
  alternates: { canonical: '/privacy' },
  openGraph: { title: 'Privacy Policy — Shoreline Concierge', description: 'Privacy policy for Shoreline Concierge.', url: '/privacy', type: 'website' }
}

export default function PrivacyPage(){
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-700">Last updated: May 2026</p>
        <p className="mt-4 text-sm text-slate-600">Shoreline Concierge respects your privacy. This page explains what information we collect and how we use it.</p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-xl font-semibold">Information we collect</h2>
        <p className="mt-2 text-sm text-slate-600">We may collect information you provide directly (e.g. email addresses when you contact us) and non-personal analytics data to improve the site.</p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-xl font-semibold">Cookies and analytics</h2>
        <p className="mt-2 text-sm text-slate-600">We use standard analytics and cookies to understand site usage. No personal data is sold. Third-party partners (booking providers) may use their own cookies when you click through.</p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-xl font-semibold">Affiliate links and third parties</h2>
        <p className="mt-2 text-sm text-slate-600">Some links on this site are affiliate links to third-party booking providers. If you complete a booking, the partner handles payment and may collect information under their policies.</p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="mt-2 text-sm text-slate-600">Questions? Email <a className="text-emerald-700" href="mailto:contactus@shorelineconcierge.travel">contactus@shorelineconcierge.travel</a>.</p>
      </section>

      <section className="text-sm text-slate-500">This is a starter privacy policy. Consider consulting legal counsel for a full policy tailored to your business.</section>
    </div>
  )
}
