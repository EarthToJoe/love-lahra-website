'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useSocket } from '@/hooks/useSocket'

interface User {
  id: string
  displayName: string
  avatar?: string
}

interface Comment {
  id: string
  contentId: string
  contentType: string
  userId: string
  user: User
  content: string
  parentId?: string
  replies: Comment[]
  likes: number
  isModerated: boolean
  isApproved: boolean
  createdAt: string
  updatedAt: string
}

interface CommentSystemProps {
  contentId: string
  contentType: 'CONTENT_SECTION' | 'OUTFIT' | 'POLL' | 'GENERAL'
  className?: string
}

export function CommentSystem({ 
  contentId, 
  contentType, 
  className = '' 
}: CommentSystemProps) {
  const { data: session } = useSession()
  const currentUserId = session?.user?.email || session?.user?.id // Use email as primary identifier
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set())
  const { isConnected, joinComments, leaveComments, on, off } = useSocket()

  useEffect(() => {
    fetchComments()
  }, [contentId, contentType])

  // Join comments room for real-time updates
  useEffect(() => {
    if (isConnected) {
      joinComments(contentId)
    }

    return () => {
      if (isConnected) {
        leaveComments(contentId)
      }
    }
  }, [isConnected, contentId, joinComments, leaveComments])

  // Listen for real-time comment updates
  useEffect(() => {
    const handleNewComment = (data: { contentId: string; comment: Comment }) => {
      if (data.contentId === contentId) {
        setComments(prev => {
          // If it's a reply, add it to the parent's replies
          if (data.comment.parentId) {
            return updateCommentInTree(prev, data.comment.parentId, (parent) => ({
              ...parent,
              replies: [...parent.replies, data.comment]
            }))
          } else {
            // It's a top-level comment
            return [data.comment, ...prev]
          }
        })
      }
    }

    const handleCommentUpdate = (data: { commentId: string; comment: Comment }) => {
      setComments(prev => updateCommentInTree(prev, data.commentId, data.comment))
    }

    on('new-comment', handleNewComment)
    on('comment-update', handleCommentUpdate)

    return () => {
      off('new-comment', handleNewComment)
      off('comment-update', handleCommentUpdate)
    }
  }, [contentId, on, off])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/comments?contentId=${contentId}&contentType=${contentType}&includeReplies=true`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      
      const data = await response.json()
      setComments(data.comments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUserId || submitting) return

    const commentContent = newComment.trim()
    const tempId = `temp-${Date.now()}`
    
    // Create optimistic comment
    const optimisticComment: Comment = {
      id: tempId,
      contentId,
      contentType,
      userId: currentUserId,
      user: {
        id: currentUserId,
        displayName: session?.user?.name || 'You',
        avatar: session?.user?.image || undefined
      },
      content: commentContent,
      replies: [],
      likes: 0,
      isModerated: false,
      isApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add optimistic comment immediately
    setComments(prev => [optimisticComment, ...prev])
    setNewComment('')

    try {
      setSubmitting(true)
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          contentType,
          userId: currentUserId,
          content: commentContent
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Comment error:', errorData)
        // Remove optimistic comment on error
        setComments(prev => prev.filter(c => c.id !== tempId))
        throw new Error('Failed to post comment')
      }
      
      // Refresh to get the real comment from server
      await fetchComments()
    } catch (error) {
      console.error('Error posting comment:', error)
      // Restore the comment text so user can try again
      setNewComment(commentContent)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !currentUserId || submitting) return

    const replyText = replyContent.trim()
    const tempId = `temp-${Date.now()}`
    
    // Create optimistic reply
    const optimisticReply: Comment = {
      id: tempId,
      contentId,
      contentType,
      userId: currentUserId,
      user: {
        id: currentUserId,
        displayName: session?.user?.name || 'You',
        avatar: session?.user?.image || undefined
      },
      content: replyText,
      parentId,
      replies: [],
      likes: 0,
      isModerated: false,
      isApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add optimistic reply immediately
    setComments(prev => updateCommentInTree(prev, parentId, (parent) => ({
      ...parent,
      replies: [...parent.replies, optimisticReply]
    })))
    setReplyContent('')
    setReplyingTo(null)

    try {
      setSubmitting(true)
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          contentType,
          userId: currentUserId,
          content: replyText,
          parentId
        })
      })

      if (!response.ok) {
        // Remove optimistic reply on error
        setComments(prev => updateCommentInTree(prev, parentId, (parent) => ({
          ...parent,
          replies: parent.replies.filter(r => r.id !== tempId)
        })))
        throw new Error('Failed to post reply')
      }
      
      // Refresh comments to get the real reply
      await fetchComments()
    } catch (error) {
      console.error('Error posting reply:', error)
      // Restore the reply text so user can try again
      setReplyContent(replyText)
      setReplyingTo(parentId)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!currentUserId) return

    try {
      const hasLiked = userLikes.has(commentId)
      const action = hasLiked ? 'unlike' : 'like'
      
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, action })
      })

      if (!response.ok) throw new Error('Failed to like comment')
      
      const data = await response.json()
      
      // Update local state
      const newUserLikes = new Set(userLikes)
      if (data.userLiked) {
        newUserLikes.add(commentId)
      } else {
        newUserLikes.delete(commentId)
      }
      setUserLikes(newUserLikes)
      
      // Real-time update will handle the comment update
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  const handleFlagComment = async (commentId: string, reason: string) => {
    if (!currentUserId) return

    try {
      const response = await fetch(`/api/comments/${commentId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'flag', 
          userId: currentUserId, 
          reason 
        })
      })

      if (!response.ok) throw new Error('Failed to flag comment')
      
      alert('Comment has been flagged for review')
    } catch (error) {
      console.error('Error flagging comment:', error)
      alert('Failed to flag comment')
    }
  }

  // Helper function to update a comment in the nested tree structure
  const updateCommentInTree = (comments: Comment[], commentId: string, updates: Partial<Comment> | ((comment: Comment) => Comment)): Comment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return typeof updates === 'function' ? updates(comment) : { ...comment, ...updates }
      }
      if (comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, commentId, updates)
        }
      }
      return comment
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const renderComment = (comment: Comment, depth = 0) => {
    const isLiked = userLikes.has(comment.id)
    const canReply = currentUserId && depth < 3 // Limit nesting depth
    const isOwner = currentUserId === comment.userId

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'}`}
      >
        <div className="flex space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.user.avatar ? (
              <Image
                src={comment.user.avatar}
                alt={comment.user.displayName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">
                  {comment.user.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">
                  {comment.user.displayName}
                </h4>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(comment.createdAt)}
                </span>
              </div>
              
              <p className="text-gray-700 text-sm leading-relaxed">
                {comment.content}
              </p>
            </div>

            {/* Comment Actions */}
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              {/* Like Button */}
              <button
                onClick={() => handleLikeComment(comment.id)}
                disabled={!currentUserId}
                className={`flex items-center space-x-1 hover:text-blue-600 transition-colors ${
                  isLiked ? 'text-blue-600' : ''
                } ${!currentUserId ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{comment.likes}</span>
              </button>

              {/* Reply Button */}
              {canReply && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="hover:text-blue-600 transition-colors"
                >
                  Reply
                </button>
              )}

              {/* Flag Button */}
              {currentUserId && !isOwner && (
                <button
                  onClick={() => {
                    const reason = prompt('Why are you flagging this comment?')
                    if (reason) handleFlagComment(comment.id, reason)
                  }}
                  className="hover:text-red-600 transition-colors"
                >
                  Flag
                </button>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3"
              >
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyContent('')
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={!replyContent.trim() || submitting}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-blue-400"
                      >
                        {submitting ? 'Posting...' : 'Reply'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="mt-4">
                {comment.replies.map(reply => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="flex space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600 mb-4">Error loading comments: {error}</p>
        <button 
          onClick={fetchComments}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* New Comment Form */}
      {currentUserId ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">You</span>
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg mb-8">
          <p className="text-gray-600 mb-4">Sign in to join the conversation</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Sign In
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        <AnimatePresence>
          {comments.length > 0 ? (
            comments.map(comment => renderComment(comment))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
              <p className="text-gray-500">
                {currentUserId ? 'Be the first to share your thoughts!' : 'Sign in to start the conversation!'}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}