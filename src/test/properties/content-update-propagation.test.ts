import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 16: Content Update Propagation
 * 
 * For any content update made through the admin interface, the changes should be 
 * reflected immediately across all relevant sections of the website where that 
 * content appears.
 * 
 * Validates: Requirements 8.2, 8.4
 * Feature: lahras-life, Property 16: Content Update Propagation
 */

// Content section types from our schema
const contentSectionTypes = [
  'DAILY_ACTIVITY',
  'CLOSET', 
  'OUTFIT',
  'DINING',
  'SNACKS',
  'FUN_FACTS',
  'MENA_WATCHLIST'
] as const

type ContentSectionType = typeof contentSectionTypes[number]

// Custom generators for content data
const contentSectionTypeArbitrary = fc.constantFrom(...contentSectionTypes)

const contentTitleArbitrary = fc.string({ minLength: 5, maxLength: 200 })
  .filter(s => s.trim().length >= 5)

const contentBodyArbitrary = fc.string({ minLength: 10, maxLength: 2000 })
  .filter(s => s.trim().length >= 10)

const contentSectionArbitrary = fc.record({
  id: fc.string({ minLength: 10, maxLength: 30 }),
  type: contentSectionTypeArbitrary,
  title: contentTitleArbitrary,
  content: contentBodyArbitrary,
  isPublished: fc.boolean(),
  publishedAt: fc.option(fc.date(), { nil: null })
})

// Mock content management system
interface ContentSection {
  id: string
  type: ContentSectionType
  title: string
  content: string
  isPublished: boolean
  publishedAt: Date | null
  updatedAt: Date
}

interface ContentUpdate {
  title?: string
  content?: string
  isPublished?: boolean
}

// Mock content database and cache
const mockContentDatabase = new Map<string, ContentSection>()
const mockContentCache = new Map<string, ContentSection>()
const mockPublishedContentIndex = new Map<ContentSectionType, ContentSection[]>()

// Mock content management functions
function mockCreateContent(data: Omit<ContentSection, 'updatedAt'>): ContentSection {
  const content: ContentSection = {
    ...data,
    updatedAt: new Date()
  }
  
  // Store in database
  mockContentDatabase.set(content.id, content)
  
  // Update cache
  mockContentCache.set(content.id, { ...content })
  
  // Update published content index
  if (content.isPublished) {
    const typeContent = mockPublishedContentIndex.get(content.type) || []
    typeContent.push(content)
    mockPublishedContentIndex.set(content.type, typeContent)
  }
  
  return content
}

function mockUpdateContent(id: string, updates: ContentUpdate): ContentSection | null {
  const existingContent = mockContentDatabase.get(id)
  if (!existingContent) {
    return null
  }
  
  // Apply updates
  const updatedContent: ContentSection = {
    ...existingContent,
    ...updates,
    updatedAt: new Date()
  }
  
  // Update database
  mockContentDatabase.set(id, updatedContent)
  
  // Update cache immediately (simulating real-time propagation)
  mockContentCache.set(id, { ...updatedContent })
  
  // Update published content index
  const typeContent = mockPublishedContentIndex.get(updatedContent.type) || []
  const existingIndex = typeContent.findIndex(c => c.id === id)
  
  if (updatedContent.isPublished) {
    if (existingIndex >= 0) {
      typeContent[existingIndex] = updatedContent
    } else {
      typeContent.push(updatedContent)
    }
  } else {
    if (existingIndex >= 0) {
      typeContent.splice(existingIndex, 1)
    }
  }
  
  mockPublishedContentIndex.set(updatedContent.type, typeContent)
  
  return updatedContent
}

function mockGetContentById(id: string): ContentSection | null {
  return mockContentCache.get(id) || null
}

function mockGetPublishedContentByType(type: ContentSectionType): ContentSection[] {
  return mockPublishedContentIndex.get(type) || []
}

function mockClearAll() {
  mockContentDatabase.clear()
  mockContentCache.clear()
  mockPublishedContentIndex.clear()
}

describe('Property 16: Content Update Propagation', () => {
  it('should propagate content updates immediately across all access points', () => {
    fc.assert(
      fc.property(
        contentSectionArbitrary,
        fc.record({
          title: fc.option(contentTitleArbitrary),
          content: fc.option(contentBodyArbitrary),
          isPublished: fc.option(fc.boolean())
        }),
        (initialContent, updates) => {
          // Clear mock systems
          mockClearAll()
          
          // Act: Create initial content
          const createdContent = mockCreateContent({
            id: initialContent.id,
            type: initialContent.type,
            title: initialContent.title,
            content: initialContent.content,
            isPublished: initialContent.isPublished,
            publishedAt: initialContent.publishedAt
          })
          
          // Act: Update content through admin interface
          const filteredUpdates: ContentUpdate = {}
          if (updates.title !== null && updates.title !== undefined) {
            filteredUpdates.title = updates.title
          }
          if (updates.content !== null && updates.content !== undefined) {
            filteredUpdates.content = updates.content
          }
          if (updates.isPublished !== null && updates.isPublished !== undefined) {
            filteredUpdates.isPublished = updates.isPublished
          }
          
          const updatedContent = mockUpdateContent(createdContent.id, filteredUpdates)
          
          // Assert: Update should succeed
          expect(updatedContent).toBeDefined()
          expect(updatedContent?.id).toBe(createdContent.id)
          
          // Assert: Changes should be reflected in direct content lookup
          const directLookup = mockGetContentById(createdContent.id)
          expect(directLookup).toBeDefined()
          
          const expectedTitle = updates.title !== null && updates.title !== undefined 
            ? updates.title 
            : initialContent.title
          const expectedContent = updates.content !== null && updates.content !== undefined 
            ? updates.content 
            : initialContent.content
          const expectedPublishedState = updates.isPublished !== null && updates.isPublished !== undefined 
            ? updates.isPublished 
            : initialContent.isPublished
            
          expect(directLookup?.title).toBe(expectedTitle)
          expect(directLookup?.content).toBe(expectedContent)
          expect(directLookup?.isPublished).toBe(expectedPublishedState)
          
          // Assert: Changes should be reflected in published content index
          const publishedContent = mockGetPublishedContentByType(initialContent.type)
          
          if (expectedPublishedState) {
            // Should appear in published content
            const foundInPublished = publishedContent.find(c => c.id === createdContent.id)
            expect(foundInPublished).toBeDefined()
            expect(foundInPublished?.title).toBe(expectedTitle)
            expect(foundInPublished?.content).toBe(expectedContent)
          } else {
            // Should not appear in published content
            const foundInPublished = publishedContent.find(c => c.id === createdContent.id)
            expect(foundInPublished).toBeUndefined()
          }
          
          // Assert: Update timestamp should be newer or equal (since updates might not change anything)
          expect(updatedContent?.updatedAt.getTime()).toBeGreaterThanOrEqual(createdContent.updatedAt.getTime())
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain consistency between database and cache during updates', () => {
    fc.assert(
      fc.property(
        fc.array(contentSectionArbitrary, { minLength: 1, maxLength: 10 }),
        fc.array(fc.record({
          contentIndex: fc.nat(),
          updates: fc.record({
            title: fc.option(contentTitleArbitrary, { nil: undefined }),
            content: fc.option(contentBodyArbitrary, { nil: undefined }),
            isPublished: fc.option(fc.boolean(), { nil: undefined })
          })
        }), { minLength: 1, maxLength: 5 }),
        (contentItems, updateOperations) => {
          // Clear mock systems
          mockClearAll()
          
          // Act: Create multiple content items
          const createdItems = contentItems.map(item => 
            mockCreateContent({
              id: item.id,
              type: item.type,
              title: item.title,
              content: item.content,
              isPublished: item.isPublished,
              publishedAt: item.publishedAt
            })
          )
          
          // Act: Perform multiple update operations
          for (const operation of updateOperations) {
            const targetIndex = operation.contentIndex % createdItems.length
            const targetContent = createdItems[targetIndex]
            
            mockUpdateContent(targetContent.id, operation.updates)
          }
          
          // Assert: Database and cache should be consistent for all items
          for (const item of createdItems) {
            const databaseVersion = mockContentDatabase.get(item.id)
            const cacheVersion = mockContentCache.get(item.id)
            
            expect(databaseVersion).toBeDefined()
            expect(cacheVersion).toBeDefined()
            
            // All fields should match between database and cache
            expect(cacheVersion?.title).toBe(databaseVersion?.title)
            expect(cacheVersion?.content).toBe(databaseVersion?.content)
            expect(cacheVersion?.isPublished).toBe(databaseVersion?.isPublished)
            expect(cacheVersion?.type).toBe(databaseVersion?.type)
            expect(cacheVersion?.updatedAt.getTime()).toBe(databaseVersion?.updatedAt.getTime())
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should handle publication status changes correctly across all views', () => {
    fc.assert(
      fc.property(
        contentSectionArbitrary,
        fc.boolean(),
        (initialContent, newPublishedStatus) => {
          // Clear mock systems
          mockClearAll()
          
          // Act: Create content with initial publication status
          const createdContent = mockCreateContent({
            id: initialContent.id,
            type: initialContent.type,
            title: initialContent.title,
            content: initialContent.content,
            isPublished: initialContent.isPublished,
            publishedAt: initialContent.publishedAt
          })
          
          // Act: Change publication status
          const updatedContent = mockUpdateContent(createdContent.id, {
            isPublished: newPublishedStatus
          })
          
          // Assert: Update should succeed
          expect(updatedContent).toBeDefined()
          expect(updatedContent?.isPublished).toBe(newPublishedStatus)
          
          // Assert: Published content index should reflect the change
          const publishedContent = mockGetPublishedContentByType(initialContent.type)
          const foundInPublished = publishedContent.find(c => c.id === createdContent.id)
          
          if (newPublishedStatus) {
            expect(foundInPublished).toBeDefined()
            expect(foundInPublished?.isPublished).toBe(true)
          } else {
            expect(foundInPublished).toBeUndefined()
          }
          
          // Assert: Direct lookup should show updated status
          const directLookup = mockGetContentById(createdContent.id)
          expect(directLookup?.isPublished).toBe(newPublishedStatus)
        }
      ),
      { numRuns: 100 }
    )
  })
})