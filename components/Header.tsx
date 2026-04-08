"use client"
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Header(){
  const [open, setOpen] = useState(false)
  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:block">
            <Image
              src="/brand/shoreline-main-logo-no-white.png"
              alt="Shoreline Concierge"
              width={360}
              height={92}
              className="h-12 w-[240px] object-cover object-left"
              priority
            />
          </div>
          <div className="sm:hidden">
            <Image
              src="/brand/shoreline-icon-compass.png"
              alt="Shoreline Concierge"
              width={44}
              height={44}
              className="h-12 w-12 object-contain"
              priority
            />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm">Home</Link>
          <Link href="/about" className="text-sm">About</Link>
          <Link href="/affiliate" className="text-sm">Affiliate</Link>
        </nav>

        <button onClick={()=>setOpen(!open)} className="md:hidden p-2">
          <span className="sr-only">Toggle menu</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="#0e7ea6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t">
          <div className="container py-4 flex flex-col gap-3">
            <Link href="/" className="text-base">Home</Link>
            <Link href="/about" className="text-base">About</Link>
            <Link href="/affiliate" className="text-base">Affiliate</Link>
          </div>
        </div>
      )}
    </header>
  )
}
