'use client'

import { useState, useEffect } from 'react'

interface ImageData {
  id: string
  url: string
  alt: string
  title: string
  category: string
  uploadedAt: string
  size: number
}

interface UseImagesResult {
  images: ImageData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useImages(category?: string): UseImagesResult {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchImages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = category 
        ? `/api/images?category=${encodeURIComponent(category)}`
        : '/api/images'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch images')
      }
      
      const data = await response.json()
      setImages(data.images || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [category])

  return {
    images,
    loading,
    error,
    refetch: fetchImages
  }
}