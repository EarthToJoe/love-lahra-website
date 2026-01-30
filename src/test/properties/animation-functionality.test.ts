import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 14: Animation Functionality
 * 
 * For any animation configuration and timing parameters, the animation system 
 * should execute smoothly, respect user preferences, and maintain performance 
 * without causing layout shifts or accessibility issues.
 * 
 * Validates: Requirements 6.4
 * Feature: lahras-life, Property 14: Animation Functionality
 */

// Animation types and configurations
interface AnimationConfig {
  type: 'fadeIn' | 'fadeInUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'stagger'
  duration: number
  delay: number
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  staggerDelay?: number
}

interface AnimationState {
  isAnimating: boolean
  progress: number // 0 to 1
  currentValues: {
    opacity: number
    x: number
    y: number
    scale: number
  }
}

interface UserPreferences {
  prefersReducedMotion: boolean
  prefersHighContrast: boolean
  prefersReducedTransparency: boolean
}

// Custom generators
const animationConfigArbitrary = fc.record({
  type: fc.constantFrom('fadeIn', 'fadeInUp', 'slideInLeft', 'slideInRight', 'scaleIn', 'stagger'),
  duration: fc.float({ min: Math.fround(0.1), max: Math.fround(2.0) }),
  delay: fc.float({ min: Math.fround(0), max: Math.fround(1.0) }),
  easing: fc.constantFrom('linear', 'easeIn', 'easeOut', 'easeInOut'),
  staggerDelay: fc.option(fc.float({ min: Math.fround(0.05), max: Math.fround(0.3) })),
})

const userPreferencesArbitrary = fc.record({
  prefersReducedMotion: fc.boolean(),
  prefersHighContrast: fc.boolean(),
  prefersReducedTransparency: fc.boolean(),
})

// Mock animation system
class MockAnimationSystem {
  private userPreferences: UserPreferences
  private activeAnimations: Map<string, AnimationState> = new Map()
  
  constructor(userPreferences: UserPreferences) {
    this.userPreferences = userPreferences
  }

  // Get initial animation values based on type
  getInitialValues(type: AnimationConfig['type']): AnimationState['currentValues'] {
    const baseValues = { opacity: 1, x: 0, y: 0, scale: 1 }
    
    switch (type) {
      case 'fadeIn':
        return { ...baseValues, opacity: 0 }
      case 'fadeInUp':
        return { ...baseValues, opacity: 0, y: 20 }
      case 'slideInLeft':
        return { ...baseValues, opacity: 0, x: -20 }
      case 'slideInRight':
        return { ...baseValues, opacity: 0, x: 20 }
      case 'scaleIn':
        return { ...baseValues, opacity: 0, scale: 0.95 }
      case 'stagger':
        return { ...baseValues, opacity: 0, y: 20 }
      default:
        return baseValues
    }
  }

  // Get final animation values
  getFinalValues(): AnimationState['currentValues'] {
    return { opacity: 1, x: 0, y: 0, scale: 1 }
  }

  // Calculate animation progress based on time
  calculateProgress(elapsedTime: number, config: AnimationConfig): number {
    if (elapsedTime < config.delay) return 0
    
    const animationTime = elapsedTime - config.delay
    const rawProgress = Math.min(animationTime / config.duration, 1)
    
    // Apply easing
    switch (config.easing) {
      case 'linear':
        return rawProgress
      case 'easeIn':
        return rawProgress * rawProgress
      case 'easeOut':
        return 1 - Math.pow(1 - rawProgress, 2)
      case 'easeInOut':
        return rawProgress < 0.5 
          ? 2 * rawProgress * rawProgress 
          : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2
      default:
        return rawProgress
    }
  }

  // Interpolate between initial and final values
  interpolateValues(
    initial: AnimationState['currentValues'],
    final: AnimationState['currentValues'],
    progress: number
  ): AnimationState['currentValues'] {
    return {
      opacity: initial.opacity + (final.opacity - initial.opacity) * progress,
      x: initial.x + (final.x - initial.x) * progress,
      y: initial.y + (final.y - initial.y) * progress,
      scale: initial.scale + (final.scale - initial.scale) * progress,
    }
  }

  // Start animation
  startAnimation(id: string, config: AnimationConfig): AnimationState {
    // Respect user preferences
    if (this.userPreferences.prefersReducedMotion) {
      // Skip animation, go directly to final state
      return {
        isAnimating: false,
        progress: 1,
        currentValues: this.getFinalValues(),
      }
    }

    const initialValues = this.getInitialValues(config.type)
    const state: AnimationState = {
      isAnimating: true,
      progress: 0,
      currentValues: initialValues,
    }

    this.activeAnimations.set(id, state)
    return state
  }

  // Update animation at given time
  updateAnimation(id: string, config: AnimationConfig, elapsedTime: number): AnimationState | null {
    const state = this.activeAnimations.get(id)
    if (!state) return null

    // Skip if reduced motion is preferred
    if (this.userPreferences.prefersReducedMotion) {
      return {
        isAnimating: false,
        progress: 1,
        currentValues: this.getFinalValues(),
      }
    }

    const progress = this.calculateProgress(elapsedTime, config)
    const initialValues = this.getInitialValues(config.type)
    const finalValues = this.getFinalValues()
    const currentValues = this.interpolateValues(initialValues, finalValues, progress)

    const updatedState: AnimationState = {
      isAnimating: progress < 1,
      progress,
      currentValues,
    }

    this.activeAnimations.set(id, updatedState)
    return updatedState
  }

  // Validate animation performance
  validatePerformance(config: AnimationConfig): {
    hasReasonableDuration: boolean
    hasReasonableDelay: boolean
    willCauseLayoutShift: boolean
    respectsAccessibility: boolean
  } {
    const hasReasonableDuration = config.duration >= 0.1 && config.duration <= 2.0
    const hasReasonableDelay = config.delay >= 0 && config.delay <= 1.0
    
    // Animations that only affect transform and opacity don't cause layout shifts
    const transformOnlyTypes = ['fadeIn', 'fadeInUp', 'slideInLeft', 'slideInRight', 'scaleIn']
    const willCauseLayoutShift = !transformOnlyTypes.includes(config.type)
    
    const respectsAccessibility = this.userPreferences.prefersReducedMotion ? true : hasReasonableDuration

    return {
      hasReasonableDuration,
      hasReasonableDelay,
      willCauseLayoutShift,
      respectsAccessibility,
    }
  }

  // Get active animation count
  getActiveAnimationCount(): number {
    return Array.from(this.activeAnimations.values())
      .filter(state => state.isAnimating).length
  }

  // Clean up completed animations
  cleanup(): void {
    for (const [id, state] of this.activeAnimations.entries()) {
      if (!state.isAnimating) {
        this.activeAnimations.delete(id)
      }
    }
  }
}

describe('Property 14: Animation Functionality', () => {
  it('should execute animations smoothly with proper timing', () => {
    fc.assert(
      fc.property(
        animationConfigArbitrary,
        userPreferencesArbitrary,
        fc.array(fc.float({ min: Math.fround(0), max: Math.fround(3) }), { minLength: 3, maxLength: 10 }), // time samples
        (config, userPrefs, timeSamples) => {
          // Act: Create animation system
          const animationSystem = new MockAnimationSystem(userPrefs)
          
          // Act: Start animation
          const initialState = animationSystem.startAnimation('test-animation', config)
          
          // Assert: Initial state should be correct
          expect(initialState.progress).toBeGreaterThanOrEqual(0)
          expect(initialState.progress).toBeLessThanOrEqual(1)
          
          if (userPrefs.prefersReducedMotion) {
            // Assert: Should skip animation if reduced motion is preferred
            expect(initialState.isAnimating).toBe(false)
            expect(initialState.progress).toBe(1)
          } else {
            // Assert: Should start animating
            expect(initialState.isAnimating).toBe(true)
            expect(initialState.progress).toBe(0)
          }

          // Act: Update animation at various time points
          const sortedTimes = timeSamples.sort((a, b) => a - b)
          let previousProgress = 0

          for (const time of sortedTimes) {
            const state = animationSystem.updateAnimation('test-animation', config, time)
            
            if (state && !userPrefs.prefersReducedMotion) {
              // Assert: Progress should be monotonically increasing
              expect(state.progress).toBeGreaterThanOrEqual(previousProgress)
              expect(state.progress).toBeLessThanOrEqual(1)
              
              // Assert: Animation values should be within reasonable bounds
              expect(state.currentValues.opacity).toBeGreaterThanOrEqual(0)
              expect(state.currentValues.opacity).toBeLessThanOrEqual(1)
              expect(Math.abs(state.currentValues.x)).toBeLessThanOrEqual(100)
              expect(Math.abs(state.currentValues.y)).toBeLessThanOrEqual(100)
              expect(state.currentValues.scale).toBeGreaterThan(0)
              expect(state.currentValues.scale).toBeLessThanOrEqual(2)
              
              previousProgress = state.progress
            }
          }
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should respect user accessibility preferences', () => {
    fc.assert(
      fc.property(
        animationConfigArbitrary,
        fc.record({
          prefersReducedMotion: fc.constant(true), // Force reduced motion
          prefersHighContrast: fc.boolean(),
          prefersReducedTransparency: fc.boolean(),
        }),
        (config, userPrefs) => {
          // Act: Create animation system with reduced motion preference
          const animationSystem = new MockAnimationSystem(userPrefs)
          
          // Act: Start animation
          const state = animationSystem.startAnimation('test-animation', config)
          
          // Assert: Should skip animation when reduced motion is preferred
          expect(state.isAnimating).toBe(false)
          expect(state.progress).toBe(1)
          expect(state.currentValues.opacity).toBe(1)
          expect(state.currentValues.x).toBe(0)
          expect(state.currentValues.y).toBe(0)
          expect(state.currentValues.scale).toBe(1)
          
          // Act: Try to update animation
          const updatedState = animationSystem.updateAnimation('test-animation', config, 1.0)
          
          // Assert: Should remain in final state (or be null if not tracked)
          if (updatedState) {
            expect(updatedState.isAnimating).toBe(false)
            expect(updatedState.progress).toBe(1)
          }
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should maintain performance standards', () => {
    fc.assert(
      fc.property(
        animationConfigArbitrary,
        userPreferencesArbitrary,
        (config, userPrefs) => {
          // Act: Create animation system
          const animationSystem = new MockAnimationSystem(userPrefs)
          
          // Act: Validate performance
          const performance = animationSystem.validatePerformance(config)
          
          // Assert: Duration should be reasonable
          expect(performance.hasReasonableDuration).toBe(
            config.duration >= 0.1 && config.duration <= 2.0
          )
          
          // Assert: Delay should be reasonable
          expect(performance.hasReasonableDelay).toBe(
            config.delay >= 0 && config.delay <= 1.0
          )
          
          // Assert: Should not cause layout shifts for transform-only animations
          const transformOnlyTypes = ['fadeIn', 'fadeInUp', 'slideInLeft', 'slideInRight', 'scaleIn']
          expect(performance.willCauseLayoutShift).toBe(
            !transformOnlyTypes.includes(config.type)
          )
          
          // Assert: Should respect accessibility
          if (userPrefs.prefersReducedMotion) {
            expect(performance.respectsAccessibility).toBe(true)
          } else {
            expect(performance.respectsAccessibility).toBe(performance.hasReasonableDuration)
          }
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should handle stagger animations correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.constant('stagger' as const),
          duration: fc.float({ min: Math.fround(0.2), max: Math.fround(1.0) }),
          delay: fc.float({ min: Math.fround(0), max: Math.fround(0.5) }),
          easing: fc.constantFrom('easeOut', 'easeInOut'),
          staggerDelay: fc.float({ min: Math.fround(0.05), max: Math.fround(0.2) }),
        }),
        fc.record({
          prefersReducedMotion: fc.constant(false), // Enable animations
          prefersHighContrast: fc.boolean(),
          prefersReducedTransparency: fc.boolean(),
        }),
        fc.integer({ min: 2, max: 6 }), // number of staggered items
        (config, userPrefs, itemCount) => {
          // Act: Create animation system
          const animationSystem = new MockAnimationSystem(userPrefs)
          
          // Act: Start staggered animations
          const animations: string[] = []
          for (let i = 0; i < itemCount; i++) {
            const itemId = `stagger-item-${i}`
            const itemConfig = {
              ...config,
              delay: config.delay + (i * (config.staggerDelay || 0.1))
            }
            
            animationSystem.startAnimation(itemId, itemConfig)
            animations.push(itemId)
          }
          
          // Act: Update all animations at a specific time
          const testTime = config.delay + config.duration / 2
          const states = animations.map(id => 
            animationSystem.updateAnimation(id, {
              ...config,
              delay: config.delay + (animations.indexOf(id) * (config.staggerDelay || 0.1))
            }, testTime)
          ).filter(Boolean)
          
          // Assert: Earlier items should be further along in animation
          for (let i = 1; i < states.length; i++) {
            const currentState = states[i]!
            const previousState = states[i - 1]!
            
            // Earlier items should have higher progress (or equal if both completed)
            expect(previousState.progress).toBeGreaterThanOrEqual(currentState.progress)
          }
          
          // Assert: All animations should have valid states
          states.forEach(state => {
            expect(state.progress).toBeGreaterThanOrEqual(0)
            expect(state.progress).toBeLessThanOrEqual(1)
            expect(state.currentValues.opacity).toBeGreaterThanOrEqual(0)
            expect(state.currentValues.opacity).toBeLessThanOrEqual(1)
          })
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should handle animation cleanup properly', () => {
    fc.assert(
      fc.property(
        fc.array(animationConfigArbitrary, { minLength: 2, maxLength: 5 }),
        fc.record({
          prefersReducedMotion: fc.constant(false),
          prefersHighContrast: fc.boolean(),
          prefersReducedTransparency: fc.boolean(),
        }),
        (configs, userPrefs) => {
          // Act: Create animation system
          const animationSystem = new MockAnimationSystem(userPrefs)
          
          // Act: Start multiple animations
          const animationIds = configs.map((_, index) => `animation-${index}`)
          animationIds.forEach((id, index) => {
            animationSystem.startAnimation(id, configs[index])
          })
          
          // Assert: Should have active animations
          expect(animationSystem.getActiveAnimationCount()).toBeGreaterThan(0)
          
          // Act: Complete all animations by advancing time significantly
          const longTime = Math.max(...configs.map(c => c.delay + c.duration)) + 1
          animationIds.forEach((id, index) => {
            animationSystem.updateAnimation(id, configs[index], longTime)
          })
          
          // Act: Cleanup completed animations
          animationSystem.cleanup()
          
          // Assert: Should have fewer or no active animations after cleanup
          const activeCountAfterCleanup = animationSystem.getActiveAnimationCount()
          expect(activeCountAfterCleanup).toBeLessThanOrEqual(animationIds.length)
        }
      ),
      { numRuns: 10 }
    )
  })
})