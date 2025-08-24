'use client'

import dynamic from 'next/dynamic'

const PlayPageClient = dynamic(() => import('@/components/PlayPageClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-black">
      <div className="text-white text-xl">Boarding the Bullet Express...</div>
    </div>
  )
})

export default function PlayPage() {
  return <PlayPageClient />
}