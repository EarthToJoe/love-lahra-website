import '@testing-library/jest-dom'
import { beforeAll, afterAll, beforeEach } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'

// Extend Vitest matchers with jest-axe
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toHaveNoViolations(): T
    }
  }
}

expect.extend(toHaveNoViolations)

// Test setup without database dependency for now
beforeAll(async () => {
  // Setup test environment
})

afterAll(async () => {
  // Cleanup test environment
})

beforeEach(async () => {
  // Reset test state
})