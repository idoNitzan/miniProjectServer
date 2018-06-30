import { checkPasswordHash } from '../utils/hash'
import { getUserByEmail } from '../database/dbInterface'
import { signUserToken } from '../utils/tokens'

const MAX_LOGIN_FAILURES_PER_MINUTE = 5

export const handleLoginRequest = rateLimiter => async (req, res) => {
  const sessionId = req.cookies.sessionId

  if (!sessionId) {
    console.error('Error logging in - Missing session ID')
    res.status(400).json({ error: 'missing_session_id' })
    return
  }

  if (await rateLimiter.isSessionBlocked(sessionId)) {
    console.error('Error logging in - Session is blocked')
    res.status(400).json({ error: 'limit_exceeded' })
    return
  }

  if (await rateLimiter.getSessionFailuresCount(sessionId) >= MAX_LOGIN_FAILURES_PER_MINUTE) {
    console.error('Error logging in - Too many login failures from session')
    await rateLimiter.blockSessionFor2Minutes(sessionId)
    res.status(400).json({ error: 'limit_exceeded' })
    return
  }

  const email = req.body.email && req.body.email.toLowerCase()
  const user = getUserByEmail(email)

  if (!user) {
    console.error('Error logging in - Email does not exist')
    await rateLimiter.incrementSessionFailuresCount(sessionId)
    res.status(400).json({ error: 'invalid_email' })
    return
  }

  if (!user.passwordHash || !await checkPasswordHash(req.body.password, user.passwordHash)) {
    console.error('Error logging in - Incorrect password')
    await rateLimiter.incrementSessionFailuresCount(sessionId)
    res.status(400).json({ error: 'invalid_password' })
    return
  }

  console.log({ userId: user.id }, 'User logged in successfully')
  res.json({ userToken: signUserToken(user.id) })
}