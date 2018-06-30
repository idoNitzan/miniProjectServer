import jwt from 'jsonwebtoken'

const secret = 'my-secret-key'

export function signUserToken(userId) {
  return jwt.sign({userId}, secret)
}

export function verifyUserToken(token) {
  return jwt.verify(token, secret).userId
}
