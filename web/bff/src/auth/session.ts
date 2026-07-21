import crypto from 'node:crypto'
import type { Response } from 'express'
import type { ModelUser, Session } from '@prisma/client'
import { prisma } from '../prisma/db.js'

export const SESSION_COOKIE = 'codehub_session'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex')

export async function createSession(
  userId: bigint,
): Promise<{ rawToken: string; expiresAt: Date }> {
  const rawToken = crypto.randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await prisma.session.create({
    data: { userId, tokenHash: hashToken(rawToken), expiresAt },
  })
  return { rawToken, expiresAt }
}

export async function resolveSession(
  rawToken: string,
): Promise<
  { user: ModelUser; session: Session } | { user: null; session: null }
> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true },
  })
  if (!session || session.expiresAt < new Date()) {
    return { user: null, session: null }
  }
  return { user: session.user, session }
}

export function setSessionCookie(
  res: Response,
  rawToken: string,
  expiresAt: Date,
) {
  res.cookie(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  })
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: '/' })
}
