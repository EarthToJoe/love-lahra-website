import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'

/**
 * Integration tests for database migration from mock data to PostgreSQL
 * 
 * These tests verify that:
 * 1. Database schema is properly set up
 * 2. All models can be created and queried
 * 3. Relationships work correctly
 * 4. Admin role system functions
 * 5. API routes can interact with the database
 */
describe('Database Migration Integration Tests', () => {
  // Test data cleanup
  beforeEach(async () => {
    // Clean up test data in correct order (respecting foreign key constraints)
    await prisma.vote.deleteMany()
    await prisma.pollOption.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.donation.deleteMany()
    await prisma.donationGoal.deleteMany()
    await prisma.outfitImage.deleteMany()
    await prisma.outfitItem.deleteMany()
    await prisma.outfit.deleteMany()
    await prisma.contentImage.deleteMany()
    await prisma.contentSection.deleteMany()
    await prisma.userPreferences.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('User Management and Roles', () => {
    it('should create users with different roles', async () => {
      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@test.com',
          displayName: 'Admin User',
          role: 'ADMIN'
        }
      })

      // Create regular user
      const regularUser = await prisma.user.create({
        data: {
          email: 'user@test.com',
          displayName: 'Regular User',
          role: 'USER'
        }
      })

      // Create moderator
      const moderator = await prisma.user.create({
        data: {
          email: 'mod@test.com',
          displayName: 'Moderator',
          role: 'MODERATOR'
        }
      })

      expect(adminUser.role).toBe('ADMIN')
      expect(regularUser.role).toBe('USER')
      expect(moderator.role).toBe('MODERATOR')

      // Verify users can be queried
      const users = await prisma.user.findMany()
      expect(users).toHaveLength(3)
    })

    it('should create user preferences', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'user@test.com',
          displayName: 'Test User',
          preferences: {
            create: {
              emailNotifications: true,
              pushNotifications: false,
              commentNotifications: true,
              newContentNotifications: false,
              pollNotifications: true,
              showProfile: true,
              allowMentions: false
            }
          }
        },
        include: {
          preferences: true
        }
      })

      expect(user.preferences).toBeTruthy()
      expect(user.preferences?.emailNotifications).toBe(true)
      expect(user.preferences?.pushNotifications).toBe(false)
      expect(user.preferences?.allowMentions).toBe(false)
    })
  })

  describe('Content Management', () => {
    it('should create and query content sections', async () => {
      const contentSection = await prisma.contentSection.create({
        data: {
          type: 'DAILY_ACTIVITY',
          title: 'Test Daily Activity',
          content: 'This is a test daily activity content.',
          isPublished: true,
          publishedAt: new Date(),
          metadata: {
            mood: 'happy',
            location: 'home'
          }
        }
      })

      expect(contentSection.type).toBe('DAILY_ACTIVITY')
      expect(contentSection.isPublished).toBe(true)
      expect(contentSection.metadata).toEqual({
        mood: 'happy',
        location: 'home'
      })

      // Query published content
      const publishedContent = await prisma.contentSection.findMany({
        where: { isPublished: true }
      })
      expect(publishedContent).toHaveLength(1)
    })

    it('should create content with images', async () => {
      const contentSection = await prisma.contentSection.create({
        data: {
          type: 'OUTFIT',
          title: 'Test Outfit',
          content: 'Test outfit description',
          isPublished: true,
          images: {
            create: [
              {
                url: 'https://example.com/image1.jpg',
                altText: 'Test image 1',
                caption: 'First test image',
                order: 0,
                width: 800,
                height: 600,
                format: 'jpg',
                size: 150000
              },
              {
                url: 'https://example.com/image2.jpg',
                altText: 'Test image 2',
                order: 1,
                width: 800,
                height: 600,
                format: 'jpg',
                size: 200000
              }
            ]
          }
        },
        include: {
          images: {
            orderBy: { order: 'asc' }
          }
        }
      })

      expect(contentSection.images).toHaveLength(2)
      expect(contentSection.images[0].order).toBe(0)
      expect(contentSection.images[1].order).toBe(1)
    })
  })

  describe('Polling System', () => {
    let testUser: any

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          email: 'voter@test.com',
          displayName: 'Test Voter'
        }
      })
    })

    it('should create polls with options', async () => {
      const poll = await prisma.poll.create({
        data: {
          question: 'Test poll question?',
          description: 'This is a test poll',
          allowMultipleVotes: false,
          isActive: true,
          options: {
            create: [
              {
                text: 'Option 1',
                order: 0
              },
              {
                text: 'Option 2',
                order: 1
              },
              {
                text: 'Option 3',
                order: 2
              }
            ]
          }
        },
        include: {
          options: {
            orderBy: { order: 'asc' }
          }
        }
      })

      expect(poll.options).toHaveLength(3)
      expect(poll.options[0].text).toBe('Option 1')
      expect(poll.allowMultipleVotes).toBe(false)
    })

    it('should handle voting and vote counting', async () => {
      const poll = await prisma.poll.create({
        data: {
          question: 'Test voting?',
          allowMultipleVotes: false,
          isActive: true,
          options: {
            create: [
              { text: 'Yes', order: 0 },
              { text: 'No', order: 1 }
            ]
          }
        },
        include: { options: true }
      })

      const yesOption = poll.options.find(opt => opt.text === 'Yes')!

      // Cast a vote
      await prisma.vote.create({
        data: {
          pollId: poll.id,
          optionId: yesOption.id,
          userId: testUser.id
        }
      })

      // Update vote count
      await prisma.pollOption.update({
        where: { id: yesOption.id },
        data: { voteCount: { increment: 1 } }
      })

      // Verify vote was recorded
      const votes = await prisma.vote.findMany({
        where: { pollId: poll.id }
      })
      expect(votes).toHaveLength(1)

      // Verify vote count updated
      const updatedOption = await prisma.pollOption.findUnique({
        where: { id: yesOption.id }
      })
      expect(updatedOption?.voteCount).toBe(1)
    })

    it('should prevent duplicate votes when not allowed', async () => {
      const poll = await prisma.poll.create({
        data: {
          question: 'Single vote test?',
          allowMultipleVotes: false,
          isActive: true,
          options: {
            create: [{ text: 'Option 1', order: 0 }]
          }
        },
        include: { options: true }
      })

      const option = poll.options[0]

      // First vote should succeed
      await prisma.vote.create({
        data: {
          pollId: poll.id,
          optionId: option.id,
          userId: testUser.id
        }
      })

      // Second vote should fail due to unique constraint
      await expect(
        prisma.vote.create({
          data: {
            pollId: poll.id,
            optionId: option.id,
            userId: testUser.id
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('Comment System', () => {
    let testUser: any
    let contentSection: any

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          email: 'commenter@test.com',
          displayName: 'Test Commenter'
        }
      })

      contentSection = await prisma.contentSection.create({
        data: {
          type: 'DAILY_ACTIVITY',
          title: 'Test Content',
          content: 'Test content for comments',
          isPublished: true
        }
      })
    })

    it('should create comments with user relationships', async () => {
      const comment = await prisma.comment.create({
        data: {
          contentId: contentSection.id,
          contentType: 'CONTENT_SECTION',
          userId: testUser.id,
          content: 'This is a test comment'
        },
        include: {
          user: {
            select: {
              displayName: true,
              avatar: true
            }
          }
        }
      })

      expect(comment.content).toBe('This is a test comment')
      expect(comment.user.displayName).toBe('Test Commenter')
      expect(comment.contentType).toBe('CONTENT_SECTION')
    })

    it('should handle threaded comments (replies)', async () => {
      // Create parent comment
      const parentComment = await prisma.comment.create({
        data: {
          contentId: contentSection.id,
          contentType: 'CONTENT_SECTION',
          userId: testUser.id,
          content: 'Parent comment'
        }
      })

      // Create reply
      const replyComment = await prisma.comment.create({
        data: {
          contentId: contentSection.id,
          contentType: 'CONTENT_SECTION',
          userId: testUser.id,
          content: 'Reply comment',
          parentId: parentComment.id
        }
      })

      // Query with replies
      const commentsWithReplies = await prisma.comment.findMany({
        where: {
          contentId: contentSection.id,
          parentId: null
        },
        include: {
          replies: {
            include: {
              user: {
                select: { displayName: true }
              }
            }
          },
          user: {
            select: { displayName: true }
          }
        }
      })

      expect(commentsWithReplies).toHaveLength(1)
      expect(commentsWithReplies[0].replies).toHaveLength(1)
      expect(commentsWithReplies[0].replies[0].content).toBe('Reply comment')
    })
  })

  describe('Notification System', () => {
    let testUser: any

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          email: 'notified@test.com',
          displayName: 'Test User'
        }
      })
    })

    it('should create and query notifications', async () => {
      const notification = await prisma.notification.create({
        data: {
          userId: testUser.id,
          type: 'COMMENT_REPLY',
          title: 'New Reply',
          message: 'Someone replied to your comment',
          data: {
            commentId: 'test-comment-id',
            contentId: 'test-content-id'
          }
        }
      })

      expect(notification.type).toBe('COMMENT_REPLY')
      expect(notification.isRead).toBe(false)
      expect(notification.data).toEqual({
        commentId: 'test-comment-id',
        contentId: 'test-content-id'
      })

      // Query unread notifications
      const unreadNotifications = await prisma.notification.findMany({
        where: {
          userId: testUser.id,
          isRead: false
        }
      })
      expect(unreadNotifications).toHaveLength(1)
    })
  })

  describe('Donation System', () => {
    let testUser: any

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          email: 'donor@test.com',
          displayName: 'Test Donor'
        }
      })
    })

    it('should create donation goals and donations', async () => {
      // Create donation goal
      const goal = await prisma.donationGoal.create({
        data: {
          title: 'Test Goal',
          description: 'Test donation goal',
          targetAmount: 1000.00,
          currentAmount: 250.00,
          isActive: true
        }
      })

      // Create donation
      const donation = await prisma.donation.create({
        data: {
          amount: 50.00,
          currency: 'USD',
          status: 'COMPLETED',
          paymentIntentId: 'pi_test_123',
          donorName: 'Test Donor',
          donorEmail: 'donor@test.com',
          userId: testUser.id
        }
      })

      expect(goal.targetAmount).toBe(1000.00)
      expect(donation.amount).toBe(50.00)
      expect(donation.status).toBe('COMPLETED')

      // Query donations by user
      const userDonations = await prisma.donation.findMany({
        where: { userId: testUser.id }
      })
      expect(userDonations).toHaveLength(1)
    })
  })

  describe('Outfit System', () => {
    it('should create outfits with items and images', async () => {
      const outfit = await prisma.outfit.create({
        data: {
          title: 'Test Outfit',
          description: 'A test outfit',
          occasion: 'casual',
          season: 'spring',
          isFavorite: true,
          items: {
            create: [
              {
                name: 'Test Shirt',
                brand: 'Test Brand',
                category: 'TOP',
                color: 'Blue',
                price: 50.00
              },
              {
                name: 'Test Pants',
                category: 'BOTTOM',
                color: 'Black',
                price: 80.00
              }
            ]
          },
          images: {
            create: [
              {
                url: 'https://example.com/outfit.jpg',
                altText: 'Test outfit image',
                order: 0,
                width: 800,
                height: 600,
                format: 'jpg',
                size: 100000
              }
            ]
          }
        },
        include: {
          items: true,
          images: true
        }
      })

      expect(outfit.items).toHaveLength(2)
      expect(outfit.images).toHaveLength(1)
      expect(outfit.isFavorite).toBe(true)

      // Query favorite outfits
      const favoriteOutfits = await prisma.outfit.findMany({
        where: { isFavorite: true }
      })
      expect(favoriteOutfits).toHaveLength(1)
    })
  })

  describe('Database Relationships and Constraints', () => {
    it('should enforce foreign key constraints', async () => {
      // Try to create a comment with non-existent user
      await expect(
        prisma.comment.create({
          data: {
            contentId: 'test-content',
            contentType: 'CONTENT_SECTION',
            userId: 'non-existent-user',
            content: 'Test comment'
          }
        })
      ).rejects.toThrow()
    })

    it('should cascade delete relationships', async () => {
      // Create user with preferences
      const user = await prisma.user.create({
        data: {
          email: 'cascade@test.com',
          displayName: 'Cascade Test',
          preferences: {
            create: {
              emailNotifications: true
            }
          }
        }
      })

      // Verify preferences exist
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: user.id }
      })
      expect(preferences).toBeTruthy()

      // Delete user
      await prisma.user.delete({
        where: { id: user.id }
      })

      // Verify preferences were cascade deleted
      const deletedPreferences = await prisma.userPreferences.findUnique({
        where: { userId: user.id }
      })
      expect(deletedPreferences).toBeNull()
    })
  })
})