'use client'

import dynamic from 'next/dynamic'

const ConductorPageClient = dynamic(() => import('@/components/ConductorPageClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-black">
      <div className="text-white text-xl">Loading conductor dashboard...</div>
    </div>
  )
})

export default function ConductorPage() {
  return <ConductorPageClient />
}