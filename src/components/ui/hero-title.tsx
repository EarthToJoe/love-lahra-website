'use client'

import { useState, useEffect } from 'react'
import { getHeroTitle } from '@/lib/emojis'

interface HeroTitleProps {
  className?: string
  id?: string
}

export function HeroTitle({ className = '', id }: HeroTitleProps) {
  const [title, setTitle] = useState("Hey, it's Lahra 💁‍♀️") // Default fallback
  
  useEffect(() => {
    const updateTitle = () => {
      setTitle(getHeroTitle())
    }
    
    // Set initial title
    updateTitle()
    
    // Update title when emoji config changes (in a real app, this would listen to config changes)
    const interval = setInterval(updateTitle, 5000) // Check for updates every 5 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <h1 className={className} id={id}>
      {title}
    </h1>
  )
}