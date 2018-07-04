import { checkPasswordHash } from '../utils/hash'
import { getSessionFailuresCount, getUserByEmail, isSessionBlocked } from '../database/dbInterface'
import { signUserToken } from '../utils/tokens'
import { blockSessionFor30Seconds, updateSessionFailuresCount } from '../utils/rateLimit'

const MAX_LOGIN_FAILURES_PER_MINUTE = 5

export const handleLoginRequest = async (req, res) => {
  const sessionId = req.cookies.sessionId

  // If there is no session ID cookie reject to request
  if (!sessionId) {
    console.error('Error logging in - Missing session ID')
    res.status(400).json({ error: 'missing_session_id' })
    return
  }

  // If session is blocked reject the request
  if (isSessionBlocked(sessionId)) {
    console.error('Error logging in - Session is blocked')
    res.status(400).json({ error: 'limit_exceeded' })
    return
  }

  // If session login failures count is more than the maximum reject the request
  if (getSessionFailuresCount(sessionId) >= MAX_LOGIN_FAILURES_PER_MINUTE) {
    console.error('Error logging in - Too many login failures from session')
    blockSessionFor30Seconds(sessionId)
    res.status(400).json({ error: 'limit_exceeded' })
    return
  }

  const email = req.body.email && req.body.email.toLowerCase()
  const user = getUserByEmail(email)

  // If there is no user with the given email address reject the request
  if (!user) {
    console.error('Error logging in - Email does not exist')
    await updateSessionFailuresCount(sessionId)
    res.status(400).json({ error: 'invalid_email' })
    return
  }

  // Check if the found user types the correct password
  if (!user.passwordHash || !await checkPasswordHash(req.body.password, user.passwordHash)) {
    console.error('Error logging in - Incorrect password')
    await updateSessionFailuresCount(sessionId)
    res.status(400).json({ error: 'invalid_password' })
    return
  }

  // Respond with user token
  console.log({ userId: user.id }, 'User logged in successfully')
  res.json({ userToken: signUserToken(user.id) })
}