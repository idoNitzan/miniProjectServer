import shortid from 'shortid'

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
let db

export const initDb = () => {
  const adapter = new FileSync('db.json')
  db = low(adapter)
  db.defaults({ images: [], users: [] }).write()
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