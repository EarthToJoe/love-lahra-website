'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ui/image-upload'

interface PollOption {
  text: string
  image?: string
}

interface PollCreatorProps {
  onCreatePoll: (pollData: any) => Promise<void>
  onCancel?: () => void
  className?: string
}

export function PollCreator({ onCreatePoll, onCancel, className = '' }: PollCreatorProps) {
  const [question, setQuestion] = useState('')
  const [description, setDescription] = useState('')
  const [questionImage, setQuestionImage] = useState('') // Added question image state
  const [options, setOptions] = useState<PollOption[]>([
    { text: '' },
    { text: '' }
  ])
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { text: '' }])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, field: keyof PollOption, value: string) => {
    const updatedOptions = [...options]
    updatedOptions[index] = { ...updatedOptions[index], [field]: value }
    setOptions(updatedOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!question.trim()) {
      alert('Please enter a question')
      return
    }

    const validOptions = options.filter(opt => opt.text.trim())
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options')
      return
    }

    setIsCreating(true)
    try {
      await onCreatePoll({
        question: question.trim(),
        description: description.trim() || undefined,
        questionImage: questionImage.trim() || undefined, // Include question image
        options: validOptions,
        allowMultipleVotes,
        expiresAt: expiresAt || undefined
      })
      
      // Reset form
      setQuestion('')
      setDescription('')
      setQuestionImage('') // Reset question image
      setOptions([{ text: '' }, { text: '' }])
      setAllowMultipleVotes(false)
      setExpiresAt('')
    } catch (error) {
      console.error('Error creating poll:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className={`bg-white rounded-2xl p-8 shadow-lg ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Poll</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poll Question *
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Which outfit should I wear to the gala?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any additional context or details..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Question Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Image (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-3">Add a hero image to make your poll more engaging</p>
          <ImageUpload
            category="polls"
            onUploadSuccess={(fileInfo) => setQuestionImage(fileInfo.url)}
            onUploadError={(error) => console.error('Upload error:', error)}
            className="max-w-md"
          />
          {questionImage && (
            <div className="mt-3 relative">
              <img src={questionImage} alt="Question" className="w-full max-w-md h-32 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => setQuestionImage('')}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Poll Options *
          </label>
          <div className="space-y-4">
            {options.map((option, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Image Upload for Option */}
                  <div className="ml-11">
                    <p className="text-xs text-gray-500 mb-2">Add an image (optional)</p>
                    <ImageUpload
                      category="polls"
                      onUploadSuccess={(fileInfo) => updateOption(index, 'image', fileInfo.url)}
                      onUploadError={(error) => console.error('Upload error:', error)}
                      className="max-w-xs"
                    />
                    {option.image && (
                      <div className="mt-2 flex items-center space-x-2">
                        <img src={option.image} alt="Option" className="w-12 h-12 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => updateOption(index, 'image', '')}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Add Option</span>
            </button>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="allowMultiple"
              checked={allowMultipleVotes}
              onChange={(e) => setAllowMultipleVotes(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="allowMultiple" className="text-sm font-medium text-gray-700">
              Allow multiple votes per user
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isCreating}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isCreating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </div>
            ) : (
              'Create Poll'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}