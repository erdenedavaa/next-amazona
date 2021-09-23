import nc from 'next-connect'
import { isAdmin, isAuth } from '../../../../utils/auth'
import User from '../../../../models/User'
import db from '../../../../utils/db'

const handler = nc()
handler.use(isAuth, isAdmin)

handler.get(async (req, res) => {
  await db.connect()
  // fetch user for all users
  const users = await User.find({})

  await db.disconnect()
  res.send(users)
})

export default handler
