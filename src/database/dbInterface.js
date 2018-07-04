import shortid from 'shortid'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
let db

/*
* This module contains a set of functions that
* are used for communication with the database
*/

export const initDb = () => {
  const adapter = new FileSync('db.json')
  db = low(adapter)
  db.defaults({ users: [], blockedSessions: [], loginFailures: [] }).write()
}

export const createUser = data => {
  const existingUser = db.get('users').find({email: data.email}).value()
  if (existingUser) {
    throw new Error('User with this email already exists')
  }
  const id = shortid.generate()
  db.get('users').push({
    id,
    email: data.email,
    passwordHash: data.passwordHash,
    name: data.name,
  }).write()
  return id
}

export const getUserByEmail = email => {
  return db.get('users').find({email}).value()
}

export const getUserNameById = userId => {
  const user = db.get('users').find({id: userId}).value()
  return user && user.name
}

export const blockSession = sessionId => {
  db.get('blockedSessions').push({ sessionId }).write()
}

export const isSessionBlocked = sessionId => {
  return !!db.get('blockedSessions').find({ sessionId }).value()
}

export const unblockSession = sessionId => {
  db.get('blockedSessions').remove({ sessionId }).write()
}

export const removeSessionFromFailuresCollection = sessionId => {
  db.get('loginFailures').remove({ sessionId }).write()
}

export const getSessionFailuresCount = sessionId => {
  const session = db.get('loginFailures').find({ sessionId }).value()
  return (session && session.count) || 0
}

export const addSessionToLoginFailuresCollection = sessionId => {
  db.get('loginFailures').push({ sessionId, count: 1 }).write()
}

export const incrementSessionFailuresCount = sessionId => {
  const count = db.get('loginFailures').find({ sessionId }).value().count
  db.get('loginFailures').find({ sessionId }).assign({ count: count+1 }).write()
}