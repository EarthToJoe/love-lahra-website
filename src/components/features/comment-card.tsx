'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { CommentForm } from './comment-form'
import { ReportButton } from '@/components/ui/report-button'

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

interface CommentCardProps {
  comment: Comment
  currentUserId?: string
  depth?: number
  onLike: (commentId: string) => void
  onReply: (parentId: string, content: string) => Promise<void>
  onFlag: (commentId: string, reason: string) => void
  isLiked?: boolean
  className?: string
}

export function CommentCard({
  comment,
  currentUserId,
  depth = 0,
  onLike,
  onReply,
  onFlag,
  isLiked = false,
  className = ''
}: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(true)

  const canReply = currentUserId && depth < 3 // Limit nesting depth
  const isOwner = currentUserId === comment.userId
  const hasReplies = comment.replies.length > 0

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const handleReplySubmit = async (content: string) => {
    await onReply(comment.id, content)
    setShowReplyForm(false)
  }

  const handleFlag = () => {
    const reason = prompt('Why are you flagging this comment?')
    if (reason) {
      onFlag(comment.id, reason)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'} ${className}`}
    >
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.user.avatar ? (
            <Image
              src={comment.user.avatar}
              alt={comment.user.displayName}
              width={depth > 0 ? 32 : 40}
              height={depth > 0 ? 32 : 40}
              className="rounded-full"
            />
          ) : (
            <div className={`${depth > 0 ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center`}>
              <span className="text-white text-sm font-medium">
                {comment.user.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  {comment.user.displayName}
                </h4>
                {isOwner && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    You
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
            {/* Like Button */}
            <button
              onClick={() => onLike(comment.id)}
              disabled={!currentUserId}
              className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                isLiked ? 'text-red-500' : ''
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
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="hover:text-blue-600 transition-colors"
              >
                Reply
              </button>
            )}

            {/* Show/Hide Replies */}
            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="hover:text-blue-600 transition-colors"
              >
                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}

            {/* Report Button */}
            {currentUserId && !isOwner && (
              <ReportButton
                contentId={comment.id}
                contentType="comment"
                className="hover:text-red-600 transition-colors"
              />
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <CommentForm
                onSubmit={handleReplySubmit}
                placeholder="Write a reply..."
                buttonText="Reply"
                autoFocus
              />
            </motion.div>
          )}

          {/* Replies */}
          {hasReplies && showReplies && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 space-y-4"
            >
              {comment.replies.map(reply => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  depth={depth + 1}
                  onLike={onLike}
                  onReply={onReply}
                  onFlag={onFlag}
                  isLiked={false} // You'd need to track this per reply
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}