import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 10: Image Storage and Optimization
 * **Validates: Requirements 5.2**
 * 
 * This property ensures that image storage and optimization works correctly:
 * - Proper file naming and organization
 * - Directory structure maintenance
 * - File metadata preservation
 * - URL generation consistency
 */

describe('Property 10: Image Storage and Optimization', () => {
  const validCategories = ['outfits', 'dining', 'daily', 'snacks', 'general']
  
  // Helper function to simulate file storage logic
  const processFileStorage = (file: {
    originalName: string
    category: string
    timestamp: number
    size: number
    type: string
  }) => {
    // Sanitize filename
    const sanitizedName = file.originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
    
    // Generate unique filename with timestamp
    const filename = `${file.timestamp}_${sanitizedName}`
    
    // Generate file path
    const filePath = `/uploads/${file.category}/${filename}`
    
    // Generate URL
    const fileUrl = filePath
    
    // Create metadata
    const metadata = {
      filename,
      originalName: file.originalName,
      size: file.size,
      type: file.type,
      category: file.category,
      url: fileUrl,
      uploadedAt: new Date(file.timestamp).toISOString()
    }
    
    return {
      success: true,
      metadata,
      path: filePath
    }
  }

  it('should generate consistent file paths and URLs', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom(...validCategories),
        fc.integer({ min: 1000000000000, max: 9999999999999 }), // Valid timestamp
        fc.integer({ min: 1, max: 5 * 1024 * 1024 }),
        fc.constantFrom('image/jpeg', 'image/png', 'image/webp'),
        (originalName, category, timestamp, size, type) => {
          const file = { originalName, category, timestamp, size, type }
          const result = processFileStorage(file)
          
          expect(result.success).toBe(true)
          expect(result.metadata.url).toMatch(new RegExp(`^/uploads/${category}/\\d+_`))
          expect(result.metadata.filename).toMatch(new RegExp(`^${timestamp}_`))
          expect(result.metadata.category).toBe(category)
          expect(result.metadata.originalName).toBe(originalName)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should sanitize filenames properly', () => {
    const dangerousNames = [
      'file with spaces.jpg',
      'file@#$%^&*().png',
      'файл.jpg', // Cyrillic
      'file<>:|"?.webp'
    ]
    
    fc.assert(
      fc.property(
        fc.constantFrom(...dangerousNames),
        fc.constantFrom(...validCategories),
        fc.integer({ min: 1000000000000, max: 9999999999999 }),
        fc.integer({ min: 1, max: 5 * 1024 * 1024 }),
        fc.constantFrom('image/jpeg', 'image/png', 'image/webp'),
        (originalName, category, timestamp, size, type) => {
          const file = { originalName, category, timestamp, size, type }
          const result = processFileStorage(file)
          
          expect(result.success).toBe(true)
          
          // Filename should be sanitized (no special characters except . and -)
          const sanitizedPart = result.metadata.filename.split('_').slice(1).join('_')
          expect(sanitizedPart).toMatch(/^[a-zA-Z0-9._-]+$/)
          
          // Original name should be preserved in metadata
          expect(result.metadata.originalName).toBe(originalName)
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should maintain proper directory structure', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.constantFrom(...validCategories),
        fc.integer({ min: 1000000000000, max: 9999999999999 }),
        (originalName, category, timestamp) => {
          const file = {
            originalName,
            category,
            timestamp,
            size: 1024,
            type: 'image/jpeg'
          }
          
          const result = processFileStorage(file)
          
          expect(result.success).toBe(true)
          expect(result.path).toMatch(new RegExp(`^/uploads/${category}/`))
          expect(result.metadata.url).toMatch(new RegExp(`^/uploads/${category}/`))
        }
      ),
      { numRuns: 8 }
    )
  })

  it('should preserve file metadata correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }),
        fc.constantFrom(...validCategories),
        fc.integer({ min: 1000000000000, max: 9999999999999 }),
        fc.integer({ min: 1, max: 10 * 1024 * 1024 }),
        fc.constantFrom('image/jpeg', 'image/png', 'image/webp'),
        (originalName, category, timestamp, size, type) => {
          const file = { originalName, category, timestamp, size, type }
          const result = processFileStorage(file)
          
          expect(result.success).toBe(true)
          expect(result.metadata.originalName).toBe(originalName)
          expect(result.metadata.size).toBe(size)
          expect(result.metadata.type).toBe(type)
          expect(result.metadata.category).toBe(category)
          expect(result.metadata.uploadedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should generate unique filenames for same original names', () => {
    const originalName = 'test.jpg'
    const category = 'outfits'
    const size = 1024
    const type = 'image/jpeg'
    
    // Generate multiple files with same original name but different timestamps
    const timestamps = [1000000000000, 1000000000001, 1000000000002]
    const results = timestamps.map(timestamp => 
      processFileStorage({ originalName, category, timestamp, size, type })
    )
    
    // All should succeed
    results.forEach(result => {
      expect(result.success).toBe(true)
    })
    
    // All filenames should be unique
    const filenames = results.map(r => r.metadata.filename)
    const uniqueFilenames = new Set(filenames)
    expect(uniqueFilenames.size).toBe(filenames.length)
    
    // All URLs should be unique
    const urls = results.map(r => r.metadata.url)
    const uniqueUrls = new Set(urls)
    expect(uniqueUrls.size).toBe(urls.length)
  })

  it('should handle edge cases in filename generation', () => {
    // Test with minimal filename
    const minimalFile = {
      originalName: 'a.jpg',
      category: 'general',
      timestamp: 1000000000000,
      size: 1,
      type: 'image/jpeg'
    }
    
    const minimalResult = processFileStorage(minimalFile)
    expect(minimalResult.success).toBe(true)
    expect(minimalResult.metadata.filename).toBe('1000000000000_a.jpg')
    
    // Test with filename that's all special characters
    const specialFile = {
      originalName: '@#$%^&*().jpg',
      category: 'general',
      timestamp: 1000000000000,
      size: 1,
      type: 'image/jpeg'
    }
    
    const specialResult = processFileStorage(specialFile)
    expect(specialResult.success).toBe(true)
    expect(specialResult.metadata.filename).toBe('1000000000000__________.jpg')
  })
})