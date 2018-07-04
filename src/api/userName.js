import { verifyUserToken } from '../utils/tokens'
import { getUserNameById } from '../database/dbInterface'

export const handleUserNameFetchRequest = async (req, res) => {
  const userToken = req.cookies.userToken

  let userId
  try {
    userId = await verifyUserToken(userToken)
  } catch (err) {
    console.error('User token is invalid', err)
    res.status(400).json({ error: 'invalid', errors: { userToken: err } })
    return
  }

  const userName = getUserNameById(userId)
  if (!userName) {
    console.error('Failed fetching user name')
    res.status(400).json({ error: 'internal' })
    return
  }

  console.log({ userName }, 'User name fetched successfully')
  res.json({ userName })
}