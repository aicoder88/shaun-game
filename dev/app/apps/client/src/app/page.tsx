'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/menu')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-black">
      <div className="text-white text-xl">Loading Murder on the Bullet Express...</div>
    </div>
  )
}