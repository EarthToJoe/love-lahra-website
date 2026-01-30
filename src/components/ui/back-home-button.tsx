'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getRandomBackHomeEmoji } from '@/lib/emojis'

interface BackHomeButtonProps {
  className?: string
}

export function BackHomeButton({ className = '' }: BackHomeButtonProps) {
  const [emoji, setEmoji] = useState('😊') // Default fallback
  
  // Set random emoji on component mount and periodically
  useEffect(() => {
    const updateEmoji = () => {
      setEmoji(getRandomBackHomeEmoji())
    }
    
    // Set initial emoji
    updateEmoji()
    
    // Update emoji every 30 seconds for some fun variety
    const interval = setInterval(updateEmoji, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Also update emoji on click for immediate feedback
  const handleClick = () => {
    setEmoji(getRandomBackHomeEmoji())
  }
  
  return (
    <Link href="/" onClick={handleClick}>
      <button className={`text-gray-700 hover:text-primary-600 font-medium transition-colors ${className}`}>
        Back Home {emoji}
      </button>
    </Link>
  )
}