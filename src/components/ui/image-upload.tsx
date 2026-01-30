'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  category?: string
  onUploadSuccess?: (fileInfo: any) => void
  onUploadError?: (error: string) => void
  className?: string
  accept?: string
  maxSize?: number
}

export function ImageUpload({ 
  category = 'general',
  onUploadSuccess,
  onUploadError,
  className = '',
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  maxSize = 5 * 1024 * 1024 // 5MB
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return

    const file = files[0]
    
    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      onUploadError?.(`File too large. Maximum size is ${maxSizeMB}MB.`)
      return
    }

    // Validate file type
    const allowedTypes = accept.split(',')
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        onUploadSuccess?.(result.file)
      } else {
        onUploadError?.(result.error || 'Upload failed')
      }
    } catch (error) {
      onUploadError?.('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isUploading ? openFileDialog : undefined}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-4">📸</div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your image here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              JPEG, PNG, WebP up to 5MB
            </p>
            <Button variant="outline" type="button">
              Choose File
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}