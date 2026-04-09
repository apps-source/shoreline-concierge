import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Shoreline Concierge',
  description:
    'Questions, partnership inquiries, or help planning your beach getaway? Contact Shoreline Concierge for general questions, business inquiries, and site support.',
  alternates: {
    canonical: '/contact'
  },
  openGraph: {
    title: 'Contact Shoreline Concierge',
    description:
      'Questions, partnership inquiries, or help planning your beach getaway? Contact Shoreline Concierge for general questions, business inquiries, and site support.',
    url: '/contact',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Shoreline Concierge',
    description:
      'Questions, partnership inquiries, or help planning your beach getaway? Contact Shoreline Concierge for general questions, business inquiries, and site support.'
  }
}

const supportTopics = [
  'General questions',
  'Partnership opportunities',
  'Affiliate or business inquiries',
  'Help navigating the site'
]

export default function Contact() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-ocean-50 via-white to-sand-50 p-8 shadow-sm ring-1 ring-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:ring-white/10">
        <p className="text-sm uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Contact Shoreline Concierge</p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-900 dark:text-white">Contact Shoreline Concierge</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-700 dark:text-slate-300">
          Questions, partnership inquiries, or need help planning your beach getaway? We&apos;d love to hear from you.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-white/10">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Email us</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            For the fastest response, send a note to our business inbox and include any destination or trip details that would help.
          </p>
          <a
            href="mailto:contactus@shorelineconcierge.travel"
            className="mt-5 inline-flex rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            contactus@shorelineconcierge.travel
          </a>
        </div>

        <div className="rounded-3xl bg-slate-50 p-8 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800/80 dark:ring-white/10">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">We can help with</h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {supportTopics.map((topic) => (
              <li key={topic} className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
