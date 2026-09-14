import { NextRequest, NextResponse } from 'next/server'

import { readdir, stat } from 'fs/promises'

import { join } from 'path'
import { UPLOAD_DIR } from '@/lib/uploads'
import { existsSync } from 'fs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!existsSync(UPLOAD_DIR)) {
      return NextResponse.json({ images: [] })
    }

    const images: Array<{
      id: string
      url: string
      alt: string
      title: string
      category: string
      uploadedAt: string
      size: number
    }> = []

    // Get categories to scan
    const categoriesToScan = category ? [category] : ['outfits', 'dining', 'daily', 'snacks', 'general']

    for (const cat of categoriesToScan) {
      const categoryDir = join(UPLOAD_DIR, cat)
      
      if (!existsSync(categoryDir)) continue

      try {
        const files = await readdir(categoryDir)
        
        for (const file of files) {
          if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
            const filePath = join(categoryDir, file)
            const stats = await stat(filePath)
            
            // Extract timestamp and original name from filename
            const parts = file.split('_')
            const timestamp = parts[0]
            const originalName = parts.slice(1).join('_').replace(/\.(jpg|jpeg|png|webp)$/i, '')
            
            images.push({
              id: `${cat}_${timestamp}`,
              url: `/uploads/${cat}/${file}`,
              alt: originalName || 'Uploaded image',
              title: originalName || 'Untitled',
              category: cat,
              uploadedAt: new Date(parseInt(timestamp)).toISOString(),
              size: stats.size
            })
          }
        }
      } catch (error) {
        console.error(`Error reading category ${cat}:`, error)
      }
    }

    // Sort by upload date (newest first)
    images.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json({ images })

  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}
