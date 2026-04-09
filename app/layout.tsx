import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ServiceWorkerRegistrar from '../components/ServiceWorkerRegistrar'

export const metadata: Metadata = {
  metadataBase: new URL('https://shorelineconcierge.travel'),
  title: {
    default: 'Shoreline Concierge | Beach Activities, Excursions, and Cruise-Friendly Things To Do',
    template: '%s | Shoreline Concierge'
  },
  description:
    'Search beach activities, excursions, shore excursions, and trusted booking options for beach trips, cruise ports, and waterfront destinations.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    siteName: 'Shoreline Concierge',
    locale: 'en_US',
    type: 'website',
    title: 'Shoreline Concierge | Beach Activities, Excursions, and Cruise-Friendly Things To Do',
    description:
      'Search beach activities, excursions, shore excursions, and trusted booking options for beach trips, cruise ports, and waterfront destinations.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shoreline Concierge | Beach Activities, Excursions, and Cruise-Friendly Things To Do',
    description:
      'Search beach activities, excursions, shore excursions, and trusted booking options for beach trips, cruise ports, and waterfront destinations.'
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Header />
        <main className="container py-8 sm:py-10">{children}</main>
        <Footer />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
