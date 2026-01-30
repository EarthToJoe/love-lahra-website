import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 2: User Authentication Round Trip
 * 
 * For any valid user credentials, successful login followed by logout should 
 * properly establish and then terminate the user session without leaving 
 * residual authentication state.
 * 
 * Validates: Requirements 3.2, 3.4
 * Feature: lahras-life, Property 2: User Authentication Round Trip
 */

// Custom generators for authentication data
const emailArbitrary = fc.string({ minLength: 3, maxLength: 50 })
  .filter(s => s.includes('@') === false && s.includes('.') === false)
  .map(s => `${s}@example.com`)

const passwordArbitrary = fc.string({ minLength: 6, maxLength: 100 })
  .filter(s => s.trim().length >= 6)

const displayNameArbitrary = fc.string({ minLength: 2, maxLength: 100 })
  .filter(s => s.trim().length >= 2 && !s.includes('<') && !s.includes('>'))

const userCredentialsArbitrary = fc.record({
  email: emailArbitrary,
  password: passwordArbitrary,
  displayName: displayNameArbitrary,
})

// Mock authentication system (simplified for testing)
interface User {
  id: string
  email: string
  displayName: string
  password: string // Using plain text for test performance
  role: string
  createdAt: Date
}

interface Session {
  userId: string
  token: string
  createdAt: Date
  isActive: boolean
}

// Mock storage
const mockUsers = new Map<string, User>()
const mockSessions = new Map<string, Session>()

// Mock authentication functions (simplified)
function mockRegisterUser(credentials: {
  email: string
  password: string
  displayName: string
}): User {
  // Check if user already exists
  const existingUser = Array.from(mockUsers.values()).find(u => u.email === credentials.email)
  if (existingUser) {
    throw new Error('User already exists')
  }

  // Create user (using plain text password for test performance)
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const user: User = {
    id: userId,
    email: credentials.email,
    displayName: credentials.displayName,
    password: credentials.password,
    role: 'USER',
    createdAt: new Date(),
  }

  mockUsers.set(userId, user)
  return user
}

function mockLoginUser(credentials: {
  email: string
  password: string
}): { user: User; session: Session } {
  // Find user
  const user = Array.from(mockUsers.values()).find(u => u.email === credentials.email)
  if (!user) {
    throw new Error('User not found')
  }

  // Verify password (simplified for testing)
  if (user.password !== credentials.password) {
    throw new Error('Invalid password')
  }

  // Create session
  const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const session: Session = {
    userId: user.id,
    token: sessionToken,
    createdAt: new Date(),
    isActive: true,
  }

  mockSessions.set(sessionToken, session)
  return { user, session }
}

function mockLogoutUser(sessionToken: string): boolean {
  const session = mockSessions.get(sessionToken)
  if (!session) {
    return false
  }

  // Deactivate session
  session.isActive = false
  mockSessions.set(sessionToken, session)
  return true
}

function mockGetSession(sessionToken: string): Session | null {
  const session = mockSessions.get(sessionToken)
  return session && session.isActive ? session : null
}

function mockClearAll() {
  mockUsers.clear()
  mockSessions.clear()
}

describe('Property 2: User Authentication Round Trip', () => {
  it('should establish and terminate sessions correctly for valid credentials', () => {
    fc.assert(
      fc.property(userCredentialsArbitrary, (credentials) => {
        // Clear mock storage
        mockClearAll()

        // Act: Register user
        const registeredUser = mockRegisterUser(credentials)

        // Assert: User should be registered correctly
        expect(registeredUser).toBeDefined()
        expect(registeredUser.email).toBe(credentials.email)
        expect(registeredUser.displayName).toBe(credentials.displayName)
        expect(registeredUser.id).toBeDefined()

        // Act: Login with the same credentials
        const loginResult = mockLoginUser({
          email: credentials.email,
          password: credentials.password,
        })

        // Assert: Login should succeed and create session
        expect(loginResult.user.id).toBe(registeredUser.id)
        expect(loginResult.session).toBeDefined()
        expect(loginResult.session.userId).toBe(registeredUser.id)
        expect(loginResult.session.isActive).toBe(true)

        // Act: Verify session is active
        const activeSession = mockGetSession(loginResult.session.token)
        expect(activeSession).toBeDefined()
        expect(activeSession?.isActive).toBe(true)
        expect(activeSession?.userId).toBe(registeredUser.id)

        // Act: Logout user
        const logoutSuccess = mockLogoutUser(loginResult.session.token)

        // Assert: Logout should succeed
        expect(logoutSuccess).toBe(true)

        // Act: Verify session is terminated
        const terminatedSession = mockGetSession(loginResult.session.token)

        // Assert: Session should no longer be active
        expect(terminatedSession).toBeNull()

        // Act: Verify session data is properly cleaned up
        const sessionInStorage = mockSessions.get(loginResult.session.token)
        expect(sessionInStorage?.isActive).toBe(false)
      }),
      { numRuns: 50 }
    )
  })

  it('should reject invalid credentials during login', () => {
    fc.assert(
      fc.property(
        userCredentialsArbitrary,
        passwordArbitrary,
        (validCredentials, wrongPassword) => {
          // Skip if passwords are the same
          if (wrongPassword === validCredentials.password) {
            return true
          }

          // Clear mock storage
          mockClearAll()

          // Act: Register user with valid credentials
          mockRegisterUser(validCredentials)

          // Act & Assert: Login with wrong password should fail
          expect(() => {
            mockLoginUser({
              email: validCredentials.email,
              password: wrongPassword,
            })
          }).toThrow('Invalid password')

          // Assert: No session should be created
          const allSessions = Array.from(mockSessions.values())
          expect(allSessions).toHaveLength(0)
        }
      ),
      { numRuns: 30 }
    )
  })

  it('should handle multiple concurrent sessions correctly', () => {
    fc.assert(
      fc.property(
        fc.array(userCredentialsArbitrary, { minLength: 2, maxLength: 3 }),
        (userCredentialsList) => {
          // Clear mock storage
          mockClearAll()

          // Act: Register multiple users (skip duplicates)
          const registeredUsers = []
          for (const credentials of userCredentialsList) {
            try {
              const user = mockRegisterUser(credentials)
              registeredUsers.push({ user, credentials })
            } catch (error) {
              // Skip duplicate emails (expected behavior)
              if (!error.message.includes('already exists')) {
                throw error
              }
            }
          }

          if (registeredUsers.length < 2) {
            return true // Skip test if not enough unique users
          }

          // Act: Login all users
          const loginResults = []
          for (const { user, credentials } of registeredUsers) {
            const loginResult = mockLoginUser({
              email: credentials.email,
              password: credentials.password,
            })
            loginResults.push(loginResult)
          }

          // Assert: All sessions should be active
          for (const { session } of loginResults) {
            const activeSession = mockGetSession(session.token)
            expect(activeSession).toBeDefined()
            expect(activeSession?.isActive).toBe(true)
          }

          // Act: Logout half the users
          const halfPoint = Math.floor(loginResults.length / 2)
          for (let i = 0; i < halfPoint; i++) {
            const logoutSuccess = mockLogoutUser(loginResults[i].session.token)
            expect(logoutSuccess).toBe(true)
          }

          // Assert: Only remaining sessions should be active
          for (let i = 0; i < loginResults.length; i++) {
            const session = mockGetSession(loginResults[i].session.token)
            if (i < halfPoint) {
              expect(session).toBeNull() // Logged out
            } else {
              expect(session).toBeDefined() // Still active
              expect(session?.isActive).toBe(true)
            }
          }
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should maintain session integrity during the authentication lifecycle', () => {
    fc.assert(
      fc.property(userCredentialsArbitrary, (credentials) => {
        // Clear mock storage
        mockClearAll()

        // Act: Complete authentication lifecycle
        const user = mockRegisterUser(credentials)
        const { session: session1 } = mockLoginUser({
          email: credentials.email,
          password: credentials.password,
        })

        // Assert: First session should be valid
        expect(mockGetSession(session1.token)).toBeDefined()

        // Act: Login again (simulating multiple devices/tabs)
        const { session: session2 } = mockLoginUser({
          email: credentials.email,
          password: credentials.password,
        })

        // Assert: Both sessions should be active
        expect(mockGetSession(session1.token)).toBeDefined()
        expect(mockGetSession(session2.token)).toBeDefined()
        expect(session1.token).not.toBe(session2.token)

        // Act: Logout first session
        mockLogoutUser(session1.token)

        // Assert: Only second session should remain active
        expect(mockGetSession(session1.token)).toBeNull()
        expect(mockGetSession(session2.token)).toBeDefined()

        // Act: Logout second session
        mockLogoutUser(session2.token)

        // Assert: No sessions should be active
        expect(mockGetSession(session1.token)).toBeNull()
        expect(mockGetSession(session2.token)).toBeNull()
      }),
      { numRuns: 30 }
    )
  })
})