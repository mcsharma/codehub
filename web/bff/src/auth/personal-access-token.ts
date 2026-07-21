import crypto from 'node:crypto'
import type { ModelUser } from '@prisma/client'
import { prisma } from '../prisma/db.js'

const LAST_USED_STALE_MS = 24 * 60 * 60 * 1000 // 1 day

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex')

export async function createPersonalAccessToken(
  userId: bigint,
  label: string,
): Promise<{ id: bigint; rawToken: string }> {
  const rawToken = crypto.randomBytes(32).toString('base64url')
  const created = await prisma.personalAccessToken.create({
    data: { userId, label, tokenHash: hashToken(rawToken) },
  })
  return { id: created.id, rawToken }
}

export async function resolvePersonalAccessToken(rawToken: string): Promise<ModelUser | null> {
  const token = await prisma.personalAccessToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true },
  })
  if (!token) return null

  const isStale = !token.lastUsedTime || Date.now() - token.lastUsedTime.getTime() > LAST_USED_STALE_MS
  if (isStale) {
    // Best-effort — don't let a slow/failed write block the auth check itself.
    prisma.personalAccessToken
      .update({ where: { id: token.id }, data: { lastUsedTime: new Date() } })
      .catch(() => {})
  }

  return token.user
}
