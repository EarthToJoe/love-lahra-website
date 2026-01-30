import { NextRequest } from 'next/server'

import { Server as NetServer } from 'http'

import { Server as ServerIO } from 'socket.io'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// This will be handled by the custom server
export async function GET(req: NextRequest) {
  return new Response('Socket.IO server should be running', { status: 200 })
}

export async function POST(req: NextRequest) {
  return new Response('Socket.IO server should be running', { status: 200 })
}
