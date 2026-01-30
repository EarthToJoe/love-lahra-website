'use client'

import { useState, useEffect } from 'react'
import { Comment, User } from '@/types'
import { Button } from '@/components/ui/button'

interface ModerationPanelProps {
  onClose?: () => void
}

export function ModerationPanel({ onClose }: ModerationPanelProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'users' | 'reports'>('comments')
  const [flaggedComments, setFlaggedComments] = useState<Comment[]>([])
  const [reportedContent, setReportedContent] = useState<any[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data for development
  useEffect(() => {
    const loadModerationData = async () => {
      setLoading(true)
      try {
        // Mock flagged comments
        const mockFlaggedComments: Comment[] = [
          {
            id: 'comment-1',
            contentId: 'outfit-1',
            contentType: 'CONTENT_SECTION',
            userId: 'user-1',
            user: {
              id: 'user-1',
              email: 'user1@example.com',
              displayName: 'Anonymous User',
              role: 'user',
              preferences: {
                notifications: { email: true, push: true, comments: true, newContent: true, polls: true },
                privacy: { showProfile: true, allowMentions: true }
              },
              createdAt: new Date(),
              updatedAt: new Date()
            },
            content: 'This is inappropriate content that has been flagged by users.',
            likes: 0,
            isModerated: false,
            isApproved: false,
            createdAt: new Date(Date.now() - 86400000),
            updatedAt: new Date(Date.now() - 86400000)
          },
          {
            id: 'comment-2',
            contentId: 'poll-1',
            contentType: 'POLL',
            userId: 'user-2',
            user: {
              id: 'user-2',
              email: 'user2@example.com',
              displayName: 'Spam User',
              role: 'user',
              preferences: {
                notifications: { email: true, push: true, comments: true, newContent: true, polls: true },
                privacy: { showProfile: true, allowMentions: true }
              },
              createdAt: new Date(),
              updatedAt: new Date()
            },
            content: 'Check out this amazing deal! Click here to buy now!',
            likes: 0,
            isModerated: false,
            isApproved: false,
            createdAt: new Date(Date.now() - 172800000),
            updatedAt: new Date(Date.now() - 172800000)
          }
        ]

        // Mock reported content
        const mockReports = [
          {
            id: 'report-1',
            type: 'comment',
            contentId: 'comment-1',
            reportedBy: 'user-3',
            reason: 'Inappropriate content',
            description: 'This comment contains offensive language',
            status: 'pending',
            createdAt: new Date(Date.now() - 43200000)
          },
          {
            id: 'report-2',
            type: 'comment',
            contentId: 'comment-2',
            reportedBy: 'user-4',
            reason: 'Spam',
            description: 'This looks like spam advertising',
            status: 'pending',
            createdAt: new Date(Date.now() - 21600000)
          }
        ]

        // Mock users
        const mockUsers: User[] = [
          {
            id: 'user-1',
            email: 'user1@example.com',
            displayName: 'Anonymous User',
            role: 'user',
            preferences: {
              notifications: { email: true, push: true, comments: true, newContent: true, polls: true },
              privacy: { showProfile: true, allowMentions: true }
            },
            createdAt: new Date(Date.now() - 2592000000), // 30 days ago
            updatedAt: new Date()
          },
          {
            id: 'user-2',
            email: 'user2@example.com',
            displayName: 'Spam User',
            role: 'user',
            preferences: {
              notifications: { email: true, push: true, comments: true, newContent: true, polls: true },
              privacy: { showProfile: true, allowMentions: true }
            },
            createdAt: new Date(Date.now() - 604800000), // 7 days ago
            updatedAt: new Date()
          }
        ]

        setFlaggedComments(mockFlaggedComments)
        setReportedContent(mockReports)
        setUsers(mockUsers)
      } catch (error) {
        console.error('Error loading moderation data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadModerationData()
  }, [])

  const handleApproveComment = async (commentId: string) => {
    try {
      // In a real app, this would make an API call
      setFlaggedComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, isApproved: true, isModerated: true }
          : comment
      ))
      console.log(`Approved comment: ${commentId}`)
    } catch (error) {
      console.error('Error approving comment:', error)
    }
  }

  const handleRejectComment = async (commentId: string) => {
    try {
      // In a real app, this would make an API call to delete or hide the comment
      setFlaggedComments(prev => prev.filter(comment => comment.id !== commentId))
      console.log(`Rejected comment: ${commentId}`)
    } catch (error) {
      console.error('Error rejecting comment:', error)
    }
  }

  const handleBanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user? This action cannot be undone.')) {
      return
    }

    try {
      // In a real app, this would make an API call
      setUsers(prev => prev.filter(user => user.id !== userId))
      console.log(`Banned user: ${userId}`)
      alert('User has been banned successfully.')
    } catch (error) {
      console.error('Error banning user:', error)
      alert('Error banning user. Please try again.')
    }
  }

  const handleResolveReport = async (reportId: string, action: 'approve' | 'reject') => {
    try {
      // In a real app, this would make an API call
      setReportedContent(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: action === 'approve' ? 'resolved' : 'dismissed' }
          : report
      ))
      console.log(`${action === 'approve' ? 'Resolved' : 'Dismissed'} report: ${reportId}`)
    } catch (error) {
      console.error('Error resolving report:', error)
    }
  }

  const tabs = [
    { id: 'comments', label: 'Flagged Comments', count: flaggedComments.filter(c => !c.isModerated).length },
    { id: 'reports', label: 'Content Reports', count: reportedContent.filter(r => r.status === 'pending').length },
    { id: 'users', label: 'User Management', count: users.length }
  ]

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading moderation data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🛡️ Moderation Panel</h2>
            <p className="text-gray-600">Review flagged content, manage users, and handle reports</p>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'comments' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Flagged Comments</h3>
            {flaggedComments.filter(c => !c.isModerated).length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">✅</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No flagged comments</h4>
                <p className="text-gray-600">All comments have been reviewed. Great job!</p>
              </div>
            ) : (
              flaggedComments.filter(c => !c.isModerated).map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-gray-900">{comment.user.displayName}</span>
                        <span className="text-sm text-gray-500">
                          {comment.createdAt.toLocaleDateString()} at {comment.createdAt.toLocaleTimeString()}
                        </span>
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Flagged
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{comment.content}</p>
                      <div className="text-sm text-gray-500">
                        Content Type: {comment.contentType} | Content ID: {comment.contentId}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveComment(comment.id)}
                        className="text-green-600 hover:text-green-700 hover:border-green-300"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectComment(comment.id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Content Reports</h3>
            {reportedContent.filter(r => r.status === 'pending').length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">📋</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No pending reports</h4>
                <p className="text-gray-600">All reports have been handled.</p>
              </div>
            ) : (
              reportedContent.filter(r => r.status === 'pending').map((report) => (
                <div key={report.id} className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-gray-900">Report #{report.id}</span>
                        <span className="text-sm text-gray-500">
                          {report.createdAt.toLocaleDateString()}
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          {report.reason}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2"><strong>Description:</strong> {report.description}</p>
                      <div className="text-sm text-gray-500">
                        Content Type: {report.type} | Content ID: {report.contentId} | Reported by: {report.reportedBy}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveReport(report.id, 'approve')}
                        className="text-green-600 hover:text-green-700 hover:border-green-300"
                      >
                        Take Action
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveReport(report.id, 'reject')}
                        className="text-gray-600 hover:text-gray-700 hover:border-gray-300"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <div className="grid gap-4">
              {users.map((user) => (
                <div key={user.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-gray-900">{user.displayName}</span>
                        <span className="text-sm text-gray-500">{user.email}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'moderator'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Joined: {user.createdAt.toLocaleDateString()} | 
                        Last active: {user.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBanUser(user.id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                        disabled={user.role === 'admin'}
                      >
                        {user.role === 'admin' ? 'Cannot Ban Admin' : 'Ban User'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}