import Link from 'next/link'
import Image from 'next/image'

export default function Footer(){
  return (
    <footer className="bg-white/70 border-t mt-10 backdrop-blur">
      <div className="container py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Image
            src="/brand/shoreline-main-logo-no-white.png"
            alt="Shoreline Concierge"
            width={320}
            height={82}
            className="h-12 w-[240px] object-cover object-left"
          />
          <div className="text-sm text-slate-600 mt-3 max-w-sm">Find better beach experiences faster, then book through trusted partners.</div>
        </div>

        <div className="flex flex-col">
          <div className="font-medium">Pages</div>
          <Link href="/" className="text-sm mt-2">Home</Link>
          <Link href="/cruise-excursions" className="text-sm mt-1">Cruise Excursions</Link>
          <Link href="/about" className="text-sm mt-1">About Shoreline</Link>
          <Link href="/contact" className="text-sm mt-1">Contact</Link>
          <Link href="/affiliate" className="text-sm mt-1">Affiliate Disclosure</Link>
        </div>

        <div className="flex flex-col">
          <div className="font-medium">Contact</div>
          <a href="mailto:contactus@shorelineconcierge.travel" className="text-sm mt-2 text-slate-600 hover:text-emerald-700">
            contactus@shorelineconcierge.travel
          </a>
          <div className="text-sm mt-1">© {new Date().getFullYear()} Shoreline Concierge</div>
        </div>
      </div>
    </footer>
  )
}
