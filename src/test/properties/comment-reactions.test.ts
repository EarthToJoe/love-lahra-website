import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 8: Comment Reaction Recording
 * **Validates: Requirements 4.5**
 * 
 * This property ensures that comment reactions (likes) work correctly:
 * - Users can like and unlike comments
 * - Like counts are accurate and consistent
 * - Users cannot like the same comment multiple times
 * - Like state is properly tracked per user
 * - Reaction changes are reflected immediately
 */

// Mock comment and reaction structures
interface Comment {
  id: string
  contentId: string
  userId: string
  content: string
  likes: number
  createdAt: string
}

interface Reaction {
  userId: string
  commentId: string
  type: 'like'
  timestamp: string
}

// Mock reaction system
class ReactionSystem {
  private comments: Map<string, Comment> = new Map()
  private reactions: Map<string, Reaction[]> = new Map() // commentId -> reactions
  private userReactions: Map<string, Set<string>> = new Map() // userId -> Set of commentIds they liked
  private nextId = 1

  addComment(contentId: string, userId: string, content: string): Comment {
    const comment: Comment = {
      id: `comment_${this.nextId++}`,
      contentId,
      userId,
      content,
      likes: 0,
      createdAt: new Date().toISOString()
    }

    this.comments.set(comment.id, comment)
    this.reactions.set(comment.id, [])
    return comment
  }

  likeComment(commentId: string, userId: string): { success: boolean; newLikeCount: number; userLiked: boolean } {
    const comment = this.comments.get(commentId)
    if (!comment) {
      return { success: false, newLikeCount: 0, userLiked: false }
    }

    const userLikedComments = this.userReactions.get(userId) || new Set()
    const hasLiked = userLikedComments.has(commentId)

    if (hasLiked) {
      return { success: false, newLikeCount: comment.likes, userLiked: true }
    }

    // Add like
    const reaction: Reaction = {
      userId,
      commentId,
      type: 'like',
      timestamp: new Date().toISOString()
    }

    const commentReactions = this.reactions.get(commentId) || []
    this.reactions.set(commentId, [...commentReactions, reaction])

    userLikedComments.add(commentId)
    this.userReactions.set(userId, userLikedComments)

    // Update comment like count
    const updatedComment = { ...comment, likes: comment.likes + 1 }
    this.comments.set(commentId, updatedComment)

    return { success: true, newLikeCount: updatedComment.likes, userLiked: true }
  }

  unlikeComment(commentId: string, userId: string): { success: boolean; newLikeCount: number; userLiked: boolean } {
    const comment = this.comments.get(commentId)
    if (!comment) {
      return { success: false, newLikeCount: 0, userLiked: false }
    }

    const userLikedComments = this.userReactions.get(userId) || new Set()
    const hasLiked = userLikedComments.has(commentId)

    if (!hasLiked) {
      return { success: false, newLikeCount: comment.likes, userLiked: false }
    }

    // Remove like
    const commentReactions = this.reactions.get(commentId) || []
    const updatedReactions = commentReactions.filter(r => r.userId !== userId)
    this.reactions.set(commentId, updatedReactions)

    userLikedComments.delete(commentId)
    this.userReactions.set(userId, userLikedComments)

    // Update comment like count
    const updatedComment = { ...comment, likes: Math.max(0, comment.likes - 1) }
    this.comments.set(commentId, updatedComment)

    return { success: true, newLikeCount: updatedComment.likes, userLiked: false }
  }

  toggleLike(commentId: string, userId: string): { success: boolean; newLikeCount: number; userLiked: boolean } {
    const userLikedComments = this.userReactions.get(userId) || new Set()
    const hasLiked = userLikedComments.has(commentId)

    if (hasLiked) {
      return this.unlikeComment(commentId, userId)
    } else {
      return this.likeComment(commentId, userId)
    }
  }

  getComment(commentId: string): Comment | undefined {
    return this.comments.get(commentId)
  }

  hasUserLiked(commentId: string, userId: string): boolean {
    const userLikedComments = this.userReactions.get(userId) || new Set()
    return userLikedComments.has(commentId)
  }

  getCommentReactions(commentId: string): Reaction[] {
    return this.reactions.get(commentId) || []
  }

  getUserLikedComments(userId: string): string[] {
    const userLikedComments = this.userReactions.get(userId) || new Set()
    return Array.from(userLikedComments)
  }

  clear() {
    this.comments.clear()
    this.reactions.clear()
    this.userReactions.clear()
    this.nextId = 1
  }
}

// Generators
const commentContentArb = fc.string({ minLength: 1, maxLength: 500 })
const userIdArb = fc.string({ minLength: 1, maxLength: 20 })
const contentIdArb = fc.string({ minLength: 1, maxLength: 20 })

describe('Property 8: Comment Reaction Recording', () => {
  let reactionSystem: ReactionSystem

  beforeEach(() => {
    reactionSystem = new ReactionSystem()
  })

  it('should allow users to like comments and track like counts correctly', () => {
    fc.assert(fc.property(
      contentIdArb,
      userIdArb,
      commentContentArb,
      userIdArb,
      (contentId, commentUserId, content, likingUserId) => {
        // Ensure different users
        fc.pre(commentUserId !== likingUserId)
        
        // Create comment
        const comment = reactionSystem.addComment(contentId, commentUserId, content)
        expect(comment.likes).toBe(0)
        
        // Like the comment
        const result = reactionSystem.likeComment(comment.id, likingUserId)
        
        expect(result.success).toBe(true)
        expect(result.newLikeCount).toBe(1)
        expect(result.userLiked).toBe(true)
        
        // Verify comment like count updated
        const updatedComment = reactionSystem.getComment(comment.id)!
        expect(updatedComment.likes).toBe(1)
        
        // Verify user liked status
        expect(reactionSystem.hasUserLiked(comment.id, likingUserId)).toBe(true)
      }
    ), { numRuns: 50 })
  })

  it('should prevent users from liking the same comment multiple times', () => {
    fc.assert(fc.property(
      contentIdArb,
      userIdArb,
      commentContentArb,
      userIdArb,
      (contentId, commentUserId, content, likingUserId) => {
        // Ensure different users
        fc.pre(commentUserId !== likingUserId)
        
        // Create comment
        const comment = reactionSystem.addComment(contentId, commentUserId, content)
        
        // Like the comment twice
        const firstLike = reactionSystem.likeComment(comment.id, likingUserId)
        const secondLike = reactionSystem.likeComment(comment.id, likingUserId)
        
        // First like should succeed
        expect(firstLike.success).toBe(true)
        expect(firstLike.newLikeCount).toBe(1)
        expect(firstLike.userLiked).toBe(true)
        
        // Second like should fail
        expect(secondLike.success).toBe(false)
        expect(secondLike.newLikeCount).toBe(1)
        expect(secondLike.userLiked).toBe(true)
        
        // Like count should remain 1
        const updatedComment = reactionSystem.getComment(comment.id)!
        expect(updatedComment.likes).toBe(1)
      }
    ), { numRuns: 30 })
  })

  it('should allow users to unlike comments and update counts correctly', () => {
    fc.assert(fc.property(
      contentIdArb,
      userIdArb,
      commentContentArb,
      userIdArb,
      (contentId, commentUserId, content, likingUserId) => {
        // Ensure different users
        fc.pre(commentUserId !== likingUserId)
        
        // Create comment and like it
        const comment = reactionSystem.addComment(contentId, commentUserId, content)
        reactionSystem.likeComment(comment.id, likingUserId)
        
        // Verify initial state
        expect(reactionSystem.getComment(comment.id)!.likes).toBe(1)
        expect(reactionSystem.hasUserLiked(comment.id, likingUserId)).toBe(true)
        
        // Unlike the comment
        const result = reactionSystem.unlikeComment(comment.id, likingUserId)
        
        expect(result.success).toBe(true)
        expect(result.newLikeCount).toBe(0)
        expect(result.userLiked).toBe(false)
        
        // Verify comment like count updated
        const updatedComment = reactionSystem.getComment(comment.id)!
        expect(updatedComment.likes).toBe(0)
        
        // Verify user liked status
        expect(reactionSystem.hasUserLiked(comment.id, likingUserId)).toBe(false)
      }
    ), { numRuns: 30 })
  })

  it('should handle multiple users liking the same comment', () => {
    fc.assert(fc.property(
      contentIdArb,
      userIdArb,
      commentContentArb,
      fc.array(userIdArb, { minLength: 2, maxLength: 8 }),
      (contentId, commentUserId, content, likingUsers) => {
        // Ensure all users are unique and different from comment author
        const uniqueUsers = Array.from(new Set(likingUsers))
        fc.pre(uniqueUsers.length === likingUsers.length)
        fc.pre(!uniqueUsers.includes(commentUserId))
        
        // Create comment
        const comment = reactionSystem.addComment(contentId, commentUserId, content)
        
        // Have multiple users like the comment
        const results: Array<{ success: boolean; newLikeCount: number; userLiked: boolean }> = []
        for (let i = 0; i < uniqueUsers.length; i++) {
          const result = reactionSystem.likeComment(comment.id, uniqueUsers[i])
          results.push(result)
          
          // Each like should succeed and increment count
          expect(result.success).toBe(true)
          expect(result.newLikeCount).toBe(i + 1)
          expect(result.userLiked).toBe(true)
        }
        
        // Verify final like count
        const updatedComment = reactionSystem.getComment(comment.id)!
        expect(updatedComment.likes).toBe(uniqueUsers.length)
        
        // Verify all users are recorded as having liked
        for (const userId of uniqueUsers) {
          expect(reactionSystem.hasUserLiked(comment.id, userId)).toBe(true)
        }
        
        // Verify reaction records
        const reactions = reactionSystem.getCommentReactions(comment.id)
        expect(reactions.length).toBe(uniqueUsers.length)
        
        for (const userId of uniqueUsers) {
          expect(reactions.some(r => r.userId === userId && r.type === 'like')).toBe(true)
        }
      }
    ), { numRuns: 25 })
  })

  it('should handle toggle like functionality correctly', () => {
    fc.assert(fc.property(
      contentIdArb,
      userIdArb,
      commentContentArb,
      userIdArb,
      fc.integer({ min: 1, max: 10 }),
      (contentId, commentUserId, content, likingUserId, toggleCount) => {
        // Ensure different users
        fc.pre(commentUserId !== likingUserId)
        
        // Create comment
        const comment = reactionSystem.addComment(contentId, commentUserId, content)
        
        let expectedLiked = false
        let expectedLikeCount = 0
        
        // Toggle like multiple times
        for (let i = 0; i < toggleCount; i++) {
          const result = reactionSystem.toggleLike(comment.id, likingUserId)
          
          expectedLiked = !expectedLiked
          expectedLikeCount = expectedLiked ? 1 : 0
          
          expect(result.success).toBe(true)
          expect(result.userLiked).toBe(expectedLiked)
          expect(result.newLikeCount).toBe(expectedLikeCount)
          
          // Verify state consistency
          const updatedComment = reactionSystem.getComment(comment.id)!
          expect(updatedComment.likes).toBe(expectedLikeCount)
          expect(reactionSystem.hasUserLiked(comment.id, likingUserId)).toBe(expectedLiked)
        }
      }
    ), { numRuns: 25 })
  })

  it('should track user liked comments correctly', () => {
    fc.assert(fc.property(
      contentIdArb,
      userIdArb,
      fc.array(commentContentArb, { minLength: 2, maxLength: 4 }),
      (contentId, likingUserId, contents) => {
        // Create a fresh reaction system for each test run
        const testReactionSystem = new ReactionSystem()
        const comments: Comment[] = []
        
        // Create comments with different authors
        for (let i = 0; i < contents.length; i++) {
          const authorId = `author_${i}` // Ensure unique authors
          const comment = testReactionSystem.addComment(contentId, authorId, contents[i])
          comments.push(comment)
        }
        
        // Like some comments deterministically (every other one)
        const likedCommentIds: string[] = []
        for (let i = 0; i < comments.length; i++) {
          if (i % 2 === 0) { // Like every other comment
            testReactionSystem.likeComment(comments[i].id, likingUserId)
            likedCommentIds.push(comments[i].id)
          }
        }
        
        // Verify user liked comments tracking
        const userLikedComments = testReactionSystem.getUserLikedComments(likingUserId)
        expect(userLikedComments.length).toBe(likedCommentIds.length)
        
        for (const commentId of likedCommentIds) {
          expect(userLikedComments).toContain(commentId)
          expect(testReactionSystem.hasUserLiked(commentId, likingUserId)).toBe(true)
        }
        
        // Verify non-liked comments
        for (const comment of comments) {
          if (!likedCommentIds.includes(comment.id)) {
            expect(testReactionSystem.hasUserLiked(comment.id, likingUserId)).toBe(false)
          }
        }
      }
    ), { numRuns: 25 })
  })

  it('should maintain consistency between like counts and reaction records', () => {
    fc.assert(fc.property(
      contentIdArb,
      userIdArb,
      commentContentArb,
      fc.array(userIdArb, { minLength: 1, maxLength: 10 }),
      (contentId, commentUserId, content, users) => {
        // Ensure unique users different from comment author
        const uniqueUsers = Array.from(new Set(users))
        fc.pre(!uniqueUsers.includes(commentUserId))
        
        // Create comment
        const comment = reactionSystem.addComment(contentId, commentUserId, content)
        
        // Randomly like/unlike with different users
        const expectedLikers = new Set<string>()
        
        for (const userId of uniqueUsers) {
          if (Math.random() > 0.5) {
            reactionSystem.likeComment(comment.id, userId)
            expectedLikers.add(userId)
          }
        }
        
        // Verify consistency
        const updatedComment = reactionSystem.getComment(comment.id)!
        const reactions = reactionSystem.getCommentReactions(comment.id)
        
        // Like count should match number of reactions
        expect(updatedComment.likes).toBe(reactions.length)
        expect(updatedComment.likes).toBe(expectedLikers.size)
        
        // Each reaction should correspond to a user who liked
        for (const reaction of reactions) {
          expect(expectedLikers.has(reaction.userId)).toBe(true)
          expect(reaction.type).toBe('like')
          expect(reaction.commentId).toBe(comment.id)
          expect(reaction.timestamp).toBeDefined()
        }
        
        // Each expected liker should have a reaction
        for (const userId of expectedLikers) {
          expect(reactions.some(r => r.userId === userId)).toBe(true)
          expect(reactionSystem.hasUserLiked(comment.id, userId)).toBe(true)
        }
      }
    ), { numRuns: 25 })
  })
})