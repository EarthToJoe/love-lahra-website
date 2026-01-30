import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 7: Content Moderation Flagging
 * **Validates: Requirements 4.3**
 * 
 * This property ensures that content moderation and flagging works correctly:
 * - Comments can be flagged by users with valid reasons
 * - Multiple flags accumulate correctly
 * - Auto-moderation triggers at appropriate thresholds
 * - Moderation actions (approve/reject/hide) work properly
 * - Flag history is maintained accurately
 */

// Mock comment and moderation structures
interface Comment {
  id: string
  contentId: string
  userId: string
  content: string
  isModerated: boolean
  isApproved: boolean
  createdAt: string
}

interface Flag {
  userId: string
  reason: string
  timestamp: string
}

interface ModerationAction {
  moderatorId: string
  action: 'approve' | 'reject' | 'hide'
  timestamp: string
  reason?: string
}

// Mock moderation system
class ModerationSystem {
  private comments: Map<string, Comment> = new Map()
  private flags: Map<string, Flag[]> = new Map() // commentId -> flags
  private moderationActions: Map<string, ModerationAction[]> = new Map() // commentId -> actions
  private autoModerationThreshold = 3
  private nextId = 1

  addComment(contentId: string, userId: string, content: string): Comment {
    const comment: Comment = {
      id: `comment_${this.nextId++}`,
      contentId,
      userId,
      content,
      isModerated: false,
      isApproved: true, // Auto-approve by default
      createdAt: new Date().toISOString()
    }

    this.comments.set(comment.id, comment)
    return comment
  }

  flagComment(commentId: string, userId: string, reason: string): boolean {
    const comment = this.comments.get(commentId)
    if (!comment) return false

    // Check if user already flagged this comment
    const existingFlags = this.flags.get(commentId) || []
    if (existingFlags.some(flag => flag.userId === userId)) {
      return false // User already flagged
    }

    // Add flag
    const flag: Flag = {
      userId,
      reason,
      timestamp: new Date().toISOString()
    }

    const updatedFlags = [...existingFlags, flag]
    this.flags.set(commentId, updatedFlags)

    // Check for auto-moderation
    if (updatedFlags.length >= this.autoModerationThreshold) {
      this.autoModerate(commentId)
    }

    return true
  }

  private autoModerate(commentId: string): void {
    const comment = this.comments.get(commentId)
    if (!comment) return

    const updatedComment = {
      ...comment,
      isModerated: true,
      isApproved: false // Auto-reject when too many flags
    }

    this.comments.set(commentId, updatedComment)
  }

  moderateComment(commentId: string, moderatorId: string, action: 'approve' | 'reject' | 'hide', reason?: string): boolean {
    const comment = this.comments.get(commentId)
    if (!comment) return false

    // Record moderation action
    const moderationAction: ModerationAction = {
      moderatorId,
      action,
      timestamp: new Date().toISOString(),
      reason
    }

    const existingActions = this.moderationActions.get(commentId) || []
    this.moderationActions.set(commentId, [...existingActions, moderationAction])

    // Update comment status
    const updatedComment = {
      ...comment,
      isModerated: true,
      isApproved: action === 'approve'
    }

    this.comments.set(commentId, updatedComment)

    // Clear flags when approved
    if (action === 'approve') {
      this.flags.delete(commentId)
    }

    return true
  }

  getComment(commentId: string): Comment | undefined {
    return this.comments.get(commentId)
  }

  getFlags(commentId: string): Flag[] {
    return this.flags.get(commentId) || []
  }

  getModerationActions(commentId: string): ModerationAction[] {
    return this.moderationActions.get(commentId) || []
  }

  getApprovedComments(contentId: string): Comment[] {
    return Array.from(this.comments.values())
      .filter(c => c.contentId === contentId && c.isApproved)
  }

  clear() {
    this.comments.clear()
    this.flags.clear()
    this.moderationActions.clear()
    this.nextId = 1
  }
}

// Generators
const commentContentArb = fc.string({ minLength: 1, maxLength: 500 })
const userIdArb = fc.string({ minLength: 1, maxLength: 20 })
const contentIdArb = fc.string({ minLength: 1, maxLength: 20 })
const moderatorIdArb = fc.string({ minLength: 1, maxLength: 20 })
const flagReasonArb = fc.constantFrom('spam', 'inappropriate', 'harassment', 'off-topic', 'misinformation')
const moderationActionArb = fc.constantFrom('approve', 'reject', 'hide')

describe('Property 7: Content Moderation Flagging', () => {
  let moderationSystem: ModerationSystem

  beforeEach(() => {
    moderationSystem = new ModerationSystem()
  })

  it('should allow users to flag comments with valid reasons', () => {
    fc.assert(fc.property(
      contentIdArb,
      userIdArb,
      commentContentArb,
      userIdArb,
      flagReasonArb,
      (contentId, commentUserId, content, flaggingUserId, reason) => {
        // Ensure different users
        fc.pre(commentUserId !== flaggingUserId)
        
        // Create comment
        const comment = moderationSystem.addComment(contentId, commentUserId, content)
        
        // Flag the comment
        const flagResult = moderationSystem.flagComment(comment.id, flaggingUserId, reason)
        
        // Verify flag was added
        expect(flagResult).toBe(true)
        
        const flags = moderationSystem.getFlags(comment.id)
        expect(flags.length).toBe(1)
        expect(flags[0].userId).toBe(flaggingUserId)
        expect(flags[0].reason).toBe(reason)
        expect(flags[0].timestamp).toBeDefined()
      }
    ), { numRuns: 50 })
  })

  it('should prevent duplicate flags from the same user', () => {
    fc.assert(fc.property(
      contentIdArb,
      userIdArb,
      commentContentArb,
      userIdArb,
      flagReasonArb,
      flagReasonArb,
      (contentId, commentUserId, content, flaggingUserId, reason1, reason2) => {
        // Ensure different users
        fc.pre(commentUserId !== flaggingUserId)
        
        // Create comment
        const comment = moderationSystem.addComment(contentId, commentUserId, content)
        
        // Flag the comment twice with same user
        const firstFlag = moderationSystem.flagComment(comment.id, flaggingUserId, reason1)
        const secondFlag = moderationSystem.flagComment(comment.id, flaggingUserId, reason2)
        
        // Verify first flag succeeded, second failed
        expect(firstFlag).toBe(true)
        expect(secondFlag).toBe(false)
        
        const flags = moderationSystem.getFlags(comment.id)
        expect(flags.length).toBe(1)
        expect(flags[0].reason).toBe(reason1) // Only first flag should be recorded
      }
    ), { numRuns: 30 })
  })

  it('should accumulate multiple flags from different users', () => {
    fc.assert(fc.property(
      contentIdArb,
      userIdArb,
      commentContentArb,
      fc.array(fc.tuple(userIdArb, flagReasonArb), { minLength: 2, maxLength: 5 }),
      (contentId, commentUserId, content, flaggers) => {
        // Ensure all flaggers are different from comment author and each other
        const uniqueFlaggers = Array.from(new Set(flaggers.map(([userId]) => userId)))
        fc.pre(uniqueFlaggers.length === flaggers.length)
        fc.pre(!uniqueFlaggers.includes(commentUserId))
        
        // Create comment
        const comment = moderationSystem.addComment(contentId, commentUserId, content)
        
        // Flag by multiple users
        const flagResults: boolean[] = []
        for (const [userId, reason] of flaggers) {
          const result = moderationSystem.flagComment(comment.id, userId, reason)
          flagResults.push(result)
        }
        
        // Verify all flags succeeded
        expect(flagResults.every(result => result === true)).toBe(true)
        
        const flags = moderationSystem.getFlags(comment.id)
        expect(flags.length).toBe(flaggers.length)
        
        // Verify each flag is recorded correctly
        for (let i = 0; i < flaggers.length; i++) {
          const [expectedUserId, expectedReason] = flaggers[i]
          expect(flags.some(flag => flag.userId === expectedUserId && flag.reason === expectedReason)).toBe(true)
        }
      }
    ), { numRuns: 25 })
  })

  it('should trigger auto-moderation at appropriate thresholds', () => {
    fc.assert(fc.property(
      contentIdArb,
      userIdArb,
      commentContentArb,
      fc.array(fc.tuple(userIdArb, flagReasonArb), { minLength: 3, maxLength: 6 }),
      (contentId, commentUserId, content, flaggers) => {
        // Ensure all flaggers are different from comment author and each other
        const uniqueFlaggers = Array.from(new Set(flaggers.map(([userId]) => userId)))
        fc.pre(uniqueFlaggers.length === flaggers.length)
        fc.pre(!uniqueFlaggers.includes(commentUserId))
        
        // Create comment
        const comment = moderationSystem.addComment(contentId, commentUserId, content)
        
        // Initially approved
        expect(comment.isApproved).toBe(true)
        expect(comment.isModerated).toBe(false)
        
        // Flag by multiple users
        for (let i = 0; i < flaggers.length; i++) {
          const [userId, reason] = flaggers[i]
          moderationSystem.flagComment(comment.id, userId, reason)
          
          const updatedComment = moderationSystem.getComment(comment.id)!
          
          if (i + 1 >= 3) { // Auto-moderation threshold
            expect(updatedComment.isModerated).toBe(true)
            expect(updatedComment.isApproved).toBe(false)
          } else {
            expect(updatedComment.isModerated).toBe(false)
            expect(updatedComment.isApproved).toBe(true)
          }
        }
      }
    ), { numRuns: 25 })
  })

  it('should handle moderation actions correctly', () => {
    fc.assert(fc.property(
      contentIdArb,
      userIdArb,
      commentContentArb,
      moderatorIdArb,
      moderationActionArb,
      (contentId, commentUserId, content, moderatorId, action) => {
        // Create comment
        const comment = moderationSystem.addComment(contentId, commentUserId, content)
        
        // Perform moderation action
        const result = moderationSystem.moderateComment(comment.id, moderatorId, action)
        
        expect(result).toBe(true)
        
        const updatedComment = moderationSystem.getComment(comment.id)!
        expect(updatedComment.isModerated).toBe(true)
        expect(updatedComment.isApproved).toBe(action === 'approve')
        
        // Verify moderation action is recorded
        const actions = moderationSystem.getModerationActions(comment.id)
        expect(actions.length).toBe(1)
        expect(actions[0].moderatorId).toBe(moderatorId)
        expect(actions[0].action).toBe(action)
        expect(actions[0].timestamp).toBeDefined()
      }
    ), { numRuns: 50 })
  })

  it('should clear flags when comment is approved', () => {
    fc.assert(fc.property(
      contentIdArb,
      userIdArb,
      commentContentArb,
      fc.array(fc.tuple(userIdArb, flagReasonArb), { minLength: 2, maxLength: 4 }),
      moderatorIdArb,
      (contentId, commentUserId, content, flaggers, moderatorId) => {
        // Ensure all flaggers are different
        const uniqueFlaggers = Array.from(new Set(flaggers.map(([userId]) => userId)))
        fc.pre(uniqueFlaggers.length === flaggers.length)
        fc.pre(!uniqueFlaggers.includes(commentUserId))
        fc.pre(!uniqueFlaggers.includes(moderatorId))
        
        // Create comment
        const comment = moderationSystem.addComment(contentId, commentUserId, content)
        
        // Add flags
        for (const [userId, reason] of flaggers) {
          moderationSystem.flagComment(comment.id, userId, reason)
        }
        
        // Verify flags exist
        expect(moderationSystem.getFlags(comment.id).length).toBe(flaggers.length)
        
        // Approve the comment
        moderationSystem.moderateComment(comment.id, moderatorId, 'approve')
        
        // Verify flags are cleared
        expect(moderationSystem.getFlags(comment.id).length).toBe(0)
        
        // Verify comment is approved
        const updatedComment = moderationSystem.getComment(comment.id)!
        expect(updatedComment.isApproved).toBe(true)
        expect(updatedComment.isModerated).toBe(true)
      }
    ), { numRuns: 25 })
  })

  it('should only show approved comments in public views', () => {
    fc.assert(fc.property(
      contentIdArb,
      fc.array(fc.tuple(userIdArb, commentContentArb), { minLength: 3, maxLength: 8 }),
      moderatorIdArb,
      (contentId, commentData, moderatorId) => {
        // Ensure unique users
        const uniqueUsers = Array.from(new Set(commentData.map(([userId]) => userId)))
        fc.pre(uniqueUsers.length === commentData.length)
        
        const comments: Comment[] = []
        
        // Create comments
        for (const [userId, content] of commentData) {
          const comment = moderationSystem.addComment(contentId, userId, content)
          comments.push(comment)
        }
        
        // Randomly moderate some comments
        const moderatedComments = new Set<string>()
        for (let i = 0; i < comments.length; i++) {
          if (Math.random() > 0.5) {
            const action = Math.random() > 0.5 ? 'approve' : 'reject'
            moderationSystem.moderateComment(comments[i].id, moderatorId, action)
            moderatedComments.add(comments[i].id)
          }
        }
        
        // Get approved comments
        const approvedComments = moderationSystem.getApprovedComments(contentId)
        
        // Verify only approved comments are returned
        for (const comment of approvedComments) {
          expect(comment.isApproved).toBe(true)
          expect(comment.contentId).toBe(contentId)
        }
        
        // Verify all approved comments are included
        const expectedApprovedCount = comments.filter(c => {
          const updated = moderationSystem.getComment(c.id)!
          return updated.isApproved
        }).length
        
        expect(approvedComments.length).toBe(expectedApprovedCount)
      }
    ), { numRuns: 25 })
  })
})