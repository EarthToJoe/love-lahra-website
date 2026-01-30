// Dynamic imports for code splitting
import dynamic from 'next/dynamic'
import { SkeletonLoader } from '@/components/ui/dynamic-loader'

// Heavy components that should be loaded dynamically
export const DynamicPollWidget = dynamic(
  () => import('@/components/features/poll-widget').then(mod => ({ default: mod.PollWidget })),
  {
    loading: () => <SkeletonLoader type="card" className="h-64" />,
    ssr: false, // Disable SSR for interactive components
  }
)

export const DynamicCommentSystem = dynamic(
  () => import('@/components/features/comment-system').then(mod => ({ default: mod.CommentSystem })),
  {
    loading: () => <SkeletonLoader type="list" className="h-96" />,
    ssr: false,
  }
)

export const DynamicImageGallery = dynamic(
  () => import('@/components/ui/image-gallery').then(mod => ({ default: mod.ImageGallery })),
  {
    loading: () => <SkeletonLoader type="card" className="h-64" />,
    ssr: false,
  }
)

export const DynamicMasonryGallery = dynamic(
  () => import('@/components/ui/masonry-gallery').then(mod => ({ default: mod.MasonryGallery })),
  {
    loading: () => <SkeletonLoader type="card" className="h-64" />,
    ssr: false,
  }
)

export const DynamicDonationWidget = dynamic(
  () => import('@/components/features/donation-widget').then(mod => ({ default: mod.DonationWidget })),
  {
    loading: () => <SkeletonLoader type="card" className="h-48" />,
    ssr: false,
  }
)

export const DynamicNotificationBell = dynamic(
  () => import('@/components/ui/notification-bell').then(mod => ({ default: mod.NotificationBell })),
  {
    loading: () => <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />,
    ssr: false,
  }
)

// Admin components (heavy and rarely used)
export const DynamicContentEditor = dynamic(
  () => import('@/components/admin/content-editor').then(mod => ({ default: mod.ContentEditor })),
  {
    loading: () => <SkeletonLoader type="text" className="h-96" />,
    ssr: false,
  }
)

export const DynamicModerationPanel = dynamic(
  () => import('@/components/admin/moderation-panel').then(mod => ({ default: mod.ModerationPanel })),
  {
    loading: () => <SkeletonLoader type="list" className="h-96" />,
    ssr: false,
  }
)

export const DynamicImageOrganizer = dynamic(
  () => import('@/components/admin/image-organizer').then(mod => ({ default: mod.ImageOrganizer })),
  {
    loading: () => <SkeletonLoader type="card" className="h-96" />,
    ssr: false,
  }
)

// Preload functions for critical components
export const preloadPollWidget = () => import('@/components/features/poll-widget')
export const preloadCommentSystem = () => import('@/components/features/comment-system')
export const preloadImageGallery = () => import('@/components/ui/image-gallery')
