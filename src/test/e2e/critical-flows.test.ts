import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'

/**
 * End-to-End Critical Flow Tests
 * 
 * These tests verify the most critical user flows work correctly
 * with the actual database and API routes.
 */

const prisma = new PrismaClient()

describe('Critical User Flows - E2E', () => {
  let testUserId: string
  let testUserEmail: string

  beforeAll(async () => {
    // Create a test user for E2E tests
    testUserEmail = `test-e2e-${Date.now()}@example.com`
    const testUser = await prisma.user.create({
      data: {
        email: testUserEmail,
        displayName: 'E2E Test User',
        password: '$2b$12$testhashedpassword', // Mock hash
        role: 'USER',
      }
    })
    testUserId = testUser.id
  })

  afterAll(async () => {
    // Cleanup: Delete test user and related data
    await prisma.comment.deleteMany({ where: { userId: testUserId } })
    await prisma.vote.deleteMany({ where: { userId: testUserId } })
    await prisma.user.delete({ where: { id: testUserId } })
    await prisma.$disconnect()
  })

  describe('Authentication Flow', () => {
    it('should have user created in database', async () => {
      const user = await prisma.user.findUnique({
        where: { email: testUserEmail }
      })

      expect(user).toBeDefined()
      expect(user?.displayName).toBe('E2E Test User')
      expect(user?.role).toBe('USER')
    })

    it('should have password field populated', async () => {
      const user = await prisma.user.findUnique({
        where: { email: testUserEmail },
        select: { password: true }
      })

      expect(user?.password).toBeDefined()
      expect(user?.password).not.toBe('')
    })
  })

  describe('Comment System Flow', () => {
    let testCommentId: string

    it('should create a comment successfully', async () => {
      const comment = await prisma.comment.create({
        data: {
          contentId: 'test-content-1',
          contentType: 'GENERAL',
          userId: testUserId,
          content: 'This is a test comment',
        }
      })

      testCommentId = comment.id
      expect(comment).toBeDefined()
      expect(comment.content).toBe('This is a test comment')
      expect(comment.userId).toBe(testUserId)
    })

    it('should retrieve comment with user information', async () => {
      const comment = await prisma.comment.findUnique({
        where: { id: testCommentId },
        include: { user: true }
      })

      expect(comment).toBeDefined()
      expect(comment?.user.displayName).toBe('E2E Test User')
      expect(comment?.user.email).toBe(testUserEmail)
    })

    it('should create a reply to a comment', async () => {
      const reply = await prisma.comment.create({
        data: {
          contentId: 'test-content-1',
          contentType: 'GENERAL',
          userId: testUserId,
          content: 'This is a reply',
          parentId: testCommentId,
        }
      })

      expect(reply).toBeDefined()
      expect(reply.parentId).toBe(testCommentId)
    })

    it('should retrieve comment with replies', async () => {
      const comment = await prisma.comment.findUnique({
        where: { id: testCommentId },
        include: { replies: true }
      })

      expect(comment).toBeDefined()
      expect(comment?.replies.length).toBeGreaterThan(0)
      expect(comment?.replies[0].content).toBe('This is a reply')
    })

    it('should update comment likes', async () => {
      const updated = await prisma.comment.update({
        where: { id: testCommentId },
        data: { likes: { increment: 1 } }
      })

      expect(updated.likes).toBe(1)
    })
  })

  describe('Poll System Flow', () => {
    let testPollId: string
    let testOptionId: string

    it('should create a poll with options', async () => {
      const poll = await prisma.poll.create({
        data: {
          question: 'Test Poll Question?',
          description: 'This is a test poll',
          isActive: true,
          options: {
            create: [
              { text: 'Option A', order: 0 },
              { text: 'Option B', order: 1 },
            ]
          }
        },
        include: { options: true }
      })

      testPollId = poll.id
      testOptionId = poll.options[0].id

      expect(poll).toBeDefined()
      expect(poll.options.length).toBe(2)
      expect(poll.options[0].text).toBe('Option A')
    })

    it('should record a vote', async () => {
      const vote = await prisma.vote.create({
        data: {
          pollId: testPollId,
          optionId: testOptionId,
          userId: testUserId,
        }
      })

      expect(vote).toBeDefined()
      expect(vote.pollId).toBe(testPollId)
      expect(vote.userId).toBe(testUserId)
    })

    it('should prevent duplicate votes', async () => {
      await expect(
        prisma.vote.create({
          data: {
            pollId: testPollId,
            optionId: testOptionId,
            userId: testUserId,
          }
        })
      ).rejects.toThrow()
    })

    it('should update vote count', async () => {
      const updated = await prisma.pollOption.update({
        where: { id: testOptionId },
        data: { voteCount: { increment: 1 } }
      })

      expect(updated.voteCount).toBeGreaterThan(0)
    })

    // Cleanup
    afterAll(async () => {
      await prisma.vote.deleteMany({ where: { pollId: testPollId } })
      await prisma.pollOption.deleteMany({ where: { pollId: testPollId } })
      await prisma.poll.delete({ where: { id: testPollId } })
    })
  })

  describe('Database Relationships', () => {
    it('should enforce foreign key constraints', async () => {
      await expect(
        prisma.comment.create({
          data: {
            contentId: 'test',
            contentType: 'GENERAL',
            userId: 'non-existent-user-id',
            content: 'Test',
          }
        })
      ).rejects.toThrow()
    })

    it('should cascade delete user data', async () => {
      // Create a temporary user with comments
      const tempUser = await prisma.user.create({
        data: {
          email: `temp-${Date.now()}@example.com`,
          displayName: 'Temp User',
          password: 'hash',
          role: 'USER',
        }
      })

      const comment = await prisma.comment.create({
        data: {
          contentId: 'test',
          contentType: 'GENERAL',
          userId: tempUser.id,
          content: 'Temp comment',
        }
      })

      // Delete user should cascade delete comments
      await prisma.user.delete({ where: { id: tempUser.id } })

      const deletedComment = await prisma.comment.findUnique({
        where: { id: comment.id }
      })

      expect(deletedComment).toBeNull()
    })
  })

  describe('Data Integrity', () => {
    it('should maintain consistent timestamps', async () => {
      const before = new Date()
      
      const comment = await prisma.comment.create({
        data: {
          contentId: 'test',
          contentType: 'GENERAL',
          userId: testUserId,
          content: 'Timestamp test',
        }
      })

      const after = new Date()

      const createdAt = new Date(comment.createdAt)
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should handle special characters in content', async () => {
      const specialContent = 'Test with special chars: <script>alert("xss")</script> & "quotes" \'apostrophes\''
      
      const comment = await prisma.comment.create({
        data: {
          contentId: 'test',
          contentType: 'GENERAL',
          userId: testUserId,
          content: specialContent,
        }
      })

      expect(comment.content).toBe(specialContent)
    })

    it('should handle unicode and emojis', async () => {
      const emojiContent = 'Test with emojis: 😀 🎉 💯 and unicode: 你好 مرحبا'
      
      const comment = await prisma.comment.create({
        data: {
          contentId: 'test',
          contentType: 'GENERAL',
          userId: testUserId,
          content: emojiContent,
        }
      })

      expect(comment.content).toBe(emojiContent)
    })
  })
})
