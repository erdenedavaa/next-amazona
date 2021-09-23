import nc from 'next-connect'
import User from '../../../models/User'
import db from '../../../utils/db'
import bcrypt from 'bcryptjs'
import { signToken } from '../../../utils/auth'

const handler = nc()

handler.post(async (req, res) => {
  await db.connect()
  // below means return all products, without any filter
  const user = await User.findOne({ email: req.body.email })
  await db.disconnect()

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    const token = signToken(user)
    // send to frontEnd
    res.send({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    })
  } else {
    res.status(401).send({ message: 'Invalid email or password' })
  }
})

export default handler
