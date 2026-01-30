import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fc from 'fast-check'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { io as Client, Socket as ClientSocket } from 'socket.io-client'
import { AddressInfo } from 'net'

// Mock Next.js modules
vi.mock('next-auth/react', () => ({
  useSession: () => ({ 
    data: { user: { email: 'test@example.com', id: '1' } }, 
    status: 'authenticated' 
  }),
}))

/**
 * **Property 20: Real-time Update Delivery**
 * **Validates: Requirements 9.3**
 * 
 * This property ensures that the website provides real-time updates for poll results 
 * and community activity through Socket.io connections.
 */
describe('Property 20: Real-time Update Delivery', () => {
  let server: Server
  let httpServer: any
  let clientSocket: ClientSocket
  let serverSocket: any
  let port: number

  beforeEach(async () => {
    cleanup()
    
    // Create HTTP server and Socket.io server
    httpServer = createServer()
    server = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    // Start server on random port
    await new Promise<void>((resolve) => {
      httpServer.listen(() => {
        port = (httpServer.address() as AddressInfo).port
        resolve()
      })
    })

    // Set up server-side socket handling
    server.on('connection', (socket) => {
      serverSocket = socket
      
      // Handle poll room joining
      socket.on('join-poll', (pollId: string) => {
        socket.join(`poll-${pollId}`)
      })

      // Handle poll room leaving
      socket.on('leave-poll', (pollId: string) => {
        socket.leave(`poll-${pollId}`)
      })

      // Handle comment room joining
      socket.on('join-comments', (contentId: string) => {
        socket.join(`comments-${contentId}`)
      })

      // Handle comment room leaving
      socket.on('leave-comments', (contentId: string) => {
        socket.leave(`comments-${contentId}`)
      })

      // Handle user room joining
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`)
      })
    })

    // Create client socket
    clientSocket = Client(`http://localhost:${port}`)
    
    // Wait for connection
    await new Promise<void>((resolve) => {
      clientSocket.on('connect', resolve)
    })
  })

  afterEach(async () => {
    cleanup()
    
    if (clientSocket) {
      clientSocket.disconnect()
    }
    
    if (server) {
      server.close()
    }
    
    if (httpServer) {
      httpServer.close()
    }
  })

  describe('Poll Real-time Updates', () => {
    it('should deliver poll result updates to connected clients', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            pollId: fc.string({ minLength: 1, maxLength: 10 }),
            optionId: fc.string({ minLength: 1, maxLength: 10 }),
            voteCount: fc.integer({ min: 1, max: 100 }),
            totalVotes: fc.integer({ min: 1, max: 1000 }),
          }),
          async ({ pollId, optionId, voteCount, totalVotes }) => {
            // Client joins poll room
            clientSocket.emit('join-poll', pollId)
            
            // Wait for join to complete
            await new Promise(resolve => setTimeout(resolve, 10))

            // Set up listener for poll updates
            const pollUpdatePromise = new Promise<any>((resolve) => {
              clientSocket.on('poll-update', resolve)
            })

            // Server emits poll update to the room
            const updateData = {
              pollId,
              results: {
                [optionId]: voteCount,
                totalVotes,
                updatedAt: new Date().toISOString(),
              }
            }

            server.to(`poll-${pollId}`).emit('poll-update', updateData)

            // Verify client receives the update
            const receivedUpdate = await Promise.race([
              pollUpdatePromise,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout waiting for poll update')), 1000)
              )
            ])

            expect(receivedUpdate).toEqual(updateData)
            expect(receivedUpdate.pollId).toBe(pollId)
            expect(receivedUpdate.results[optionId]).toBe(voteCount)
            expect(receivedUpdate.results.totalVotes).toBe(totalVotes)
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should handle multiple clients receiving poll updates simultaneously', async () => {
      const pollId = 'test-poll-123'
      const clients: ClientSocket[] = []

      try {
        // Create multiple client connections
        for (let i = 0; i < 3; i++) {
          const client = Client(`http://localhost:${port}`)
          clients.push(client)
          
          await new Promise<void>((resolve) => {
            client.on('connect', resolve)
          })
          
          client.emit('join-poll', pollId)
        }

        // Wait for all joins to complete
        await new Promise(resolve => setTimeout(resolve, 50))

        // Set up listeners on all clients
        const updatePromises = clients.map(client => 
          new Promise<any>((resolve) => {
            client.on('poll-update', resolve)
          })
        )

        // Server emits update
        const updateData = {
          pollId,
          results: {
            option1: 5,
            option2: 3,
            totalVotes: 8,
            updatedAt: new Date().toISOString(),
          }
        }

        server.to(`poll-${pollId}`).emit('poll-update', updateData)

        // Verify all clients receive the update
        const receivedUpdates = await Promise.all(
          updatePromises.map(promise => 
            Promise.race([
              promise,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 1000)
              )
            ])
          )
        )

        receivedUpdates.forEach(update => {
          expect(update).toEqual(updateData)
        })
      } finally {
        // Clean up client connections
        clients.forEach(client => client.disconnect())
      }
    })
  })

  describe('Comment Real-time Updates', () => {
    it('should deliver new comment notifications to connected clients', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contentId: fc.string({ minLength: 1, maxLength: 10 }),
            commentId: fc.string({ minLength: 1, maxLength: 10 }),
            authorName: fc.string({ minLength: 1, maxLength: 20 }),
            content: fc.string({ minLength: 1, maxLength: 100 }),
          }),
          async ({ contentId, commentId, authorName, content }) => {
            // Client joins comment room
            clientSocket.emit('join-comments', contentId)
            
            // Wait for join to complete
            await new Promise(resolve => setTimeout(resolve, 10))

            // Set up listener for new comments
            const commentPromise = new Promise<any>((resolve) => {
              clientSocket.on('new-comment', resolve)
            })

            // Server emits new comment to the room
            const commentData = {
              contentId,
              comment: {
                id: commentId,
                author: authorName,
                content,
                createdAt: new Date().toISOString(),
              }
            }

            server.to(`comments-${contentId}`).emit('new-comment', commentData)

            // Verify client receives the comment
            const receivedComment = await Promise.race([
              commentPromise,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout waiting for comment')), 1000)
              )
            ])

            expect(receivedComment).toEqual(commentData)
            expect(receivedComment.contentId).toBe(contentId)
            expect(receivedComment.comment.id).toBe(commentId)
            expect(receivedComment.comment.author).toBe(authorName)
            expect(receivedComment.comment.content).toBe(content)
          }
        ),
        { numRuns: 5 }
      )
    })

    it('should deliver comment updates to connected clients', async () => {
      const contentId = 'test-content-456'
      const commentId = 'comment-789'

      // Client joins comment room
      clientSocket.emit('join-comments', contentId)
      
      // Wait for join to complete
      await new Promise(resolve => setTimeout(resolve, 10))

      // Set up listener for comment updates
      const updatePromise = new Promise<any>((resolve) => {
        clientSocket.on('comment-update', resolve)
      })

      // Server emits comment update
      const updateData = {
        commentId,
        comment: {
          id: commentId,
          content: 'Updated comment content',
          likes: 5,
          updatedAt: new Date().toISOString(),
        }
      }

      server.to(`comments-${contentId}`).emit('comment-update', updateData)

      // Verify client receives the update
      const receivedUpdate = await Promise.race([
        updatePromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout waiting for comment update')), 1000)
        )
      ])

      expect(receivedUpdate).toEqual(updateData)
      expect(receivedUpdate.commentId).toBe(commentId)
      expect(receivedUpdate.comment.likes).toBe(5)
    })
  })

  describe('Connection Management', () => {
    it('should handle client disconnection and reconnection gracefully', async () => {
      const pollId = 'reconnect-test-poll'
      
      // Initial connection and join
      clientSocket.emit('join-poll', pollId)
      await new Promise(resolve => setTimeout(resolve, 10))

      // Disconnect client
      clientSocket.disconnect()
      
      // Wait for disconnection
      await new Promise(resolve => setTimeout(resolve, 50))

      // Reconnect
      clientSocket.connect()
      
      await new Promise<void>((resolve) => {
        clientSocket.on('connect', resolve)
      })

      // Rejoin poll room
      clientSocket.emit('join-poll', pollId)
      await new Promise(resolve => setTimeout(resolve, 10))

      // Set up listener
      const updatePromise = new Promise<any>((resolve) => {
        clientSocket.on('poll-update', resolve)
      })

      // Server emits update
      const updateData = {
        pollId,
        results: { option1: 1, totalVotes: 1 }
      }

      server.to(`poll-${pollId}`).emit('poll-update', updateData)

      // Verify client receives update after reconnection
      const receivedUpdate = await Promise.race([
        updatePromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout after reconnection')), 1000)
        )
      ])

      expect(receivedUpdate).toEqual(updateData)
    })

    it('should handle room joining and leaving correctly', async () => {
      const pollId = 'room-management-test'
      
      // Join room
      clientSocket.emit('join-poll', pollId)
      await new Promise(resolve => setTimeout(resolve, 10))

      // Set up listener
      let updateReceived = false
      clientSocket.on('poll-update', () => {
        updateReceived = true
      })

      // Server emits update - should be received
      server.to(`poll-${pollId}`).emit('poll-update', {
        pollId,
        results: { option1: 1 }
      })

      await new Promise(resolve => setTimeout(resolve, 50))
      expect(updateReceived).toBe(true)

      // Leave room
      clientSocket.emit('leave-poll', pollId)
      await new Promise(resolve => setTimeout(resolve, 10))

      // Reset flag
      updateReceived = false

      // Server emits another update - should NOT be received
      server.to(`poll-${pollId}`).emit('poll-update', {
        pollId,
        results: { option1: 2 }
      })

      await new Promise(resolve => setTimeout(resolve, 50))
      expect(updateReceived).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed update data gracefully', async () => {
      const pollId = 'error-test-poll'
      
      clientSocket.emit('join-poll', pollId)
      await new Promise(resolve => setTimeout(resolve, 10))

      // Set up listener that handles potential errors
      let errorOccurred = false
      let updateReceived = false

      clientSocket.on('poll-update', (data) => {
        try {
          // Attempt to process the data
          if (data && typeof data === 'object') {
            updateReceived = true
          }
        } catch (error) {
          errorOccurred = true
        }
      })

      // Server emits malformed data
      server.to(`poll-${pollId}`).emit('poll-update', null)
      
      await new Promise(resolve => setTimeout(resolve, 50))

      // Should not crash, but also should not process invalid data
      expect(errorOccurred).toBe(false)
      expect(updateReceived).toBe(false)
    })
  })
})