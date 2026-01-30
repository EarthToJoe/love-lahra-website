import { Resend } from 'resend'
import { prisma } from './prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

export const NotificationType = {
  NEW_CONTENT: 'NEW_CONTENT',
  COMMENT_REPLY: 'COMMENT_REPLY',
  MENTION: 'MENTION',
  POLL_RESULT: 'POLL_RESULT',
  DONATION_RECEIVED: 'DONATION_RECEIVED',
  SYSTEM: 'SYSTEM',
} as const

export const NotificationChannel = {
  EMAIL: 'EMAIL',
  IN_APP: 'IN_APP',
  PUSH: 'PUSH',
} as const

export interface NotificationData {
  userId: string
  type: 'NEW_CONTENT' | 'COMMENT_REPLY' | 'COMMENT_MENTION' | 'POLL_RESULT' | 'DONATION_RECEIVED' | 'SYSTEM'
  title: string
  message: string
  data?: any
  email?: string
  userPreferences?: {
    emailNotifications: boolean
    commentNotifications: boolean
    newContentNotifications: boolean
    pollNotifications: boolean
  }
}

export interface SendNotificationParams {
  userId: string
  type: string
  title: string
  message: string
  data?: any
  channels: string[]
}

export interface ContentNotificationParams {
  contentType: string
  contentTitle: string
  contentId: string
  authorId: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Email templates for different notification types
const getEmailTemplate = (notification: NotificationData): EmailTemplate => {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  switch (notification.type) {
    case 'NEW_CONTENT':
      return {
        subject: `New Content: ${notification.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3a8a, #d4af37); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Lahra's Life</h1>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #1e3a8a; margin-bottom: 20px;">${notification.title}</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                ${notification.message}
              </p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${baseUrl}" style="background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View on Website
                </a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>You're receiving this because you subscribed to updates from Lahra's Life.</p>
              <p><a href="${baseUrl}/profile" style="color: #d4af37;">Manage your notification preferences</a></p>
            </div>
          </div>
        `,
        text: `${notification.title}\n\n${notification.message}\n\nView on website: ${baseUrl}`
      }

    case 'COMMENT_REPLY':
      return {
        subject: 'Someone replied to your comment',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3a8a, #d4af37); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Lahra's Life</h1>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #1e3a8a; margin-bottom: 20px;">New Reply to Your Comment</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                ${notification.message}
              </p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${baseUrl}" style="background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View Reply
                </a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>You're receiving this because someone replied to your comment.</p>
              <p><a href="${baseUrl}/profile" style="color: #d4af37;">Manage your notification preferences</a></p>
            </div>
          </div>
        `,
        text: `New Reply to Your Comment\n\n${notification.message}\n\nView reply: ${baseUrl}`
      }

    case 'COMMENT_MENTION':
      return {
        subject: 'You were mentioned in a comment',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3a8a, #d4af37); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Lahra's Life</h1>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #1e3a8a; margin-bottom: 20px;">You Were Mentioned!</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                ${notification.message}
              </p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${baseUrl}" style="background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View Mention
                </a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>You're receiving this because you were mentioned in a comment.</p>
              <p><a href="${baseUrl}/profile" style="color: #d4af37;">Manage your notification preferences</a></p>
            </div>
          </div>
        `,
        text: `You Were Mentioned!\n\n${notification.message}\n\nView mention: ${baseUrl}`
      }

    case 'POLL_RESULT':
      return {
        subject: 'Poll results updated',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3a8a, #d4af37); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Lahra's Life</h1>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #1e3a8a; margin-bottom: 20px;">Poll Update</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                ${notification.message}
              </p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${baseUrl}/polls" style="background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View Poll Results
                </a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>You're receiving this because you subscribed to poll updates.</p>
              <p><a href="${baseUrl}/profile" style="color: #d4af37;">Manage your notification preferences</a></p>
            </div>
          </div>
        `,
        text: `Poll Update\n\n${notification.message}\n\nView poll results: ${baseUrl}/polls`
      }

    default:
      return {
        subject: notification.title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3a8a, #d4af37); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Lahra's Life</h1>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #1e3a8a; margin-bottom: 20px;">${notification.title}</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                ${notification.message}
              </p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${baseUrl}" style="background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Visit Website
                </a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>You're receiving this from Lahra's Life.</p>
              <p><a href="${baseUrl}/profile" style="color: #d4af37;">Manage your notification preferences</a></p>
            </div>
          </div>
        `,
        text: `${notification.title}\n\n${notification.message}\n\nVisit website: ${baseUrl}`
      }
  }
}

// Check if user should receive email notification based on preferences
const shouldSendEmailNotification = (notification: NotificationData): boolean => {
  const prefs = notification.userPreferences
  if (!prefs || !prefs.emailNotifications) return false

  switch (notification.type) {
    case 'NEW_CONTENT':
      return prefs.newContentNotifications
    case 'COMMENT_REPLY':
    case 'COMMENT_MENTION':
      return prefs.commentNotifications
    case 'POLL_RESULT':
      return prefs.pollNotifications
    case 'DONATION_RECEIVED':
    case 'SYSTEM':
      return true // Always send important notifications
    default:
      return false
  }
}

// Send email notification
export const sendEmailNotification = async (notification: NotificationData): Promise<boolean> => {
  try {
    if (!notification.email || !shouldSendEmailNotification(notification)) {
      return false
    }

    const template = getEmailTemplate(notification)

    const result = await resend.emails.send({
      from: 'Lahra\'s Life <notifications@lahraslife.com>',
      to: [notification.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    console.log('Email notification sent:', result)
    return true

  } catch (error) {
    console.error('Failed to send email notification:', error)
    return false
  }
}

// Create and send notification (both in-app and email)
export const createNotification = async (notification: NotificationData): Promise<void> => {
  try {
    // Create in-app notification via API
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create in-app notification')
    }

    // Send email notification if applicable
    if (notification.email) {
      await sendEmailNotification(notification)
    }

  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

// Helper functions for specific notification types
export const notifyNewContent = async (userId: string, email: string, contentTitle: string, contentType: string, userPreferences: any) => {
  await createNotification({
    userId,
    email,
    type: 'NEW_CONTENT',
    title: 'New Content Posted',
    message: `Lahra just posted: ${contentTitle}`,
    data: { contentType },
    userPreferences
  })
}

export const notifyCommentReply = async (userId: string, email: string, commenterName: string, contentTitle: string, userPreferences: any) => {
  await createNotification({
    userId,
    email,
    type: 'COMMENT_REPLY',
    title: 'New Reply',
    message: `${commenterName} replied to your comment on "${contentTitle}"`,
    data: { contentTitle },
    userPreferences
  })
}

export const notifyCommentMention = async (userId: string, email: string, mentionerName: string, contentTitle: string, userPreferences: any) => {
  await createNotification({
    userId,
    email,
    type: 'COMMENT_MENTION',
    title: 'You Were Mentioned',
    message: `${mentionerName} mentioned you in a comment on "${contentTitle}"`,
    data: { contentTitle },
    userPreferences
  })
}

export const notifyPollResult = async (userId: string, email: string, pollQuestion: string, userPreferences: any) => {
  await createNotification({
    userId,
    email,
    type: 'POLL_RESULT',
    title: 'Poll Results Updated',
    message: `New votes on: ${pollQuestion}`,
    data: { pollQuestion },
    userPreferences
  })
}

// Get user notification preferences
export const getUserPreferences = async (userId: string) => {
  try {
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    })
    
    return preferences || {
      userId,
      emailNotifications: true,
      inAppNotifications: true,
      pushNotifications: false,
      contentUpdates: true,
      commentNotifications: true,
      newContentNotifications: true,
      pollNotifications: true,
    }
  } catch (error) {
    console.error('Failed to get user preferences:', error)
    return null
  }
}

// Send notification through specified channels
export const sendNotification = async (params: SendNotificationParams) => {
  try {
    const { userId, type, title, message, data, channels } = params
    
    // Create in-app notification if requested
    if (channels.includes('IN_APP')) {
      await prisma.notification.create({
        data: {
          userId,
          type: type as any,
          title,
          message,
          data: data || undefined,
          isRead: false,
        }
      })
    }

    // Send email notification if requested
    if (channels.includes('EMAIL')) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (user?.email) {
        const template = getEmailTemplate({
          userId,
          type: type as any,
          title,
          message,
          data,
          email: user.email,
        })

        await resend.emails.send({
          from: 'Lahra\'s Life <notifications@lahraslife.com>',
          to: [user.email],
          subject: template.subject,
          html: template.html,
          text: template.text,
        })
      }
    }

    // TODO: Implement push notifications when channels includes 'PUSH'
    
    return { success: true }
  } catch (error) {
    console.error('Failed to send notification:', error)
    throw error
  }
}

// Send content notifications to all subscribed users
export const sendContentNotifications = async (params: ContentNotificationParams) => {
  try {
    const { contentType, contentTitle, contentId, authorId } = params
    
    // Get all users who want content update notifications
    const subscribedUsers = await prisma.user.findMany({
      where: {
        preferences: {
          newContentNotifications: true,
          emailNotifications: true,
        }
      },
      include: {
        preferences: true,
      }
    })

    // Send notification to each subscribed user
    const notificationPromises = subscribedUsers.map(async (user) => {
      try {
        const preferences = await getUserPreferences(user.id)
        if (!preferences || !preferences.newContentNotifications) return

        // Determine which channels to use based on user preferences
        const channels = []
        if (preferences.emailNotifications) channels.push('EMAIL')
        if (preferences.pushNotifications) channels.push('PUSH')
        // Always include in-app notifications
        channels.push('IN_APP')

        if (channels.length === 0) return

        await sendNotification({
          userId: user.id,
          type: 'NEW_CONTENT',
          title: `New ${contentType}: ${contentTitle}`,
          message: `Lahra just posted new ${contentType} content: ${contentTitle}`,
          data: {
            contentType,
            contentId,
            contentTitle,
          },
          channels,
        })
      } catch (error) {
        console.error(`Failed to send notification to user ${user.id}:`, error)
        // Continue with other users even if one fails
      }
    })

    await Promise.allSettled(notificationPromises)
  } catch (error) {
    console.error('Failed to send content notifications:', error)
    // Don't throw - handle gracefully
  }
}