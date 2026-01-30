const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.io
  const io = new Server(server, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: dev ? 'http://localhost:3000' : process.env.NEXTAUTH_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Join user to their personal room for notifications
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`)
      console.log(`User ${userId} joined their room`)
    })

    // Join poll room for real-time voting updates
    socket.on('join-poll', (pollId) => {
      socket.join(`poll-${pollId}`)
      console.log(`Socket ${socket.id} joined poll ${pollId}`)
    })

    // Leave poll room
    socket.on('leave-poll', (pollId) => {
      socket.leave(`poll-${pollId}`)
      console.log(`Socket ${socket.id} left poll ${pollId}`)
    })

    // Join comment thread for real-time updates
    socket.on('join-comments', (contentId) => {
      socket.join(`comments-${contentId}`)
      console.log(`Socket ${socket.id} joined comments for ${contentId}`)
    })

    // Leave comment thread
    socket.on('leave-comments', (contentId) => {
      socket.leave(`comments-${contentId}`)
      console.log(`Socket ${socket.id} left comments for ${contentId}`)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  // Make io accessible to API routes
  global.io = io

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log('> Socket.io server initialized')
    })
})