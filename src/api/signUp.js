import { hashPassword } from '../utils/hash'
import { createUser } from '../database/dbInterface'
import { signUserToken } from '../utils/tokens'

export const handleSignUpRequest = async (req, res) => {
  // Verify validity of all the entered fields
  req.checkBody({
    email: { isEmail: true },
    password: { isLength: { options: { min: 8 } } },
    name: { notEmpty: true },
  })

  const errors = await req.getValidationResult()

  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'invalid', errors: errors.mapped() })
    return
  }

  const email = req.body.email.toLowerCase()
  const passwordHash = await hashPassword(req.body.password)
  const name = req.body.name
  let userId
  try {
    userId = createUser({email, passwordHash, name})
  } catch (err) {
    res.status(400).json({ error: 'email_exists', errors: errors.mapped() })
    return
  }

  // Respond with the newly generated user token
  console.log({ userId }, 'User created')
  res.json({ userToken: signUserToken(userId) })
}