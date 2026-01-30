'use client'

import { ReactNode } from 'react'

interface ContentSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function ContentSection({ title, children, className = '' }: ContentSectionProps) {
  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {title}
        </h2>
        {children}
      </div>
    </section>
  )
}