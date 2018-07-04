import { checkPasswordHash } from '../utils/hash'
import { getSessionFailuresCount, getUserByEmail, isSessionBlocked } from '../database/dbInterface'
import { signUserToken } from '../utils/tokens'
import { blockSessionFor30Seconds, updateSessionFailuresCount } from '../utils/rateLimit'

const MAX_LOGIN_FAILURES_PER_MINUTE = 5

export const handleLoginRequest = async (req, res) => {
  const sessionId = req.cookies.sessionId

  if (!sessionId) {
    console.error('Error logging in - Missing session ID')
    res.status(400).json({ error: 'missing_session_id' })
    return
  }

  if (isSessionBlocked(sessionId)) {
    console.error('Error logging in - Session is blocked')
    res.status(400).json({ error: 'limit_exceeded' })
    return
  }

  if (getSessionFailuresCount(sessionId) >= MAX_LOGIN_FAILURES_PER_MINUTE) {
    console.error('Error logging in - Too many login failures from session')
    blockSessionFor30Seconds(sessionId)
    res.status(400).json({ error: 'limit_exceeded' })
    return
  }

  const email = req.body.email && req.body.email.toLowerCase()
  const user = getUserByEmail(email)

  if (!user) {
    console.error('Error logging in - Email does not exist')
    await updateSessionFailuresCount(sessionId)
    res.status(400).json({ error: 'invalid_email' })
    return
  }

  if (!user.passwordHash || !await checkPasswordHash(req.body.password, user.passwordHash)) {
    console.error('Error logging in - Incorrect password')
    await updateSessionFailuresCount(sessionId)
    res.status(400).json({ error: 'invalid_password' })
    return
  }

  console.log({ userId: user.id }, 'User logged in successfully')
  res.json({ userToken: signUserToken(user.id) })
}