import crypto from 'node:crypto'
import { Router } from 'express'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '../prisma/db.js'
import { createSession, setSessionCookie } from './session.js'

const STATE_COOKIE = 'oauth_state'

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

// Derives a unique `users.username` from an email's local-part, since Google
// gives us no username and the column is required + unique.
async function deriveUniqueUsername(email: string): Promise<string> {
  const base = email.split('@')[0]!.toLowerCase().replace(/[^a-z0-9-]/g, '') || 'user'
  let candidate = base
  let suffix = 2
  while (await prisma.modelUser.findUnique({ where: { username: candidate } })) {
    candidate = `${base}-${suffix++}`
  }
  return candidate
}

export const googleAuthRouter: Router = Router()

googleAuthRouter.get('/google', (_req, res) => {
  const state = crypto.randomBytes(16).toString('hex')
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000,
  })
  const url = client.generateAuthUrl({
    scope: ['openid', 'email', 'profile'],
    state,
  })
  res.redirect(url)
})

googleAuthRouter.get('/google/callback', async (req, res) => {
  const { code, state } = req.query
  if (!code || typeof code !== 'string' || !state || state !== req.cookies?.[STATE_COOKIE]) {
    res.status(400).send('Invalid or expired login attempt. Please try again.')
    return
  }
  res.clearCookie(STATE_COOKIE)

  const { tokens } = await client.getToken(code)
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  const payload = ticket.getPayload()
  if (!payload?.sub || !payload.email) {
    res.status(400).send('Google did not return the expected profile info.')
    return
  }
  const { sub, email, given_name, family_name } = payload

  const identity = await prisma.authIdentity.findUnique({
    where: { provider_providerAccountId: { provider: 'GOOGLE', providerAccountId: sub } },
    include: { user: true },
  })

  let user = identity?.user
  if (!user) {
    const username = await deriveUniqueUsername(email)
    user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.modelUser.create({
        data: {
          username,
          primaryEmail: email,
          data: { first_name: given_name ?? null, last_name: family_name ?? null },
        },
      })
      await tx.authIdentity.create({
        data: { userId: newUser.id, provider: 'GOOGLE', providerAccountId: sub, email },
      })
      return newUser
    })
  }

  const { rawToken, expiresAt } = await createSession(user.id)
  setSessionCookie(res, rawToken, expiresAt)
  res.redirect('/')
})
