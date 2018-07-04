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
    setTimeout(() => removeSessionFromFailuresCollection(sessionId), 10000)
  } else {
    incrementSessionFailuresCount(sessionId)
  }
}

export function blockSessionFor30Seconds(sessionId) {
  blockSession(sessionId)
  setTimeout(() => unblockSession(sessionId), 30000)
}
