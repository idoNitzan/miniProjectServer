import {
  blockSession,
  unblockSession,
  removeSessionFromFailuresCollection,
  getSessionFailuresCount,
  addSessionToLoginFailuresCollection,
  incrementSessionFailuresCount,
} from '../database/dbInterface'

export function updateSessionFailuresCount(sessionId) {
  if (!getSessionFailuresCount(sessionId)) {
    addSessionToLoginFailuresCollection(sessionId)
    // After 10 seconds remove session from failed sessions collection
    setTimeout(() => removeSessionFromFailuresCollection(sessionId), 10000)
  } else {
    incrementSessionFailuresCount(sessionId)
  }
}

export function blockSessionFor30Seconds(sessionId) {
  // Add session ID to the blocked sessions collection
  blockSession(sessionId)
  // unblock session after 30 seconds
  setTimeout(() => unblockSession(sessionId), 30000)
}
