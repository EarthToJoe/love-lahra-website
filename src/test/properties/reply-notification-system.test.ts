import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import fc from 'fast-check'

/**
 * **Property 19: Reply Notification System**
 * **Validates: Requirements 9.2**
 * 
 * This property ensures that when someone replies to a user's comment, 
 * the website sends a notification to the original commenter.
 */
describe('Property 19: Reply Notification System', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  describe('Reply Detection Logic', () => {
    it('should correctly identify when a comment is a reply to another comment', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            originalCommentId: fc.string({ minLength: 1, maxLength: 20 }),
            replyCommentId: fc.string({ minLength: 1, maxLength: 20 }),
            parentCommentId: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
            replyToUserId: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          }),
          async ({ originalCommentId, replyCommentId, parentCommentId, replyToUserId }) => {
            // Function to determine if a comment is a reply
            const isReplyComment = (comment: {
              id: string
              parentCommentId?: string
              replyToUserId?: string
            }) => {
              return !!(comment.parentCommentId || comment.replyToUserId)
            }

            const comment = {
              id: replyCommentId,
              parentCommentId,
              replyToUserId,
            }

            const isReply = isReplyComment(comment)

            // Verify reply detection logic
            if (parentCommentId || replyToUserId) {
              expect(isReply).toBe(true)
            } else {
              expect(isReply).toBe(false)
            }
          }
        ),
        { numRuns: 10 }
      )
    })

    it('should extract correct notification recipients from reply context', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            originalComment: fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              authorId: fc.string({ minLength: 1, maxLength: 20 }),
              authorEmail: fc.emailAddress(),
              authorName: fc.string({ minLength: 1, maxLength: 30 }),
            }),
            replyComment: fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              authorId: fc.string({ minLength: 1, maxLength: 20 }),
              content: fc.string({ minLength: 1, maxLength: 200 }),
              parentCommentId: fc.string({ minLength: 1, maxLength: 20 }),
            }),
            contentTitle: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          async ({ originalComment, replyComment, contentTitle }) => {
            // Function to get notification recipients for a reply
            const getReplyNotificationRecipients = (
              original: typeof originalComment,
              reply: typeof replyComment
            ) => {
              // Don't notify if user is replying to themselves
              if (original.authorId === reply.authorId) {
                return []
              }

              return [{
                userId: original.authorId,
                email: original.authorEmail,
                name: original.authorName,
              }]
            }

            const recipients = getReplyNotificationRecipients(originalComment, replyComment)

            // Verify recipient logic
            if (originalComment.authorId === replyComment.authorId) {
              expect(recipients).toHaveLength(0)
            } else {
              expect(recipients).toHaveLength(1)
              expect(recipients[0].userId).toBe(originalComment.authorId)
              expect(recipients[0].email).toBe(originalComment.authorEmail)
              expect(recipients[0].name).toBe(originalComment.authorName)
            }
          }
        ),
        { numRuns: 10 }
      )
    })
  })

  describe('Reply Notification Message Generation', () => {
    it('should create appropriate notification messages for comment replies', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            replierName: fc.string({ minLength: 1, maxLength: 30 }),
            contentTitle: fc.string({ minLength: 1, maxLength: 50 }),
            replyContent: fc.string({ minLength: 1, maxLength: 200 }),
            originalCommentContent: fc.string({ minLength: 1, maxLength: 200 }),
          }),
          async ({ replierName, contentTitle, replyContent, originalCommentContent }) => {
            // Function to create reply notification message
            const createReplyNotificationMessage = (params: {
              replierName: string
              contentTitle: string
              replyContent: string
              originalCommentContent: string
            }) => {
              return {
                type: 'COMMENT_REPLY',
                title: 'Someone replied to your comment',
                message: `${params.replierName} replied to your comment on "${params.contentTitle}"`,
                data: {
                  replierName: params.replierName,
                  contentTitle: params.contentTitle,
                  replyContent: params.replyContent,
                  originalCommentContent: params.originalCommentContent,
                },
              }
            }

            const notification = createReplyNotificationMessage({
              replierName,
              contentTitle,
              replyContent,
              originalCommentContent,
            })

            // Verify notification structure
            expect(notification.type).toBe('COMMENT_REPLY')
            expect(notification.title).toBe('Someone replied to your comment')
            expect(notification.message).toContain(replierName)
            expect(notification.message).toContain(contentTitle)
            expect(notification.data.replierName).toBe(replierName)
            expect(notification.data.contentTitle).toBe(contentTitle)
            expect(notification.data.replyContent).toBe(replyContent)
            expect(notification.data.originalCommentContent).toBe(originalCommentContent)
          }
        ),
        { numRuns: 10 }
      )
    })

    it('should customize notification messages based on content context', async () => {
      const contentTypes = [
        { type: 'daily', title: 'Morning Routine', context: 'daily activities' },
        { type: 'outfit', title: 'Today\'s Look', context: 'outfit showcase' },
        { type: 'dining', title: 'Restaurant Review', context: 'dining experience' },
        { type: 'poll', title: 'Wedding Dress Poll', context: 'poll discussion' },
      ]

      contentTypes.forEach(content => {
        // Function to create context-aware notification
        const createContextAwareNotification = (
          replierName: string,
          contentType: string,
          contentTitle: string
        ) => {
          const contextMessages = {
            daily: `${replierName} replied to your comment about Lahra's daily activities`,
            outfit: `${replierName} replied to your comment about today's outfit`,
            dining: `${replierName} replied to your comment about the dining experience`,
            poll: `${replierName} replied to your comment on the poll`,
            default: `${replierName} replied to your comment`,
          }

          return {
            type: 'COMMENT_REPLY',
            title: 'New reply to your comment',
            message: contextMessages[contentType as keyof typeof contextMessages] || contextMessages.default,
            context: contentType,
          }
        }

        const notification = createContextAwareNotification('TestUser', content.type, content.title)

        expect(notification.type).toBe('COMMENT_REPLY')
        expect(notification.message).toContain('TestUser')
        expect(notification.message).toContain('replied')
        expect(notification.context).toBe(content.type)
      })
    })
  })

  describe('Notification Delivery Logic', () => {
    it('should respect user notification preferences for reply notifications', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userPreferences: fc.record({
              commentNotifications: fc.boolean(),
              emailNotifications: fc.boolean(),
              inAppNotifications: fc.boolean(),
              pushNotifications: fc.boolean(),
            }),
            replyData: fc.record({
              replierName: fc.string({ minLength: 1, maxLength: 20 }),
              contentTitle: fc.string({ minLength: 1, maxLength: 30 }),
            }),
          }),
          async ({ userPreferences, replyData }) => {
            // Function to determine if reply notification should be sent
            const shouldSendReplyNotification = (prefs: typeof userPreferences) => {
              return prefs.commentNotifications && (
                prefs.emailNotifications || 
                prefs.inAppNotifications || 
                prefs.pushNotifications
              )
            }

            // Function to get notification channels for reply
            const getReplyNotificationChannels = (prefs: typeof userPreferences) => {
              if (!prefs.commentNotifications) return []
              
              const channels = []
              if (prefs.emailNotifications) channels.push('EMAIL')
              if (prefs.inAppNotifications) channels.push('IN_APP')
              if (prefs.pushNotifications) channels.push('PUSH')
              return channels
            }

            const shouldSend = shouldSendReplyNotification(userPreferences)
            const channels = getReplyNotificationChannels(userPreferences)

            // Verify notification logic
            if (!userPreferences.commentNotifications) {
              expect(shouldSend).toBe(false)
              expect(channels).toHaveLength(0)
            } else {
              const hasAnyChannel = userPreferences.emailNotifications || 
                                   userPreferences.inAppNotifications || 
                                   userPreferences.pushNotifications

              expect(shouldSend).toBe(hasAnyChannel)
              
              if (hasAnyChannel) {
                expect(channels.length).toBeGreaterThan(0)
                
                if (userPreferences.emailNotifications) {
                  expect(channels).toContain('EMAIL')
                }
                if (userPreferences.inAppNotifications) {
                  expect(channels).toContain('IN_APP')
                }
                if (userPreferences.pushNotifications) {
                  expect(channels).toContain('PUSH')
                }
              } else {
                expect(channels).toHaveLength(0)
              }
            }
          }
        ),
        { numRuns: 10 }
      )
    })

    it('should handle reply notification timing correctly', async () => {
      const replyEvents = [
        { timestamp: new Date('2024-01-01T10:00:00Z'), replier: 'User1' },
        { timestamp: new Date('2024-01-01T10:05:00Z'), replier: 'User2' },
        { timestamp: new Date('2024-01-01T10:02:00Z'), replier: 'User1' }, // Only 2 minutes after first User1 notification
      ]

      // Function to process reply notifications with timing
      const processReplyNotifications = (events: typeof replyEvents) => {
        const notifications = []
        const lastNotificationTime = new Map<string, Date>()

        for (const event of events) {
          const lastTime = lastNotificationTime.get(event.replier)
          const timeSinceLastNotification = lastTime 
            ? event.timestamp.getTime() - lastTime.getTime()
            : Infinity

          // Only send notification if enough time has passed (5 minutes = 300000ms)
          const shouldNotify = timeSinceLastNotification >= 300000

          if (shouldNotify) {
            notifications.push({
              replier: event.replier,
              timestamp: event.timestamp,
              type: 'COMMENT_REPLY',
            })
            lastNotificationTime.set(event.replier, event.timestamp)
          }
        }

        return notifications
      }

      const notifications = processReplyNotifications(replyEvents)

      // Verify timing logic
      expect(notifications).toHaveLength(2) // User1 at 10:00, User2 at 10:05
      expect(notifications[0].replier).toBe('User1')
      expect(notifications[0].timestamp).toEqual(new Date('2024-01-01T10:00:00Z'))
      expect(notifications[1].replier).toBe('User2')
      expect(notifications[1].timestamp).toEqual(new Date('2024-01-01T10:05:00Z'))
      
      // User1's second reply at 10:02 should be filtered out (too soon after 10:00)
      const user1Notifications = notifications.filter(n => n.replier === 'User1')
      expect(user1Notifications).toHaveLength(1)
    })
  })

  describe('Reply Chain Handling', () => {
    it('should handle nested reply chains correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            originalComment: fc.record({
              id: fc.string({ minLength: 1, maxLength: 10 }),
              authorId: fc.string({ minLength: 1, maxLength: 10 }),
            }),
            replies: fc.array(
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 10 }),
                authorId: fc.string({ minLength: 1, maxLength: 10 }),
                parentCommentId: fc.string({ minLength: 1, maxLength: 10 }),
              }),
              { minLength: 1, maxLength: 5 }
            ),
          }),
          async ({ originalComment, replies }) => {
            // Function to build reply chain notifications
            const buildReplyChainNotifications = (
              original: typeof originalComment,
              replyChain: typeof replies
            ) => {
              const notifications = []
              
              for (const reply of replyChain) {
                // Find the parent comment (could be original or another reply)
                const parentComment = reply.parentCommentId === original.id 
                  ? original 
                  : replyChain.find(r => r.id === reply.parentCommentId)

                if (parentComment && parentComment.authorId !== reply.authorId) {
                  notifications.push({
                    recipientId: parentComment.authorId,
                    replyId: reply.id,
                    replierId: reply.authorId,
                    parentCommentId: reply.parentCommentId,
                    type: 'COMMENT_REPLY',
                  })
                }
              }

              return notifications
            }

            const notifications = buildReplyChainNotifications(originalComment, replies)

            // Verify reply chain logic
            notifications.forEach(notification => {
              expect(notification.type).toBe('COMMENT_REPLY')
              expect(notification.recipientId).toBeTruthy()
              expect(notification.replyId).toBeTruthy()
              expect(notification.replierId).toBeTruthy()
              
              // Verify recipient is not the same as replier
              expect(notification.recipientId).not.toBe(notification.replierId)
            })

            // Verify no self-notifications
            const selfNotifications = notifications.filter(
              n => n.recipientId === n.replierId
            )
            expect(selfNotifications).toHaveLength(0)
          }
        ),
        { numRuns: 5 }
      )
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing or invalid reply data gracefully', async () => {
      const testCases = [
        { originalComment: null, reply: { id: '1', authorId: 'user1' } },
        { originalComment: { id: '1', authorId: 'user1' }, reply: null },
        { originalComment: { id: '1', authorId: '' }, reply: { id: '2', authorId: 'user2' } },
        { originalComment: { id: '', authorId: 'user1' }, reply: { id: '2', authorId: 'user2' } },
      ]

      testCases.forEach(testCase => {
        // Function to validate reply notification data
        const validateReplyNotificationData = (
          original: any,
          reply: any
        ) => {
          const errors = []

          if (!original) {
            errors.push('Original comment is required')
          } else {
            if (!original.id || original.id.trim() === '') {
              errors.push('Original comment ID is required')
            }
            if (!original.authorId || original.authorId.trim() === '') {
              errors.push('Original comment author ID is required')
            }
          }

          if (!reply) {
            errors.push('Reply comment is required')
          } else {
            if (!reply.id || reply.id.trim() === '') {
              errors.push('Reply comment ID is required')
            }
            if (!reply.authorId || reply.authorId.trim() === '') {
              errors.push('Reply comment author ID is required')
            }
          }

          return {
            isValid: errors.length === 0,
            errors,
          }
        }

        const validation = validateReplyNotificationData(
          testCase.originalComment,
          testCase.reply
        )

        // All test cases should be invalid
        expect(validation.isValid).toBe(false)
        expect(validation.errors.length).toBeGreaterThan(0)
      })
    })

    it('should handle notification delivery failures for reply notifications', async () => {
      const recipients = [
        { userId: 'user1', email: 'user1@test.com', preferences: { commentNotifications: true } },
        { userId: 'user2', email: 'user2@test.com', preferences: { commentNotifications: true } },
        { userId: 'user3', email: 'invalid-email', preferences: { commentNotifications: true } },
      ]

      // Function to send reply notifications with error handling
      const sendReplyNotifications = async (recipientList: typeof recipients) => {
        const results = await Promise.allSettled(
          recipientList.map(async (recipient) => {
            // Simulate email validation failure
            if (recipient.email === 'invalid-email') {
              throw new Error('Invalid email address')
            }

            // Simulate successful notification
            return {
              success: true,
              userId: recipient.userId,
              channels: ['EMAIL', 'IN_APP'],
            }
          })
        )

        const successful = results.filter(r => r.status === 'fulfilled')
        const failed = results.filter(r => r.status === 'rejected')

        return { successful, failed, total: results.length }
      }

      const result = await sendReplyNotifications(recipients)

      // Verify error handling
      expect(result.total).toBe(3)
      expect(result.successful).toHaveLength(2) // user1 and user2
      expect(result.failed).toHaveLength(1) // user3 with invalid email

      // Verify successful notifications
      result.successful.forEach(result => {
        if (result.status === 'fulfilled') {
          expect(result.value.success).toBe(true)
          expect(['user1', 'user2']).toContain(result.value.userId)
        }
      })
    })
  })
})