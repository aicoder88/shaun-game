'use client'

import { useState } from 'react'
import { IntroSlides } from '@/components/IntroSlides'
import { useRouter } from 'next/navigation'

export default function IntroPage() {
  const router = useRouter()
  const [showIntro, setShowIntro] = useState(true)

  const handleComplete = () => {
    setShowIntro(false)
    router.push('/menu')
  }

  if (!showIntro) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    )
  }

  return <IntroSlides onComplete={handleComplete} />
}
