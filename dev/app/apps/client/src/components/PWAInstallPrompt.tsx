'use client'

import { useState } from 'react'
import { Download, X } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'

export function PWAInstallPrompt() {
  const [dismissed, setDismissed] = useState(false)
  const { isInstallable, installApp } = usePWA()

  if (!isInstallable || dismissed) {
    return null
  }

  const handleInstall = async () => {
    const installed = await installApp()
    if (!installed) {
      setDismissed(true)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    // Store dismissal in localStorage to avoid showing again soon
    localStorage.setItem('pwa-dismissed', Date.now().toString())
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:w-80">
      <div className="bg-gradient-to-r from-steampunk-bronze to-steampunk-brass p-4 rounded-lg shadow-lg border border-steampunk-copper">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <Download className="w-5 h-5 text-black mr-2" />
            <h3 className="font-bold text-black text-sm">Install Game</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-black/70 hover:text-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-black/80 text-xs mb-3">
          Install Murder on the Bullet Express for the best experience - play offline and get faster loading!
        </p>
        
        <div className="flex space-x-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-black/20 hover:bg-black/30 text-black font-medium py-2 px-3 rounded text-sm transition-colors"
          >
            Install Now
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-black/70 hover:text-black text-sm"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}