import { join, resolve, sep } from 'path'

// Where uploaded photos live.
//
// Deliberately NOT under public/. Next.js only serves files that were in public/
// when the app was built, so a photo written there while the app is running is
// saved but never displayed. Uploads are served by src/app/uploads/[...path]
// instead, which reads this folder on every request.
//
// In production UPLOAD_DIR points at storage mounted into the container, so
// photos survive a redeploy and are included in the nightly backup. Locally it
// falls back to ./uploads, which is gitignored — photos are content, not code,
// and must never be committed to the repository.
export const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR || join(process.cwd(), 'uploads'))

// Resolve a request path to a file inside UPLOAD_DIR, or null if it would escape
// it. "../" in a URL must never reach the rest of the filesystem.
export function resolveUpload(segments: string[]): string | null {
  const target = resolve(UPLOAD_DIR, ...segments)
  return target.startsWith(UPLOAD_DIR + sep) ? target : null
}
