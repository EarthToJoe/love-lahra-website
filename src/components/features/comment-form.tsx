'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
  placeholder?: string
  buttonText?: string
  className?: string
  autoFocus?: boolean
}

export function CommentForm({ 
  onSubmit, 
  placeholder = "Share your thoughts...",
  buttonText = "Post Comment",
  className = '',
  autoFocus = false
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || submitting) return

    try {
      setSubmitting(true)
      await onSubmit(content.trim())
      setContent('')
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">You</span>
          </div>
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
            rows={3}
            maxLength={1000}
          />
          
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">
              {content.length}/1000 characters
            </span>
            
            <div className="flex space-x-2">
              {content.trim() && (
                <button
                  type="button"
                  onClick={() => setContent('')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear
                </button>
              )}
              
              <button
                type="submit"
                disabled={!content.trim() || submitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 font-medium"
              >
                {submitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Posting...</span>
                  </div>
                ) : (
                  buttonText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.form>
  )
}