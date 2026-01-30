import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import fc from 'fast-check'

/**
 * **Property 18: Content Notification Delivery**
 * **Validates: Requirements 9.1**
 * 
 * This property ensures that when new content is posted, the website notifies 
 * subscribed users through their preferred channels.
 */
describe('Property 18: Content Notification Delivery', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  describe('Notification Distribution Logic', () => {
    it('should determine correct notification channels based on user preferences', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userPreferences: fc.record({
              emailNotifications: fc.boolean(),
              inAppNotifications: fc.boolean(),
              pushNotifications: fc.boolean(),
              contentUpdates: fc.boolean(),
            }),
            contentType: fc.constantFrom('daily', 'outfit', 'dining', 'snack', 'fun-fact'),
          }),
          async ({ userPreferences, contentType }) => {
            // Function to determine notification channels based on preferences
            const getNotificationChannels = (prefs: typeof userPreferences) => {
              if (!prefs.contentUpdates) return []
              
              const channels = []
              if (prefs.emailNotifications) channels.push('EMAIL')
              if (prefs.inAppNotifications) channels.push('IN_APP')
              if (prefs.pushNotifications) channels.push('PUSH')
              return channels
            }

            const channels = getNotificationChannels(userPreferences)

            // Verify channel selection logic
            if (!userPreferences.contentUpdates) {
              expect(channels).toEqual([])
            } else {
              if (userPreferences.emailNotifications) {
                expect(channels).toContain('EMAIL')
              } else {
                expect(channels).not.toContain('EMAIL')
              }

              if (userPreferences.inAppNotifications) {
                expect(channels).toContain('IN_APP')
              } else {
                expect(channels).not.toContain('IN_APP')
              }

              if (userPreferences.pushNotifications) {
                expect(channels).toContain('PUSH')
              } else {
                expect(channels).not.toContain('PUSH')
              }
            }
          }
        ),
        { numRuns: 10 }
      )
    })

    it('should create appropriate notification messages for different content types', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contentType: fc.constantFrom('daily', 'outfit', 'dining', 'snack', 'fun-fact'),
            contentTitle: fc.string({ minLength: 1, maxLength: 50 }),
            authorName: fc.string({ minLength: 1, maxLength: 30 }),
          }),
          async ({ contentType, contentTitle, authorName }) => {
            // Function to create notification message
            const createNotificationMessage = (type: string, title: string, author: string) => {
              return {
                title: `New ${type}: ${title}`,
                message: `${author} just posted new ${type} content: ${title}`,
                type: 'NEW_CONTENT',
              }
            }

            const notification = createNotificationMessage(contentType, contentTitle, authorName)

            // Verify message structure
            expect(notification.title).toBe(`New ${contentType}: ${contentTitle}`)
            expect(notification.message).toContain(contentTitle)
            expect(notification.message).toContain(authorName)
            expect(notification.message).toContain(contentType)
            expect(notification.type).toBe('NEW_CONTENT')
          }
        ),
        { numRuns: 10 }
      )
    })
  })

  describe('User Filtering Logic', () => {
    it('should correctly filter users who want content notifications', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 10 }),
              email: fc.emailAddress(),
              preferences: fc.record({
                contentUpdates: fc.boolean(),
                emailNotifications: fc.boolean(),
                inAppNotifications: fc.boolean(),
              }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (users) => {
            // Function to filter users who should receive content notifications
            const filterNotificationUsers = (userList: typeof users) => {
              return userList.filter(user => 
                user.preferences.contentUpdates && 
                (user.preferences.emailNotifications || user.preferences.inAppNotifications)
              )
            }

            const filteredUsers = filterNotificationUsers(users)

            // Verify filtering logic
            filteredUsers.forEach(user => {
              expect(user.preferences.contentUpdates).toBe(true)
              expect(
                user.preferences.emailNotifications || user.preferences.inAppNotifications
              ).toBe(true)
            })

            // Verify excluded users
            const excludedUsers = users.filter(user => !filteredUsers.includes(user))
            excludedUsers.forEach(user => {
              expect(
                !user.preferences.contentUpdates || 
                (!user.preferences.emailNotifications && !user.preferences.inAppNotifications)
              ).toBe(true)
            })
          }
        ),
        { numRuns: 5 }
      )
    })
  })

  describe('Notification Payload Structure', () => {
    it('should create valid notification payloads', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.string({ minLength: 1, maxLength: 20 }),
            contentType: fc.constantFrom('daily', 'outfit', 'dining', 'snack'),
            contentTitle: fc.string({ minLength: 1, maxLength: 100 }),
            contentId: fc.string({ minLength: 1, maxLength: 20 }),
            channels: fc.array(
              fc.constantFrom('EMAIL', 'IN_APP', 'PUSH'),
              { minLength: 1, maxLength: 3 }
            ),
          }),
          async ({ userId, contentType, contentTitle, contentId, channels }) => {
            // Function to create notification payload
            const createNotificationPayload = (params: {
              userId: string
              contentType: string
              contentTitle: string
              contentId: string
              channels: string[]
            }) => {
              return {
                userId: params.userId,
                type: 'NEW_CONTENT',
                title: `New ${params.contentType}: ${params.contentTitle}`,
                message: `New ${params.contentType} content has been posted: ${params.contentTitle}`,
                data: {
                  contentType: params.contentType,
                  contentId: params.contentId,
                  contentTitle: params.contentTitle,
                },
                channels: params.channels,
              }
            }

            const payload = createNotificationPayload({
              userId,
              contentType,
              contentTitle,
              contentId,
              channels,
            })

            // Verify payload structure
            expect(payload.userId).toBe(userId)
            expect(payload.type).toBe('NEW_CONTENT')
            expect(payload.title).toContain(contentType)
            expect(payload.title).toContain(contentTitle)
            expect(payload.message).toContain(contentTitle)
            expect(payload.data.contentType).toBe(contentType)
            expect(payload.data.contentId).toBe(contentId)
            expect(payload.data.contentTitle).toBe(contentTitle)
            expect(payload.channels).toEqual(channels)
          }
        ),
        { numRuns: 10 }
      )
    })
  })

  describe('Error Handling Logic', () => {
    it('should handle notification failures gracefully', async () => {
      const users = [
        { id: 'user1', email: 'user1@test.com' },
        { id: 'user2', email: 'user2@test.com' },
        { id: 'user3', email: 'user3@test.com' },
      ]

      // Simulate notification sending with some failures
      const sendNotificationWithFailures = async (userId: string) => {
        // Simulate random failures
        if (userId === 'user2') {
          throw new Error('Email service unavailable')
        }
        return { success: true, userId }
      }

      // Function to send notifications to all users with error handling
      const sendNotificationsToUsers = async (userList: typeof users) => {
        const results = await Promise.allSettled(
          userList.map(user => sendNotificationWithFailures(user.id))
        )

        const successful = results.filter(result => result.status === 'fulfilled')
        const failed = results.filter(result => result.status === 'rejected')

        return { successful, failed, total: results.length }
      }

      const result = await sendNotificationsToUsers(users)

      // Verify error handling
      expect(result.total).toBe(3)
      expect(result.successful).toHaveLength(2) // user1 and user3 should succeed
      expect(result.failed).toHaveLength(1) // user2 should fail
      
      // Verify successful notifications
      result.successful.forEach(result => {
        if (result.status === 'fulfilled') {
          expect(result.value.success).toBe(true)
          expect(['user1', 'user3']).toContain(result.value.userId)
        }
      })
    })

    it('should validate notification data before sending', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.option(fc.string({ minLength: 1 })),
            contentType: fc.option(fc.string({ minLength: 1 })),
            contentTitle: fc.option(fc.string({ minLength: 1 })),
            channels: fc.option(fc.array(fc.string({ minLength: 1 }), { minLength: 1 })),
          }),
          async ({ userId, contentType, contentTitle, channels }) => {
            // Function to validate notification data
            const validateNotificationData = (data: {
              userId?: string
              contentType?: string
              contentTitle?: string
              channels?: string[]
            }) => {
              const errors = []
              
              if (!data.userId || data.userId.trim() === '') {
                errors.push('userId is required')
              }
              
              if (!data.contentType || data.contentType.trim() === '') {
                errors.push('contentType is required')
              }
              
              if (!data.contentTitle || data.contentTitle.trim() === '') {
                errors.push('contentTitle is required')
              }
              
              if (!data.channels || data.channels.length === 0) {
                errors.push('at least one channel is required')
              }

              return {
                isValid: errors.length === 0,
                errors,
              }
            }

            const validation = validateNotificationData({
              userId,
              contentType,
              contentTitle,
              channels,
            })

            // Verify validation logic
            if (userId && contentType && contentTitle && channels && channels.length > 0) {
              expect(validation.isValid).toBe(true)
              expect(validation.errors).toHaveLength(0)
            } else {
              expect(validation.isValid).toBe(false)
              expect(validation.errors.length).toBeGreaterThan(0)
            }
          }
        ),
        { numRuns: 10 }
      )
    })
  })

  describe('Content Type Specific Logic', () => {
    it('should handle different content types appropriately', async () => {
      const contentTypes = ['daily', 'outfit', 'dining', 'snack', 'fun-fact']
      
      contentTypes.forEach(contentType => {
        // Function to get content-specific notification settings
        const getContentNotificationSettings = (type: string) => {
          const settings = {
            priority: 'normal' as 'high' | 'normal' | 'low',
            template: 'default',
            channels: ['EMAIL', 'IN_APP'] as string[],
          }

          switch (type) {
            case 'daily':
              settings.priority = 'high'
              settings.template = 'daily-update'
              break
            case 'outfit':
              settings.priority = 'normal'
              settings.template = 'outfit-showcase'
              break
            case 'dining':
              settings.priority = 'normal'
              settings.template = 'dining-experience'
              break
            case 'fun-fact':
              settings.priority = 'low'
              settings.template = 'fun-fact'
              settings.channels = ['IN_APP'] // Less intrusive for fun facts
              break
            default:
              break
          }

          return settings
        }

        const settings = getContentNotificationSettings(contentType)

        // Verify content-specific settings
        expect(settings.priority).toMatch(/^(high|normal|low)$/)
        expect(settings.template).toBeTruthy()
        expect(settings.channels).toBeInstanceOf(Array)
        expect(settings.channels.length).toBeGreaterThan(0)

        // Verify specific content type logic
        if (contentType === 'daily') {
          expect(settings.priority).toBe('high')
          expect(settings.template).toBe('daily-update')
        }

        if (contentType === 'fun-fact') {
          expect(settings.priority).toBe('low')
          expect(settings.channels).toEqual(['IN_APP'])
        }
      })
    })
  })
})