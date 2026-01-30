import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare, hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from './prisma'

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
})

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        displayName: { label: 'Display Name', type: 'text' },
        action: { label: 'Action', type: 'hidden' }, // 'login' or 'register'
      },
      async authorize(credentials) {
        if (!credentials) return null

        try {
          const action = credentials.action || 'login'

          if (action === 'register') {
            // Registration flow
            const { email, password, displayName } = registerSchema.parse(credentials)

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
              where: { email }
            })
            
            if (existingUser) {
              throw new Error('User already exists with this email')
            }

            // Hash password
            const hashedPassword = await hash(password, 12)

            // Create user in database
            const user = await prisma.user.create({
              data: {
                email,
                displayName,
                password: hashedPassword,
                role: 'USER',
              }
            })

            return {
              id: user.id,
              email: user.email,
              name: user.displayName,
              role: user.role,
            }

          } else {
            // Login flow
            const { email, password } = loginSchema.parse(credentials)

            // Find user in database
            const user = await prisma.user.findUnique({
              where: { email },
              select: {
                id: true,
                email: true,
                displayName: true,
                password: true,
                role: true,
              }
            })
            
            if (!user) {
              throw new Error('No user found with this email')
            }

            // Check if user has a password set
            if (!user.password) {
              throw new Error('Please set a password for your account')
            }

            // Verify password
            const isPasswordValid = await compare(password, user.password)
            if (!isPasswordValid) {
              throw new Error('Invalid password')
            }

            return {
              id: user.id,
              email: user.email,
              name: user.displayName,
              role: user.role,
            }
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Helper functions for user management
export async function createUser(data: {
  email: string
  password: string
  displayName: string
}) {
  const hashedPassword = await hash(data.password, 12)
  
  const user = await prisma.user.create({
    data: {
      email: data.email,
      displayName: data.displayName,
      password: hashedPassword,
      role: 'USER',
    }
  })
  
  return user
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword)
}