import { NextRequest, NextResponse } from 'next/server'

import { readFile, stat } from 'fs/promises'

import { extname } from 'path'

import { resolveUpload } from '@/lib/uploads'

// Serves uploaded photos from UPLOAD_DIR at the same /uploads/<category>/<file>
// URLs the upload route has always returned, so every URL already stored in the
// database keeps working. See src/lib/uploads.ts for why this is not public/.
export const dynamic = 'force-dynamic'

const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const file = resolveUpload(path)
  const type = file ? TYPES[extname(file).toLowerCase()] : undefined

  if (!file || !type) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const info = await stat(file)
    if (!info.isFile()) return new NextResponse('Not found', { status: 404 })

    return new NextResponse(new Uint8Array(await readFile(file)), {
      headers: {
        'Content-Type': type,
        'Content-Length': String(info.size),
        // Upload filenames start with a timestamp, so a URL's content never
        // changes. "private" because the whole site sits behind a password.
        'Cache-Control': 'private, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
