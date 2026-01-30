'use client'

import { useState } from 'react'
import { Button } from './button'
import { Modal } from './modal'

interface ReportButtonProps {
  contentId: string
  contentType: 'comment' | 'poll' | 'content' | 'user'
  className?: string
}

export function ReportButton({ contentId, contentType, className }: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReported, setIsReported] = useState(false)

  const reportReasons = [
    'Spam or unwanted content',
    'Inappropriate or offensive content',
    'Harassment or bullying',
    'False information',
    'Copyright violation',
    'Other'
  ]

  const handleSubmitReport = async () => {
    if (!reason.trim()) {
      alert('Please select a reason for reporting')
      return
    }

    setIsSubmitting(true)
    try {
      // In a real app, this would make an API call
      const reportData = {
        contentId,
        contentType,
        reason,
        description: description.trim(),
        reportedAt: new Date().toISOString()
      }

      console.log('Submitting report:', reportData)
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsReported(true)
      setShowModal(false)
      
      // Reset form
      setReason('')
      setDescription('')
      
      alert('Thank you for your report. We will review it shortly.')
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Error submitting report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isReported) {
    return (
      <span className="text-xs text-gray-500">
        ✓ Reported
      </span>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`text-xs text-gray-500 hover:text-red-600 transition-colors ${className}`}
        title="Report this content"
      >
        🚩 Report
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      >
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Report Content</h3>
          <p className="text-gray-600">
            Help us keep the community safe by reporting inappropriate content.
          </p>

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why are you reporting this {contentType}? *
            </label>
            <div className="space-y-2">
              {reportReasons.map((reportReason) => (
                <label key={reportReason} className="flex items-center">
                  <input
                    type="radio"
                    name="reason"
                    value={reportReason}
                    checked={reason === reportReason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{reportReason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context that might help us understand the issue..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReport}
              disabled={isSubmitting || !reason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}