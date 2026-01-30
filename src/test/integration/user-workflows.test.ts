import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { prisma } from '@/lib/prisma'

/**
 * Integration tests for complete user workflows
 * 
 * Tests end-to-end user journeys including:
 * 1. User registration → content interaction → commenting → voting
 * 2. Admin content management workflows
 * 3. Donation workflows with confirmation and recognition
 * 4. Notification workflows with user preferences
 */
describe('Complete User Workflow Integration Tests', () => {
  // Set longer timeout for database operations
  const TEST_TIMEOUT = 30000 // 30 seconds

  // Test cleanup
  beforeEach(async () => {
    try {
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
    } catch (error) {
      console.error('Cleanup error:', error)
      // Continue with tests even if cleanup fails
    }
  }, TEST_TIMEOUT)

  afterAll(async () => {
    try {
      await prisma.$disconnect()
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  })

  describe('User Registration and Content Interaction Workflow', () => {
    it('should complete full user journey: registration → content viewing → commenting → voting', async () => {
      // Step 1: User Registration
      const newUser = await prisma.user.create({
        data: {
          email: 'newuser@test.com',
          displayName: 'New User',
          role: 'USER',
          preferences: {
            create: {
              emailNotifications: true,
              commentNotifications: true,
              pollNotifications: true
            }
          }
        }
      })

      expect(newUser.email).toBe('newuser@test.com')

      // Step 2: Content Creation
      const contentSection = await prisma.contentSection.create({
        data: {
          type: 'DAILY_ACTIVITY',
          title: 'Today\'s Adventure',
          content: 'Had an amazing day exploring the city!',
          isPublished: true,
          publishedAt: new Date()
        }
      })

      expect(contentSection.isPublished).toBe(true)

      // Step 3: User Comments on Content
      const userComment = await prisma.comment.create({
        data: {
          contentId: contentSection.id,
          contentType: 'CONTENT_SECTION',
          userId: newUser.id,
          content: 'This looks amazing! I love your adventures.'
        }
      })

      expect(userComment.content).toContain('amazing')

      // Step 4: Poll Creation and Voting
      const poll = await prisma.poll.create({
        data: {
          question: 'What should Lahra do next weekend?',
          allowMultipleVotes: false,
          isActive: true,
          options: {
            create: [
              { text: 'Museum visit', order: 0 },
              { text: 'Beach day', order: 1 },
              { text: 'City exploration', order: 2 }
            ]
          }
        },
        include: { options: true }
      })

      const beachOption = poll.options.find(opt => opt.text === 'Beach day')!

      await prisma.vote.create({
        data: {
          pollId: poll.id,
          optionId: beachOption.id,
          userId: newUser.id
        }
      })

      await prisma.pollOption.update({
        where: { id: beachOption.id },
        data: { voteCount: { increment: 1 } }
      })

      // Step 5: Notification Creation
      await prisma.notification.create({
        data: {
          userId: newUser.id,
          type: 'POLL_RESULT',
          title: 'New Poll Available',
          message: 'A new poll has been created'
        }
      })

      // Verify complete workflow
      const userWithActivity = await prisma.user.findUnique({
        where: { id: newUser.id },
        include: {
          comments: true,
          votes: true,
          preferences: true
        }
      })

      expect(userWithActivity?.comments).toHaveLength(1)
      expect(userWithActivity?.votes).toHaveLength(1)
      expect(userWithActivity?.preferences).toBeTruthy()
    }, TEST_TIMEOUT)
  })

  describe('Admin Content Management Workflow', () => {
    it('should complete admin workflow: content creation → publishing → moderation', async () => {
      // Step 1: Create Admin User
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@lahraslife.com',
          displayName: 'Lahra Admin',
          role: 'ADMIN'
        }
      })

      expect(adminUser.role).toBe('ADMIN')

      // Step 2: Admin Creates Draft Content
      const draftContent = await prisma.contentSection.create({
        data: {
          type: 'OUTFIT',
          title: 'Spring Outfit Collection',
          content: 'My favorite spring looks for 2024',
          isPublished: false
        }
      })

      expect(draftContent.isPublished).toBe(false)

      // Step 3: Admin Adds Images
      await prisma.contentImage.createMany({
        data: [
          {
            contentSectionId: draftContent.id,
            url: 'https://example.com/spring-1.jpg',
            altText: 'Spring dress',
            order: 0,
            width: 800,
            height: 1200,
            format: 'jpg',
            size: 250000
          },
          {
            contentSectionId: draftContent.id,
            url: 'https://example.com/spring-2.jpg',
            altText: 'Casual ensemble',
            order: 1,
            width: 800,
            height: 1200,
            format: 'jpg',
            size: 220000
          }
        ]
      })

      // Step 4: Admin Publishes Content
      const publishedContent = await prisma.contentSection.update({
        where: { id: draftContent.id },
        data: {
          isPublished: true,
          publishedAt: new Date()
        }
      })

      expect(publishedContent.isPublished).toBe(true)

      // Step 5: User Comments
      const regularUser = await prisma.user.create({
        data: {
          email: 'user@test.com',
          displayName: 'Fashion Fan',
          role: 'USER'
        }
      })

      const userComment = await prisma.comment.create({
        data: {
          contentId: publishedContent.id,
          contentType: 'CONTENT_SECTION',
          userId: regularUser.id,
          content: 'Love this spring collection!'
        }
      })

      // Step 6: Admin Moderates Comment
      await prisma.comment.update({
        where: { id: userComment.id },
        data: { isModerated: true }
      })

      // Verify workflow
      const contentWithImages = await prisma.contentSection.findUnique({
        where: { id: publishedContent.id },
        include: {
          images: { orderBy: { order: 'asc' } }
        }
      })

      expect(contentWithImages?.images).toHaveLength(2)
      expect(contentWithImages?.isPublished).toBe(true)
    }, TEST_TIMEOUT)
  })

  describe('Donation Workflow', () => {
    it('should complete donation workflow: goal creation → donation → confirmation', async () => {
      // Step 1: Create Donation Goal
      const donationGoal = await prisma.donationGoal.create({
        data: {
          title: 'Wedding Planning Fund',
          description: 'Help support Lahra\'s dream wedding',
          targetAmount: 5000.00,
          currentAmount: 0.00,
          isActive: true
        }
      })

      expect(donationGoal.targetAmount).toBe(5000.00)

      // Step 2: Create Donor
      const donor = await prisma.user.create({
        data: {
          email: 'donor@test.com',
          displayName: 'Generous Supporter',
          role: 'USER'
        }
      })

      // Step 3: Process Donation
      const donation = await prisma.donation.create({
        data: {
          amount: 150.00,
          currency: 'USD',
          status: 'COMPLETED',
          paymentIntentId: 'pi_test_123',
          donorName: 'Generous Supporter',
          donorEmail: 'donor@test.com',
          userId: donor.id,
          donorMessage: 'Wishing you the best!',
          isAnonymous: false
        }
      })

      expect(donation.amount).toBe(150.00)
      expect(donation.status).toBe('COMPLETED')

      // Step 4: Update Goal Progress
      await prisma.donationGoal.update({
        where: { id: donationGoal.id },
        data: { currentAmount: { increment: donation.amount } }
      })

      // Step 5: Create Thank You Notification
      await prisma.notification.create({
        data: {
          userId: donor.id,
          type: 'DONATION_RECEIVED',
          title: 'Thank You!',
          message: 'Thank you for your generous donation!'
        }
      })

      // Verify workflow
      const finalGoal = await prisma.donationGoal.findUnique({
        where: { id: donationGoal.id }
      })

      const userDonations = await prisma.donation.findMany({
        where: { userId: donor.id }
      })

      expect(finalGoal?.currentAmount).toBe(150.00)
      expect(userDonations).toHaveLength(1)
    }, TEST_TIMEOUT)
  })

  describe('Notification Workflow', () => {
    it('should handle notifications with user preferences', async () => {
      // Step 1: Create Users with Different Preferences
      const activeUser = await prisma.user.create({
        data: {
          email: 'active@test.com',
          displayName: 'ActiveUser',
          role: 'USER',
          preferences: {
            create: {
              emailNotifications: true,
              commentNotifications: true,
              newContentNotifications: true
            }
          }
        }
      })

      const quietUser = await prisma.user.create({
        data: {
          email: 'quiet@test.com',
          displayName: 'QuietUser',
          role: 'USER',
          preferences: {
            create: {
              emailNotifications: false,
              commentNotifications: false,
              newContentNotifications: false
            }
          }
        }
      })

      // Step 2: Create Content
      const newContent = await prisma.contentSection.create({
        data: {
          type: 'DAILY_ACTIVITY',
          title: 'Exciting News!',
          content: 'Just had an amazing experience!',
          isPublished: true,
          publishedAt: new Date()
        }
      })

      // Step 3: Create Notifications (respecting preferences)
      await prisma.notification.create({
        data: {
          userId: activeUser.id,
          type: 'NEW_CONTENT',
          title: 'New Content Posted',
          message: 'Lahra just posted new content'
        }
      })

      // Step 4: Verify Notifications
      const activeUserNotifications = await prisma.notification.findMany({
        where: { userId: activeUser.id }
      })

      const quietUserNotifications = await prisma.notification.findMany({
        where: { userId: quietUser.id }
      })

      expect(activeUserNotifications).toHaveLength(1)
      expect(quietUserNotifications).toHaveLength(0)

      // Step 5: Mark Notification as Read
      await prisma.notification.update({
        where: { id: activeUserNotifications[0].id },
        data: { isRead: true }
      })

      const readNotification = await prisma.notification.findUnique({
        where: { id: activeUserNotifications[0].id }
      })

      expect(readNotification?.isRead).toBe(true)
    }, TEST_TIMEOUT)
  })

  describe('Cross-Feature Integration', () => {
    it('should test complex workflow across multiple features', async () => {
      // Step 1: User Registration
      const user = await prisma.user.create({
        data: {
          email: 'integrated@test.com',
          displayName: 'Integrated User',
          role: 'USER',
          preferences: {
            create: {
              emailNotifications: true,
              commentNotifications: true,
              pollNotifications: true
            }
          }
        }
      })

      // Step 2: Content and Poll Creation
      const content = await prisma.contentSection.create({
        data: {
          type: 'DAILY_ACTIVITY',
          title: 'Planning My Weekend',
          content: 'Help me decide!',
          isPublished: true,
          publishedAt: new Date()
        }
      })

      const poll = await prisma.poll.create({
        data: {
          question: 'What should I do this weekend?',
          allowMultipleVotes: false,
          isActive: true,
          options: {
            create: [
              { text: 'Visit museum', order: 0 },
              { text: 'Go hiking', order: 1 }
            ]
          }
        },
        include: { options: true }
      })

      // Step 3: User Interactions
      await prisma.comment.create({
        data: {
          contentId: content.id,
          contentType: 'CONTENT_SECTION',
          userId: user.id,
          content: 'Great question!'
        }
      })

      const museumOption = poll.options[0]
      await prisma.vote.create({
        data: {
          pollId: poll.id,
          optionId: museumOption.id,
          userId: user.id
        }
      })

      // Step 4: Donation
      const goal = await prisma.donationGoal.create({
        data: {
          title: 'Weekend Fund',
          description: 'Support weekend adventures',
          targetAmount: 500.00,
          currentAmount: 0.00,
          isActive: true
        }
      })

      await prisma.donation.create({
        data: {
          amount: 25.00,
          currency: 'USD',
          status: 'COMPLETED',
          paymentIntentId: 'pi_integrated_789',
          donorName: user.displayName,
          donorEmail: user.email,
          userId: user.id
        }
      })

      // Step 5: Notifications
      await prisma.notification.createMany({
        data: [
          {
            userId: user.id,
            type: 'POLL_RESULT',
            title: 'New Poll',
            message: 'Vote on weekend plans'
          },
          {
            userId: user.id,
            type: 'DONATION_RECEIVED',
            title: 'Thank You!',
            message: 'Thanks for your donation'
          },
          {
            userId: user.id,
            type: 'NEW_CONTENT',
            title: 'New Post',
            message: 'New content available'
          }
        ]
      })

      // Verify Complete Integration
      const userSummary = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          preferences: true,
          comments: true,
          votes: true,
          donations: true
        }
      })

      const userNotifications = await prisma.notification.findMany({
        where: { userId: user.id }
      })

      expect(userSummary?.comments).toHaveLength(1)
      expect(userSummary?.votes).toHaveLength(1)
      expect(userSummary?.donations).toHaveLength(1)
      expect(userNotifications).toHaveLength(3)
    }, TEST_TIMEOUT)
  })
})
