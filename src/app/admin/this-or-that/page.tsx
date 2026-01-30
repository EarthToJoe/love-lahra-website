'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface ThisOrThatQuestion {
  id: string
  title: string
  optionA: {
    image: string
    label: string
    votes: number
  }
  optionB: {
    image: string
    label: string
    votes: number
  }
  totalVotes: number
  createdAt: string
  isActive: boolean
}

interface NewQuestion {
  title: string
  optionA: {
    image: string
    label: string
  }
  optionB: {
    image: string
    label: string
  }
}

export default function AdminThisOrThatPage() {
  const [questions, setQuestions] = useState<ThisOrThatQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState<NewQuestion>({
    title: '',
    optionA: { image: '', label: '' },
    optionB: { image: '', label: '' }
  })

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/this-or-that?includeInactive=true')
      if (!response.ok) throw new Error('Failed to fetch questions')
      
      const data = await response.json()
      setQuestions(data.questions || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.title || !newQuestion.optionA.image || !newQuestion.optionA.label || 
        !newQuestion.optionB.image || !newQuestion.optionB.label) {
      alert('Please fill in all fields')
      return
    }

    try {
      setCreating(true)
      const response = await fetch('/api/this-or-that', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      })

      if (!response.ok) throw new Error('Failed to create question')
      
      // Reset form and refresh questions
      setNewQuestion({
        title: '',
        optionA: { image: '', label: '' },
        optionB: { image: '', label: '' }
      })
      setShowCreateForm(false)
      await fetchQuestions()
    } catch (error) {
      console.error('Error creating question:', error)
      alert('Failed to create question')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">This or That Management</h1>
            <p className="text-gray-600 mt-2">Manage visual vibe-based questions</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {showCreateForm ? 'Cancel' : 'Create New Question'}
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New This or That Question</h2>
            
            <form onSubmit={handleCreateQuestion} className="space-y-6">
              {/* Question Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Title
                </label>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Hydrangea or Tulip?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Option A */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Option A</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label
                    </label>
                    <input
                      type="text"
                      value={newQuestion.optionA.label}
                      onChange={(e) => setNewQuestion(prev => ({
                        ...prev,
                        optionA: { ...prev.optionA, label: e.target.value }
                      }))}
                      placeholder="e.g., Hydrangea"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={newQuestion.optionA.image}
                      onChange={(e) => setNewQuestion(prev => ({
                        ...prev,
                        optionA: { ...prev.optionA, image: e.target.value }
                      }))}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  {/* Image Preview */}
                  {newQuestion.optionA.image && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image
                        src={newQuestion.optionA.image}
                        alt="Option A Preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}
                </div>

                {/* Option B */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Option B</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label
                    </label>
                    <input
                      type="text"
                      value={newQuestion.optionB.label}
                      onChange={(e) => setNewQuestion(prev => ({
                        ...prev,
                        optionB: { ...prev.optionB, label: e.target.value }
                      }))}
                      placeholder="e.g., Tulip"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={newQuestion.optionB.image}
                      onChange={(e) => setNewQuestion(prev => ({
                        ...prev,
                        optionB: { ...prev.optionB, image: e.target.value }
                      }))}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  {/* Image Preview */}
                  {newQuestion.optionB.image && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image
                        src={newQuestion.optionB.image}
                        alt="Option B Preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Question'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Existing Questions ({questions.length})
          </h2>
          
          {questions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {questions.map((question, index) => {
                const percentageA = question.totalVotes > 0 ? Math.round((question.optionA.votes / question.totalVotes) * 100) : 0
                const percentageB = question.totalVotes > 0 ? Math.round((question.optionB.votes / question.totalVotes) * 100) : 0

                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    {/* Question Header */}
                    <div className="p-6 pb-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {question.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            question.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {question.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>Total votes: {question.totalVotes}</p>
                        <p>Created: {new Date(question.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Options Display */}
                    <div className="grid grid-cols-2 gap-0">
                      {/* Option A */}
                      <div className="relative">
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={question.optionA.image}
                            alt={question.optionA.label}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                          <h4 className="text-white font-medium mb-1">
                            {question.optionA.label}
                          </h4>
                          <div className="text-white text-sm">
                            <span className="font-bold">{percentageA}%</span>
                            <span className="ml-2 opacity-80">({question.optionA.votes} votes)</span>
                          </div>
                        </div>
                      </div>

                      {/* Option B */}
                      <div className="relative">
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={question.optionB.image}
                            alt={question.optionB.label}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                          <h4 className="text-white font-medium mb-1">
                            {question.optionB.label}
                          </h4>
                          <div className="text-white text-sm">
                            <span className="font-bold">{percentageB}%</span>
                            <span className="ml-2 opacity-80">({question.optionB.votes} votes)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Results Bar */}
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentageA}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="text-sm font-medium text-gray-600">VS</div>
                        
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentageB}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
              <p className="text-gray-500">Create your first This or That question to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}