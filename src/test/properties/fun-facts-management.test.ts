/**
 * Property 23: Fun Facts Content Management
 * **Validates: Requirements 10.4**
 * 
 * This property test validates that fun facts management works correctly:
 * - Fun facts can be created, updated, and deleted
 * - Categories are properly managed
 * - Trivia questions are handled correctly
 * - Random fact selection works properly
 * - Content validation is enforced
 */

import { describe, it, expect, beforeEach } from 'vitest'

interface FunFact {
  id: string
  title: string
  content: string
  category: 'Personal' | 'Random' | 'Food' | 'Travel' | 'Fashion' | 'Other'
  isTrivia: boolean
  triviaAnswer?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  tags: string[]
  isPublished: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  viewCount: number
  likeCount: number
}

class FunFactsManager {
  private facts: Map<string, FunFact> = new Map()
  private categoryIndex: Map<string, Set<string>> = new Map()
  private tagIndex: Map<string, Set<string>> = new Map()

  constructor() {
    // Initialize category index
    const categories = ['Personal', 'Random', 'Food', 'Travel', 'Fashion', 'Other']
    categories.forEach(category => {
      this.categoryIndex.set(category, new Set())
    })
  }

  createFunFact(data: Omit<FunFact, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount'>): FunFact {
    const id = `fact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()

    // Validate trivia questions
    if (data.isTrivia && !data.triviaAnswer?.trim()) {
      throw new Error('Trivia questions must have an answer')
    }

    // Validate content
    if (!data.title.trim() || !data.content.trim()) {
      throw new Error('Title and content are required')
    }

    const funFact: FunFact = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      likeCount: 0
    }

    this.facts.set(id, funFact)
    this.updateIndexes(funFact)

    return funFact
  }

  updateFunFact(id: string, updates: Partial<Omit<FunFact, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount'>>): FunFact {
    const existingFact = this.facts.get(id)
    if (!existingFact) {
      throw new Error('Fun fact not found')
    }

    // Validate trivia updates
    const isTrivia = updates.isTrivia ?? existingFact.isTrivia
    const triviaAnswer = updates.triviaAnswer ?? existingFact.triviaAnswer
    
    if (isTrivia && !triviaAnswer?.trim()) {
      throw new Error('Trivia questions must have an answer')
    }

    // Validate content updates
    const title = updates.title ?? existingFact.title
    const content = updates.content ?? existingFact.content
    
    if (!title.trim() || !content.trim()) {
      throw new Error('Title and content are required')
    }

    // Remove from old indexes
    this.removeFromIndexes(existingFact)

    const updatedFact: FunFact = {
      ...existingFact,
      ...updates,
      updatedAt: new Date()
    }

    this.facts.set(id, updatedFact)
    this.updateIndexes(updatedFact)

    return updatedFact
  }

  deleteFunFact(id: string): boolean {
    const fact = this.facts.get(id)
    if (!fact) {
      return false
    }

    this.removeFromIndexes(fact)
    this.facts.delete(id)
    return true
  }

  getFunFact(id: string): FunFact | null {
    return this.facts.get(id) || null
  }

  getAllFunFacts(): FunFact[] {
    return Array.from(this.facts.values())
  }

  getPublishedFunFacts(): FunFact[] {
    return Array.from(this.facts.values()).filter(fact => fact.isPublished)
  }

  getFunFactsByCategory(category: string): FunFact[] {
    const factIds = this.categoryIndex.get(category) || new Set()
    return Array.from(factIds)
      .map(id => this.facts.get(id))
      .filter((fact): fact is FunFact => fact !== undefined)
  }

  getFunFactsByTag(tag: string): FunFact[] {
    const factIds = this.tagIndex.get(tag.toLowerCase()) || new Set()
    return Array.from(factIds)
      .map(id => this.facts.get(id))
      .filter((fact): fact is FunFact => fact !== undefined)
  }

  getTriviaQuestions(difficulty?: string): FunFact[] {
    return Array.from(this.facts.values())
      .filter(fact => fact.isTrivia && fact.isPublished)
      .filter(fact => !difficulty || fact.difficulty === difficulty)
  }

  getRandomFunFact(category?: string): FunFact | null {
    let candidates: FunFact[]
    
    if (category) {
      candidates = this.getFunFactsByCategory(category).filter(fact => fact.isPublished)
    } else {
      candidates = this.getPublishedFunFacts()
    }

    if (candidates.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * candidates.length)
    return candidates[randomIndex]
  }

  incrementViewCount(id: string): boolean {
    const fact = this.facts.get(id)
    if (!fact) {
      return false
    }

    fact.viewCount += 1
    fact.updatedAt = new Date()
    return true
  }

  incrementLikeCount(id: string): boolean {
    const fact = this.facts.get(id)
    if (!fact) {
      return false
    }

    fact.likeCount += 1
    fact.updatedAt = new Date()
    return true
  }

  searchFunFacts(query: string): FunFact[] {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) {
      return []
    }

    return Array.from(this.facts.values()).filter(fact => {
      return fact.title.toLowerCase().includes(searchTerm) ||
             fact.content.toLowerCase().includes(searchTerm) ||
             fact.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    })
  }

  getPopularFunFacts(limit: number = 10): FunFact[] {
    return Array.from(this.facts.values())
      .filter(fact => fact.isPublished)
      .sort((a, b) => (b.viewCount + b.likeCount) - (a.viewCount + a.likeCount))
      .slice(0, limit)
  }

  private updateIndexes(fact: FunFact): void {
    // Update category index
    const categoryFacts = this.categoryIndex.get(fact.category) || new Set()
    categoryFacts.add(fact.id)
    this.categoryIndex.set(fact.category, categoryFacts)

    // Update tag index
    fact.tags.forEach(tag => {
      const tagKey = tag.toLowerCase()
      const tagFacts = this.tagIndex.get(tagKey) || new Set()
      tagFacts.add(fact.id)
      this.tagIndex.set(tagKey, tagFacts)
    })
  }

  private removeFromIndexes(fact: FunFact): void {
    // Remove from category index
    const categoryFacts = this.categoryIndex.get(fact.category)
    if (categoryFacts) {
      categoryFacts.delete(fact.id)
    }

    // Remove from tag index
    fact.tags.forEach(tag => {
      const tagKey = tag.toLowerCase()
      const tagFacts = this.tagIndex.get(tagKey)
      if (tagFacts) {
        tagFacts.delete(fact.id)
      }
    })
  }
}

describe('Property 23: Fun Facts Content Management', () => {
  let manager: FunFactsManager

  beforeEach(() => {
    manager = new FunFactsManager()
  })

  it('should create fun facts with proper validation', () => {
    const factData = {
      title: 'Amazing Ocean Fact',
      content: 'The ocean contains 99% of the living space on Earth.',
      category: 'Random' as const,
      isTrivia: false,
      tags: ['ocean', 'nature', 'earth'],
      isPublished: true
    }

    const fact = manager.createFunFact(factData)

    expect(fact.id).toBeDefined()
    expect(fact.title).toBe(factData.title)
    expect(fact.content).toBe(factData.content)
    expect(fact.category).toBe(factData.category)
    expect(fact.isTrivia).toBe(false)
    expect(fact.tags).toEqual(factData.tags)
    expect(fact.isPublished).toBe(true)
    expect(fact.viewCount).toBe(0)
    expect(fact.likeCount).toBe(0)
    expect(fact.createdAt).toBeInstanceOf(Date)
    expect(fact.updatedAt).toBeInstanceOf(Date)
  })

  it('should validate trivia questions require answers', () => {
    const triviaWithoutAnswer = {
      title: 'Geography Question',
      content: 'What is the capital of France?',
      category: 'Random' as const,
      isTrivia: true,
      tags: ['geography'],
      isPublished: true
    }

    expect(() => {
      manager.createFunFact(triviaWithoutAnswer)
    }).toThrow('Trivia questions must have an answer')

    const validTrivia = {
      ...triviaWithoutAnswer,
      triviaAnswer: 'Paris',
      difficulty: 'Easy' as const
    }

    const fact = manager.createFunFact(validTrivia)
    expect(fact.isTrivia).toBe(true)
    expect(fact.triviaAnswer).toBe('Paris')
    expect(fact.difficulty).toBe('Easy')
  })

  it('should validate required fields', () => {
    expect(() => {
      manager.createFunFact({
        title: '',
        content: 'Some content',
        category: 'Random',
        isTrivia: false,
        tags: [],
        isPublished: true
      })
    }).toThrow('Title and content are required')

    expect(() => {
      manager.createFunFact({
        title: 'Some title',
        content: '',
        category: 'Random',
        isTrivia: false,
        tags: [],
        isPublished: true
      })
    }).toThrow('Title and content are required')
  })

  it('should update fun facts correctly', () => {
    const fact = manager.createFunFact({
      title: 'Original Title',
      content: 'Original content',
      category: 'Personal',
      isTrivia: false,
      tags: ['original'],
      isPublished: false
    })

    const updatedFact = manager.updateFunFact(fact.id, {
      title: 'Updated Title',
      content: 'Updated content',
      category: 'Food',
      tags: ['updated', 'food'],
      isPublished: true
    })

    expect(updatedFact.title).toBe('Updated Title')
    expect(updatedFact.content).toBe('Updated content')
    expect(updatedFact.category).toBe('Food')
    expect(updatedFact.tags).toEqual(['updated', 'food'])
    expect(updatedFact.isPublished).toBe(true)
    expect(updatedFact.updatedAt.getTime()).toBeGreaterThanOrEqual(updatedFact.createdAt.getTime())
  })

  it('should handle category-based retrieval', () => {
    const personalFact = manager.createFunFact({
      title: 'Personal Fact',
      content: 'I love coding',
      category: 'Personal',
      isTrivia: false,
      tags: ['personal'],
      isPublished: true
    })

    const foodFact = manager.createFunFact({
      title: 'Food Fact',
      content: 'Pizza is amazing',
      category: 'Food',
      isTrivia: false,
      tags: ['food'],
      isPublished: true
    })

    const personalFacts = manager.getFunFactsByCategory('Personal')
    const foodFacts = manager.getFunFactsByCategory('Food')
    const travelFacts = manager.getFunFactsByCategory('Travel')

    expect(personalFacts).toHaveLength(1)
    expect(personalFacts[0].id).toBe(personalFact.id)
    expect(foodFacts).toHaveLength(1)
    expect(foodFacts[0].id).toBe(foodFact.id)
    expect(travelFacts).toHaveLength(0)
  })

  it('should handle tag-based retrieval', () => {
    manager.createFunFact({
      title: 'Ocean Fact',
      content: 'Oceans are deep',
      category: 'Random',
      isTrivia: false,
      tags: ['ocean', 'nature', 'water'],
      isPublished: true
    })

    manager.createFunFact({
      title: 'Mountain Fact',
      content: 'Mountains are tall',
      category: 'Random',
      isTrivia: false,
      tags: ['mountain', 'nature', 'earth'],
      isPublished: true
    })

    const natureFacts = manager.getFunFactsByTag('nature')
    const oceanFacts = manager.getFunFactsByTag('ocean')
    const spaceFacts = manager.getFunFactsByTag('space')

    expect(natureFacts).toHaveLength(2)
    expect(oceanFacts).toHaveLength(1)
    expect(spaceFacts).toHaveLength(0)
  })

  it('should manage trivia questions correctly', () => {
    manager.createFunFact({
      title: 'Easy Geography',
      content: 'What is the capital of Italy?',
      category: 'Random',
      isTrivia: true,
      triviaAnswer: 'Rome',
      difficulty: 'Easy',
      tags: ['geography'],
      isPublished: true
    })

    manager.createFunFact({
      title: 'Hard Science',
      content: 'What is the speed of light?',
      category: 'Random',
      isTrivia: true,
      triviaAnswer: '299,792,458 m/s',
      difficulty: 'Hard',
      tags: ['science'],
      isPublished: true
    })

    manager.createFunFact({
      title: 'Unpublished Trivia',
      content: 'What is 2+2?',
      category: 'Random',
      isTrivia: true,
      triviaAnswer: '4',
      difficulty: 'Easy',
      tags: ['math'],
      isPublished: false
    })

    const allTrivia = manager.getTriviaQuestions()
    const easyTrivia = manager.getTriviaQuestions('Easy')
    const hardTrivia = manager.getTriviaQuestions('Hard')

    expect(allTrivia).toHaveLength(2) // Only published
    expect(easyTrivia).toHaveLength(1)
    expect(hardTrivia).toHaveLength(1)
  })

  it('should provide random fact selection', () => {
    // Create multiple facts
    for (let i = 0; i < 5; i++) {
      manager.createFunFact({
        title: `Fact ${i}`,
        content: `Content ${i}`,
        category: 'Random',
        isTrivia: false,
        tags: [`tag${i}`],
        isPublished: true
      })
    }

    // Test random selection
    const randomFact1 = manager.getRandomFunFact()
    const randomFact2 = manager.getRandomFunFact()

    expect(randomFact1).not.toBeNull()
    expect(randomFact2).not.toBeNull()
    expect(randomFact1!.isPublished).toBe(true)
    expect(randomFact2!.isPublished).toBe(true)

    // Test category-specific random selection
    manager.createFunFact({
      title: 'Food Fact',
      content: 'Food content',
      category: 'Food',
      isTrivia: false,
      tags: ['food'],
      isPublished: true
    })

    const randomFoodFact = manager.getRandomFunFact('Food')
    expect(randomFoodFact).not.toBeNull()
    expect(randomFoodFact!.category).toBe('Food')
  })

  it('should handle view and like counts', () => {
    const fact = manager.createFunFact({
      title: 'Popular Fact',
      content: 'This will be popular',
      category: 'Random',
      isTrivia: false,
      tags: ['popular'],
      isPublished: true
    })

    expect(fact.viewCount).toBe(0)
    expect(fact.likeCount).toBe(0)

    // Increment views
    manager.incrementViewCount(fact.id)
    manager.incrementViewCount(fact.id)
    
    // Increment likes
    manager.incrementLikeCount(fact.id)

    const updatedFact = manager.getFunFact(fact.id)!
    expect(updatedFact.viewCount).toBe(2)
    expect(updatedFact.likeCount).toBe(1)
  })

  it('should support search functionality', () => {
    manager.createFunFact({
      title: 'Amazing Ocean Discovery',
      content: 'Scientists discovered new species in the deep ocean',
      category: 'Random',
      isTrivia: false,
      tags: ['ocean', 'science', 'discovery'],
      isPublished: true
    })

    manager.createFunFact({
      title: 'Space Exploration',
      content: 'Mars has the largest volcano in the solar system',
      category: 'Random',
      isTrivia: false,
      tags: ['space', 'mars', 'volcano'],
      isPublished: true
    })

    const oceanResults = manager.searchFunFacts('ocean')
    const spaceResults = manager.searchFunFacts('space')
    const discoveryResults = manager.searchFunFacts('discovery')
    const emptyResults = manager.searchFunFacts('')

    expect(oceanResults).toHaveLength(1)
    expect(spaceResults).toHaveLength(1)
    expect(discoveryResults).toHaveLength(1)
    expect(emptyResults).toHaveLength(0)
  })

  it('should track popular facts', () => {
    const facts = []
    
    // Create facts with different popularity
    for (let i = 0; i < 5; i++) {
      const fact = manager.createFunFact({
        title: `Fact ${i}`,
        content: `Content ${i}`,
        category: 'Random',
        isTrivia: false,
        tags: [`tag${i}`],
        isPublished: true
      })
      facts.push(fact)
    }

    // Make some facts more popular with clear differences
    // Fact 2: 4 total (3 views + 1 like)
    manager.incrementViewCount(facts[2].id)
    manager.incrementViewCount(facts[2].id)
    manager.incrementViewCount(facts[2].id)
    manager.incrementLikeCount(facts[2].id)
    
    // Fact 1: 2 total (1 view + 1 like)
    manager.incrementViewCount(facts[1].id)
    manager.incrementLikeCount(facts[1].id)

    const popularFacts = manager.getPopularFunFacts(3)
    
    expect(popularFacts).toHaveLength(3)
    expect(popularFacts[0].id).toBe(facts[2].id) // 4 total (highest)
    expect(popularFacts[1].id).toBe(facts[1].id) // 2 total (second highest)
    
    // Verify the counts
    const mostPopular = manager.getFunFact(facts[2].id)!
    const secondPopular = manager.getFunFact(facts[1].id)!
    expect(mostPopular.viewCount + mostPopular.likeCount).toBe(4)
    expect(secondPopular.viewCount + secondPopular.likeCount).toBe(2)
  })

  it('should handle deletion correctly', () => {
    const fact = manager.createFunFact({
      title: 'To Be Deleted',
      content: 'This will be deleted',
      category: 'Personal',
      isTrivia: false,
      tags: ['delete', 'test'],
      isPublished: true
    })

    expect(manager.getFunFact(fact.id)).not.toBeNull()
    expect(manager.getFunFactsByCategory('Personal')).toHaveLength(1)
    expect(manager.getFunFactsByTag('delete')).toHaveLength(1)

    const deleted = manager.deleteFunFact(fact.id)
    expect(deleted).toBe(true)

    expect(manager.getFunFact(fact.id)).toBeNull()
    expect(manager.getFunFactsByCategory('Personal')).toHaveLength(0)
    expect(manager.getFunFactsByTag('delete')).toHaveLength(0)

    // Try to delete non-existent fact
    const notDeleted = manager.deleteFunFact('non-existent')
    expect(notDeleted).toBe(false)
  })

  it('should filter published vs unpublished facts', () => {
    manager.createFunFact({
      title: 'Published Fact',
      content: 'This is published',
      category: 'Random',
      isTrivia: false,
      tags: ['published'],
      isPublished: true
    })

    manager.createFunFact({
      title: 'Draft Fact',
      content: 'This is a draft',
      category: 'Random',
      isTrivia: false,
      tags: ['draft'],
      isPublished: false
    })

    const allFacts = manager.getAllFunFacts()
    const publishedFacts = manager.getPublishedFunFacts()

    expect(allFacts).toHaveLength(2)
    expect(publishedFacts).toHaveLength(1)
    expect(publishedFacts[0].title).toBe('Published Fact')
  })
})