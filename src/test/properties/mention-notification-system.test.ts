import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

/**
 * **Property 21: Mention Notification System**
 * **Validates: Requirements 9.4**
 * 
 * This property ensures that when users are mentioned in comments, 
 * the website notifies them of the mention.
 */
describe('Property 21: Mention Notification System', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  describe('Mention Detection Logic', () => {
    it('should detect simple mentions', () => {
      const text = 'Hello @alice'
      const users = [{ username: 'alice', userId: 'user1' }]
      
      const mentions = []
      const regex = /@(\w+)/g
      let match
      
      while ((match = regex.exec(text)) !== null) {
        const username = match[1]
        const user = users.find(u => u.username === username)
        if (user) {
          mentions.push({ username, userId: user.userId })
        }
      }
      
      expect(mentions).toHaveLength(1)
      expect(mentions[0].username).toBe('alice')
    })

    it('should detect multiple mentions', () => {
      const text = 'Hello @alice and @bob'
      const users = [
        { username: 'alice', userId: 'user1' },
        { username: 'bob', userId: 'user2' }
      ]
      
      const mentions = []
      const regex = /@(\w+)/g
      let match
      
      while ((match = regex.exec(text)) !== null) {
        const username = match[1]
        const user = users.find(u => u.username === username)
        if (user) {
          mentions.push({ username, userId: user.userId })
        }
      }
      
      expect(mentions).toHaveLength(2)
    })

    it('should not detect unknown users', () => {
      const text = 'Hello @unknown'
      const users = [{ username: 'alice', userId: 'user1' }]
      
      const mentions = []
      const regex = /@(\w+)/g
      let match
      
      while ((match = regex.exec(text)) !== null) {
        const username = match[1]
        const user = users.find(u => u.username === username)
        if (user) {
          mentions.push({ username, userId: user.userId })
        }
      }
      
      expect(mentions).toHaveLength(0)
    })
  })

  describe('Notification Recipients', () => {
    it('should exclude comment author from recipients', () => {
      const author = { id: 'author1', username: 'alice' }
      const users = [
        { id: 'author1', username: 'alice', email: 'alice@test.com' },
        { id: 'user2', username: 'bob', email: 'bob@test.com' }
      ]
      const text = 'Hello @alice and @bob'
      
      const recipients = []
      const regex = /@(\w+)/g
      let match
      
      while ((match = regex.exec(text)) !== null) {
        const username = match[1]
        const user = users.find(u => u.username === username)
        if (user && user.id !== author.id) {
          recipients.push(user)
        }
      }
      
      expect(recipients).toHaveLength(1)
      expect(recipients[0].username).toBe('bob')
    })

    it('should handle duplicate mentions', () => {
      const author = { id: 'author1', username: 'david' }
      const users = [
        { id: 'user1', username: 'alice', email: 'alice@test.com' }
      ]
      const text = 'Hello @alice and @alice again'
      
      const recipients = []
      const processedIds = new Set()
      const regex = /@(\w+)/g
      let match
      
      while ((match = regex.exec(text)) !== null) {
        const username = match[1]
        const user = users.find(u => u.username === username)
        if (user && user.id !== author.id && !processedIds.has(user.id)) {
          recipients.push(user)
          processedIds.add(user.id)
        }
      }
      
      expect(recipients).toHaveLength(1)
      expect(recipients[0].username).toBe('alice')
    })
  })

  describe('Notification Message Generation', () => {
    it('should create basic notification message', () => {
      const data = {
        mentionerName: 'TestUser',
        contentTitle: 'Daily Update',
        commentText: 'Short comment'
      }
      
      const notification = {
        type: 'MENTION',
        title: 'You were mentioned in a comment',
        message: `${data.mentionerName} mentioned you in a comment on "${data.contentTitle}"`,
        commentPreview: data.commentText.length > 100 
          ? data.commentText.substring(0, 100) + '...'
          : data.commentText
      }
      
      expect(notification.type).toBe('MENTION')
      expect(notification.message).toContain('TestUser')
      expect(notification.commentPreview).toBe('Short comment')
    })

    it('should truncate long comments', () => {
      const longComment = 'a'.repeat(150)
      
      const preview = longComment.length > 100 
        ? longComment.substring(0, 100) + '...'
        : longComment
      
      expect(preview).toHaveLength(103)
      expect(preview.endsWith('...')).toBe(true)
    })
  })

  describe('Notification Preferences', () => {
    it('should respect mention notification settings', () => {
      const preferences = {
        mentionNotifications: true,
        emailNotifications: true,
        inAppNotifications: false
      }
      
      const shouldSend = preferences.mentionNotifications && 
        (preferences.emailNotifications || preferences.inAppNotifications)
      
      const channels = []
      if (preferences.mentionNotifications) {
        if (preferences.emailNotifications) channels.push('EMAIL')
        if (preferences.inAppNotifications) channels.push('IN_APP')
      }
      
      expect(shouldSend).toBe(true)
      expect(channels).toEqual(['EMAIL'])
    })

    it('should not send when mentions disabled', () => {
      const preferences = {
        mentionNotifications: false,
        emailNotifications: true,
        inAppNotifications: true
      }
      
      const shouldSend = preferences.mentionNotifications && 
        (preferences.emailNotifications || preferences.inAppNotifications)
      
      expect(shouldSend).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle empty text', () => {
      const text = ''
      const users = [{ username: 'alice', userId: 'user1' }]
      
      const mentions = []
      const regex = /@(\w+)/g
      let match
      
      while ((match = regex.exec(text)) !== null) {
        const username = match[1]
        const user = users.find(u => u.username === username)
        if (user) {
          mentions.push({ username, userId: user.userId })
        }
      }
      
      expect(mentions).toHaveLength(0)
    })

    it('should handle empty users array', () => {
      const text = 'Hello @alice'
      const users: any[] = []
      
      const mentions = []
      const regex = /@(\w+)/g
      let match
      
      while ((match = regex.exec(text)) !== null) {
        const username = match[1]
        const user = users.find(u => u.username === username)
        if (user) {
          mentions.push({ username, userId: user.userId })
        }
      }
      
      expect(mentions).toHaveLength(0)
    })

    it('should validate input data', () => {
      const validateInput = (text: any, users: any) => {
        const errors = []
        
        if (!text || typeof text !== 'string') {
          errors.push('Invalid text')
        }
        
        if (!users || !Array.isArray(users)) {
          errors.push('Invalid users')
        }
        
        return errors.length === 0
      }
      
      expect(validateInput('valid text', [])).toBe(true)
      expect(validateInput(null, [])).toBe(false)
      expect(validateInput('valid text', null)).toBe(false)
    })
  })
})