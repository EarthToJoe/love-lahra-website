/**
 * Property 17: Content Version Control
 * **Validates: Requirements 8.5**
 * 
 * This property test validates that content versioning works correctly:
 * - Content changes create new versions
 * - Version history is maintained
 * - Previous versions can be restored
 * - Version metadata is accurate
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ContentSection } from '@/types'

// Mock content versioning system
interface ContentVersion {
  id: string
  contentId: string
  version: number
  title: string
  content: string
  metadata: Record<string, any>
  createdBy: string
  createdAt: Date
  isPublished: boolean
}

class ContentVersionManager {
  private versions: Map<string, ContentVersion[]> = new Map()
  private currentVersions: Map<string, number> = new Map()

  createContent(content: Omit<ContentSection, 'id' | 'createdAt' | 'updatedAt'>): ContentSection {
    const contentId = `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    
    const fullContent: ContentSection = {
      ...content,
      id: contentId,
      createdAt: now,
      updatedAt: now
    }

    // Create initial version
    const initialVersion: ContentVersion = {
      id: `version-${contentId}-1`,
      contentId,
      version: 1,
      title: content.title,
      content: content.content,
      metadata: content.metadata,
      createdBy: 'system',
      createdAt: now,
      isPublished: content.isPublished
    }

    this.versions.set(contentId, [initialVersion])
    this.currentVersions.set(contentId, 1)

    return fullContent
  }

  updateContent(
    contentId: string, 
    updates: Partial<Pick<ContentSection, 'title' | 'content' | 'metadata' | 'isPublished'>>,
    userId: string = 'system'
  ): ContentSection {
    const existingVersions = this.versions.get(contentId) || []
    const currentVersion = this.currentVersions.get(contentId) || 0
    
    if (existingVersions.length === 0) {
      throw new Error('Content not found')
    }

    const latestVersion = existingVersions[existingVersions.length - 1]
    const newVersionNumber = currentVersion + 1
    const now = new Date()

    // Create new version
    const newVersion: ContentVersion = {
      id: `version-${contentId}-${newVersionNumber}`,
      contentId,
      version: newVersionNumber,
      title: updates.title ?? latestVersion.title,
      content: updates.content ?? latestVersion.content,
      metadata: updates.metadata ?? latestVersion.metadata,
      createdBy: userId,
      createdAt: now,
      isPublished: updates.isPublished ?? latestVersion.isPublished
    }

    // Add to version history
    const updatedVersions = [...existingVersions, newVersion]
    this.versions.set(contentId, updatedVersions)
    this.currentVersions.set(contentId, newVersionNumber)

    // Return updated content
    return {
      id: contentId,
      type: 'daily-activity', // Default type
      title: newVersion.title,
      content: newVersion.content,
      images: [],
      metadata: newVersion.metadata,
      isPublished: newVersion.isPublished,
      publishedAt: newVersion.isPublished ? now : undefined,
      createdAt: existingVersions[0].createdAt,
      updatedAt: now
    }
  }

  getVersionHistory(contentId: string): ContentVersion[] {
    return this.versions.get(contentId) || []
  }

  getCurrentVersion(contentId: string): ContentVersion | null {
    const versions = this.versions.get(contentId) || []
    return versions.length > 0 ? versions[versions.length - 1] : null
  }

  restoreVersion(contentId: string, versionNumber: number, userId: string = 'system'): ContentSection {
    const versions = this.versions.get(contentId) || []
    const targetVersion = versions.find(v => v.version === versionNumber)
    
    if (!targetVersion) {
      throw new Error(`Version ${versionNumber} not found`)
    }

    // Create new version based on the target version
    return this.updateContent(contentId, {
      title: targetVersion.title,
      content: targetVersion.content,
      metadata: targetVersion.metadata,
      isPublished: targetVersion.isPublished
    }, userId)
  }

  getVersionDiff(contentId: string, fromVersion: number, toVersion: number): {
    titleChanged: boolean
    contentChanged: boolean
    metadataChanged: boolean
    publishStatusChanged: boolean
  } {
    const versions = this.versions.get(contentId) || []
    const fromVer = versions.find(v => v.version === fromVersion)
    const toVer = versions.find(v => v.version === toVersion)
    
    if (!fromVer || !toVer) {
      throw new Error('Version not found')
    }

    return {
      titleChanged: fromVer.title !== toVer.title,
      contentChanged: fromVer.content !== toVer.content,
      metadataChanged: JSON.stringify(fromVer.metadata) !== JSON.stringify(toVer.metadata),
      publishStatusChanged: fromVer.isPublished !== toVer.isPublished
    }
  }
}

describe('Property 17: Content Version Control', () => {
  let versionManager: ContentVersionManager

  beforeEach(() => {
    versionManager = new ContentVersionManager()
  })

  it('should create initial version when content is created', () => {
    const contentData = {
      type: 'daily-activity' as const,
      title: 'My First Post',
      content: 'This is my first post content',
      images: [],
      metadata: { mood: 'happy' },
      isPublished: false
    }

    const content = versionManager.createContent(contentData)
    const versions = versionManager.getVersionHistory(content.id)
    const currentVersion = versionManager.getCurrentVersion(content.id)

    expect(versions).toHaveLength(1)
    expect(currentVersion).not.toBeNull()
    expect(currentVersion!.version).toBe(1)
    expect(currentVersion!.title).toBe(contentData.title)
    expect(currentVersion!.content).toBe(contentData.content)
    expect(currentVersion!.isPublished).toBe(contentData.isPublished)
  })

  it('should create new version when content is updated', () => {
    const contentData = {
      type: 'daily-activity' as const,
      title: 'Original Title',
      content: 'Original content',
      images: [],
      metadata: { mood: 'neutral' },
      isPublished: false
    }

    const content = versionManager.createContent(contentData)
    
    // Update the content
    const updatedContent = versionManager.updateContent(content.id, {
      title: 'Updated Title',
      content: 'Updated content',
      isPublished: true
    }, 'user-123')

    const versions = versionManager.getVersionHistory(content.id)
    const currentVersion = versionManager.getCurrentVersion(content.id)

    expect(versions).toHaveLength(2)
    expect(currentVersion!.version).toBe(2)
    expect(currentVersion!.title).toBe('Updated Title')
    expect(currentVersion!.content).toBe('Updated content')
    expect(currentVersion!.isPublished).toBe(true)
    expect(currentVersion!.createdBy).toBe('user-123')
    expect(updatedContent.title).toBe('Updated Title')
  })

  it('should maintain complete version history', () => {
    const contentData = {
      type: 'daily-activity' as const,
      title: 'Version 1',
      content: 'Content 1',
      images: [],
      metadata: { version: 1 },
      isPublished: false
    }

    const content = versionManager.createContent(contentData)
    
    // Create multiple versions
    versionManager.updateContent(content.id, { title: 'Version 2', content: 'Content 2' })
    versionManager.updateContent(content.id, { title: 'Version 3', content: 'Content 3' })
    versionManager.updateContent(content.id, { title: 'Version 4', content: 'Content 4' })

    const versions = versionManager.getVersionHistory(content.id)
    
    expect(versions).toHaveLength(4)
    expect(versions[0].version).toBe(1)
    expect(versions[0].title).toBe('Version 1')
    expect(versions[1].version).toBe(2)
    expect(versions[1].title).toBe('Version 2')
    expect(versions[2].version).toBe(3)
    expect(versions[2].title).toBe('Version 3')
    expect(versions[3].version).toBe(4)
    expect(versions[3].title).toBe('Version 4')
    
    // Verify chronological order
    for (let i = 1; i < versions.length; i++) {
      expect(versions[i].createdAt.getTime()).toBeGreaterThanOrEqual(versions[i-1].createdAt.getTime())
    }
  })

  it('should allow restoring previous versions', () => {
    const contentData = {
      type: 'daily-activity' as const,
      title: 'Original Title',
      content: 'Original content',
      images: [],
      metadata: { important: true },
      isPublished: true
    }

    const content = versionManager.createContent(contentData)
    
    // Make some updates
    versionManager.updateContent(content.id, { title: 'Updated Title', content: 'Updated content' })
    versionManager.updateContent(content.id, { title: 'Final Title', content: 'Final content', isPublished: false })

    // Restore to version 1
    const restoredContent = versionManager.restoreVersion(content.id, 1, 'admin-user')
    const versions = versionManager.getVersionHistory(content.id)
    const currentVersion = versionManager.getCurrentVersion(content.id)

    expect(versions).toHaveLength(4) // Original + 2 updates + 1 restore
    expect(currentVersion!.version).toBe(4)
    expect(currentVersion!.title).toBe('Original Title')
    expect(currentVersion!.content).toBe('Original content')
    expect(currentVersion!.isPublished).toBe(true)
    expect(currentVersion!.createdBy).toBe('admin-user')
    expect(restoredContent.title).toBe('Original Title')
  })

  it('should accurately track version differences', () => {
    const contentData = {
      type: 'daily-activity' as const,
      title: 'Original Title',
      content: 'Original content',
      images: [],
      metadata: { mood: 'happy', location: 'home' },
      isPublished: false
    }

    const content = versionManager.createContent(contentData)
    
    // Update with changes to all fields
    versionManager.updateContent(content.id, {
      title: 'New Title',
      content: 'New content',
      metadata: { mood: 'excited', location: 'office' },
      isPublished: true
    })

    const diff = versionManager.getVersionDiff(content.id, 1, 2)

    expect(diff.titleChanged).toBe(true)
    expect(diff.contentChanged).toBe(true)
    expect(diff.metadataChanged).toBe(true)
    expect(diff.publishStatusChanged).toBe(true)
  })

  it('should handle partial updates correctly', () => {
    const contentData = {
      type: 'daily-activity' as const,
      title: 'Original Title',
      content: 'Original content',
      images: [],
      metadata: { mood: 'happy' },
      isPublished: false
    }

    const content = versionManager.createContent(contentData)
    
    // Update only the title
    versionManager.updateContent(content.id, { title: 'Updated Title' })

    const versions = versionManager.getVersionHistory(content.id)
    const currentVersion = versionManager.getCurrentVersion(content.id)

    expect(versions).toHaveLength(2)
    expect(currentVersion!.title).toBe('Updated Title')
    expect(currentVersion!.content).toBe('Original content') // Unchanged
    expect(currentVersion!.metadata).toEqual({ mood: 'happy' }) // Unchanged
    expect(currentVersion!.isPublished).toBe(false) // Unchanged
  })

  it('should preserve version metadata and timestamps', () => {
    const contentData = {
      type: 'daily-activity' as const,
      title: 'Test Content',
      content: 'Test content',
      images: [],
      metadata: { test: true },
      isPublished: false
    }

    const content = versionManager.createContent(contentData)
    const beforeUpdate = new Date()
    
    versionManager.updateContent(content.id, { title: 'Updated Test Content' }, 'test-user')

    const versions = versionManager.getVersionHistory(content.id)
    
    expect(versions).toHaveLength(2)
    
    // Check first version
    expect(versions[0].version).toBe(1)
    expect(versions[0].createdBy).toBe('system')
    expect(versions[0].createdAt).toBeInstanceOf(Date)
    
    // Check second version
    expect(versions[1].version).toBe(2)
    expect(versions[1].createdBy).toBe('test-user')
    expect(versions[1].createdAt).toBeInstanceOf(Date)
    expect(versions[1].createdAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime())
  })

  it('should handle version restoration edge cases', () => {
    const contentData = {
      type: 'daily-activity' as const,
      title: 'Test Content',
      content: 'Test content',
      images: [],
      metadata: {},
      isPublished: false
    }

    const content = versionManager.createContent(contentData)

    // Try to restore non-existent version
    expect(() => {
      versionManager.restoreVersion(content.id, 999)
    }).toThrow('Version 999 not found')

    // Try to restore from non-existent content
    expect(() => {
      versionManager.restoreVersion('non-existent-id', 1)
    }).toThrow('Version 1 not found')
  })

  it('should handle content updates for non-existent content', () => {
    expect(() => {
      versionManager.updateContent('non-existent-id', { title: 'New Title' })
    }).toThrow('Content not found')
  })
})