"use client"
import { useEffect } from 'react'

export default function ServiceWorkerRegistrar(){
  useEffect(()=>{
    const isProd = process.env.NODE_ENV === 'production'

    if (!('serviceWorker' in navigator)) return

    if (isProd) {
      navigator.serviceWorker.register('/sw.js').catch(err=>{
        // fail silently if sw not available
        console.debug('SW registration failed:', err)
      })
      return
    }

    // In dev, ensure no SW remains registered to avoid stale caching on localhost
    navigator.serviceWorker.getRegistrations?.().then(regs => {
      regs.forEach(reg => reg.unregister().catch(()=>{}))
    }).catch(()=>{})
  },[])

  return null
}
