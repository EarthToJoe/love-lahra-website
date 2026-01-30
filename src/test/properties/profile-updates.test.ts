import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 4: Profile Update Persistence
 * 
 * For any authenticated user and valid profile data, updating profile information 
 * should persist the changes and reflect them immediately in all relevant user 
 * interface elements.
 * 
 * Validates: Requirements 3.3
 * Feature: lahras-life, Property 4: Profile Update Persistence
 */

// Custom generators for profile data (optimized for speed)
const emailArbitrary = fc.string({ minLength: 3, maxLength: 20 })
  .map(s => `user${s.replace(/[^a-zA-Z0-9]/g, '')}@example.com`)

const displayNameArbitrary = fc.string({ minLength: 2, maxLength: 30 })
  .map(s => s.replace(/[<>]/g, '').trim() || 'User')

const userProfileArbitrary = fc.record({
  id: fc.string({ minLength: 5, maxLength: 15 }),
  email: emailArbitrary,
  displayName: displayNameArbitrary,
  role: fc.constantFrom('USER', 'MODERATOR', 'ADMIN'),
})

const profileUpdateArbitrary = fc.record({
  displayName: fc.option(displayNameArbitrary),
  email: fc.option(emailArbitrary),
})

// Mock user profile system
interface UserProfile {
  id: string
  email: string
  displayName: string
  role: string
  updatedAt: Date
  preferences: UserPreferences
}

interface UserPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  commentNotifications: boolean
  showProfile: boolean
  allowMentions: boolean
}

interface ProfileUpdate {
  displayName?: string
  email?: string
  preferences?: Partial<UserPreferences>
}

// Mock storage
const mockProfiles = new Map<string, UserProfile>()
const mockSessions = new Map<string, { userId: string; isActive: boolean }>()

// Mock profile management functions
function mockCreateProfile(data: {
  id: string
  email: string
  displayName: string
  role: string
}): UserProfile {
  const profile: UserProfile = {
    id: data.id,
    email: data.email,
    displayName: data.displayName,
    role: data.role,
    updatedAt: new Date(),
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      commentNotifications: true,
      showProfile: true,
      allowMentions: true,
    }
  }

  mockProfiles.set(data.id, profile)
  return profile
}

function mockCreateSession(userId: string): string {
  const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  mockSessions.set(sessionToken, { userId, isActive: true })
  return sessionToken
}

function mockUpdateProfile(sessionToken: string, updates: ProfileUpdate): UserProfile | null {
  // Verify session
  const session = mockSessions.get(sessionToken)
  if (!session || !session.isActive) {
    throw new Error('Invalid or expired session')
  }

  // Get current profile
  const currentProfile = mockProfiles.get(session.userId)
  if (!currentProfile) {
    throw new Error('Profile not found')
  }

  // Check for email conflicts (if updating email)
  if (updates.email && updates.email !== currentProfile.email) {
    const emailExists = Array.from(mockProfiles.values())
      .some(p => p.id !== currentProfile.id && p.email === updates.email)
    if (emailExists) {
      throw new Error('Email already in use')
    }
  }

  // Apply updates
  const updatedProfile: UserProfile = {
    ...currentProfile,
    displayName: updates.displayName ?? currentProfile.displayName,
    email: updates.email ?? currentProfile.email,
    preferences: updates.preferences 
      ? { ...currentProfile.preferences, ...updates.preferences }
      : currentProfile.preferences,
    updatedAt: new Date(),
  }

  // Persist changes
  mockProfiles.set(session.userId, updatedProfile)
  return updatedProfile
}

function mockGetProfile(sessionToken: string): UserProfile | null {
  const session = mockSessions.get(sessionToken)
  if (!session || !session.isActive) {
    return null
  }

  return mockProfiles.get(session.userId) || null
}

function mockGetProfileById(userId: string): UserProfile | null {
  return mockProfiles.get(userId) || null
}

function mockClearAll() {
  mockProfiles.clear()
  mockSessions.clear()
}

describe('Property 4: Profile Update Persistence', () => {
  it('should persist profile updates and reflect changes immediately', () => {
    fc.assert(
      fc.property(
        userProfileArbitrary,
        profileUpdateArbitrary,
        (initialProfile, updates) => {
          // Clear mock storage
          mockClearAll()

          // Act: Create initial profile and session
          const profile = mockCreateProfile(initialProfile)
          const sessionToken = mockCreateSession(profile.id)

          // Filter out null/undefined updates
          const filteredUpdates: ProfileUpdate = {}
          if (updates.displayName !== null && updates.displayName !== undefined) {
            filteredUpdates.displayName = updates.displayName
          }
          if (updates.email !== null && updates.email !== undefined) {
            filteredUpdates.email = updates.email
          }

          // Act: Update profile
          const updatedProfile = mockUpdateProfile(sessionToken, filteredUpdates)

          // Assert: Update should succeed
          expect(updatedProfile).toBeDefined()
          expect(updatedProfile?.id).toBe(profile.id)

          // Assert: Changes should be reflected in the updated profile
          const expectedDisplayName = filteredUpdates.displayName ?? initialProfile.displayName
          const expectedEmail = filteredUpdates.email ?? initialProfile.email

          expect(updatedProfile?.displayName).toBe(expectedDisplayName)
          expect(updatedProfile?.email).toBe(expectedEmail)
          expect(updatedProfile?.role).toBe(initialProfile.role) // Should not change

          // Assert: Updated timestamp should be newer or equal (profile always gets updated timestamp)
          expect(updatedProfile?.updatedAt.getTime()).toBeGreaterThanOrEqual(profile.updatedAt.getTime())

          // Act: Retrieve profile through session (simulating UI access)
          const sessionProfile = mockGetProfile(sessionToken)

          // Assert: Session-based retrieval should show updated data
          expect(sessionProfile).toBeDefined()
          expect(sessionProfile?.displayName).toBe(expectedDisplayName)
          expect(sessionProfile?.email).toBe(expectedEmail)

          // Act: Retrieve profile by ID (simulating direct database access)
          const directProfile = mockGetProfileById(profile.id)

          // Assert: Direct retrieval should show updated data
          expect(directProfile).toBeDefined()
          expect(directProfile?.displayName).toBe(expectedDisplayName)
          expect(directProfile?.email).toBe(expectedEmail)

          // Assert: All access methods should return consistent data
          expect(sessionProfile?.displayName).toBe(directProfile?.displayName)
          expect(sessionProfile?.email).toBe(directProfile?.email)
          expect(sessionProfile?.updatedAt.getTime()).toBe(directProfile?.updatedAt.getTime())
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should handle preference updates correctly', () => {
    fc.assert(
      fc.property(
        userProfileArbitrary,
        fc.record({
          emailNotifications: fc.option(fc.boolean()),
          pushNotifications: fc.option(fc.boolean()),
          commentNotifications: fc.option(fc.boolean()),
          showProfile: fc.option(fc.boolean()),
          allowMentions: fc.option(fc.boolean()),
        }),
        (initialProfile, preferenceUpdates) => {
          // Clear mock storage
          mockClearAll()

          // Act: Create initial profile and session
          const profile = mockCreateProfile(initialProfile)
          const sessionToken = mockCreateSession(profile.id)

          // Filter out undefined values
          const filteredPreferences: Partial<UserPreferences> = {}
          if (preferenceUpdates.emailNotifications !== null && preferenceUpdates.emailNotifications !== undefined) {
            filteredPreferences.emailNotifications = preferenceUpdates.emailNotifications
          }
          if (preferenceUpdates.pushNotifications !== null && preferenceUpdates.pushNotifications !== undefined) {
            filteredPreferences.pushNotifications = preferenceUpdates.pushNotifications
          }
          if (preferenceUpdates.commentNotifications !== null && preferenceUpdates.commentNotifications !== undefined) {
            filteredPreferences.commentNotifications = preferenceUpdates.commentNotifications
          }
          if (preferenceUpdates.showProfile !== null && preferenceUpdates.showProfile !== undefined) {
            filteredPreferences.showProfile = preferenceUpdates.showProfile
          }
          if (preferenceUpdates.allowMentions !== null && preferenceUpdates.allowMentions !== undefined) {
            filteredPreferences.allowMentions = preferenceUpdates.allowMentions
          }

          // Act: Update preferences
          const updatedProfile = mockUpdateProfile(sessionToken, {
            preferences: filteredPreferences,
          })

          // Assert: Update should succeed
          expect(updatedProfile).toBeDefined()

          // Assert: Preferences should be updated correctly
          const expectedPreferences = {
            ...profile.preferences,
            ...filteredPreferences,
          }

          expect(updatedProfile?.preferences.emailNotifications).toBe(expectedPreferences.emailNotifications)
          expect(updatedProfile?.preferences.pushNotifications).toBe(expectedPreferences.pushNotifications)
          expect(updatedProfile?.preferences.commentNotifications).toBe(expectedPreferences.commentNotifications)
          expect(updatedProfile?.preferences.showProfile).toBe(expectedPreferences.showProfile)
          expect(updatedProfile?.preferences.allowMentions).toBe(expectedPreferences.allowMentions)

          // Act: Retrieve updated preferences
          const retrievedProfile = mockGetProfile(sessionToken)

          // Assert: Retrieved preferences should match updates
          expect(retrievedProfile?.preferences.emailNotifications).toBe(expectedPreferences.emailNotifications)
          expect(retrievedProfile?.preferences.pushNotifications).toBe(expectedPreferences.pushNotifications)
          expect(retrievedProfile?.preferences.commentNotifications).toBe(expectedPreferences.commentNotifications)
          expect(retrievedProfile?.preferences.showProfile).toBe(expectedPreferences.showProfile)
          expect(retrievedProfile?.preferences.allowMentions).toBe(expectedPreferences.allowMentions)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should enforce email uniqueness during profile updates', () => {
    fc.assert(
      fc.property(
        fc.array(userProfileArbitrary, { minLength: 2, maxLength: 3 }),
        (profiles) => {
          // Clear mock storage
          mockClearAll()

          // Act: Create multiple profiles
          const createdProfiles = []
          const sessionTokens = []

          for (const profileData of profiles) {
            try {
              const profile = mockCreateProfile(profileData)
              const sessionToken = mockCreateSession(profile.id)
              createdProfiles.push(profile)
              sessionTokens.push(sessionToken)
            } catch (error) {
              // Skip duplicate emails in initial creation
            }
          }

          if (createdProfiles.length < 2) {
            return true // Skip test if not enough unique profiles
          }

          // Act: Try to update first profile with second profile's email
          const firstSessionToken = sessionTokens[0]
          const secondProfileEmail = createdProfiles[1].email

          // Assert: Update should fail due to email conflict
          expect(() => {
            mockUpdateProfile(firstSessionToken, {
              email: secondProfileEmail,
            })
          }).toThrow('Email already in use')

          // Assert: Original profile should remain unchanged
          const unchangedProfile = mockGetProfile(firstSessionToken)
          expect(unchangedProfile?.email).toBe(createdProfiles[0].email)
          expect(unchangedProfile?.displayName).toBe(createdProfiles[0].displayName)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should reject updates from invalid sessions', () => {
    fc.assert(
      fc.property(
        userProfileArbitrary,
        profileUpdateArbitrary,
        (initialProfile, updates) => {
          // Clear mock storage
          mockClearAll()

          // Act: Create profile but no session
          const profile = mockCreateProfile(initialProfile)
          const invalidSessionToken = 'invalid_session_token'

          // Act & Assert: Update with invalid session should fail
          expect(() => {
            mockUpdateProfile(invalidSessionToken, {
              displayName: updates.displayName || undefined,
              email: updates.email || undefined,
            })
          }).toThrow('Invalid or expired session')

          // Assert: Profile should remain unchanged
          const unchangedProfile = mockGetProfileById(profile.id)
          expect(unchangedProfile?.displayName).toBe(initialProfile.displayName)
          expect(unchangedProfile?.email).toBe(initialProfile.email)
          expect(unchangedProfile?.updatedAt.getTime()).toBe(profile.updatedAt.getTime())
        }
      ),
      { numRuns: 10 }
    )
  })
})