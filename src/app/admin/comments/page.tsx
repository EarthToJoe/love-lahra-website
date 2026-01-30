'use client'

import { ModerationPanel } from '@/components/admin/moderation-panel'

export default function AdminCommentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <ModerationPanel />
    </div>
  )
}