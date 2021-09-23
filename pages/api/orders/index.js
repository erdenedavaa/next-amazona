import nc from 'next-connect'
import Order from '../../../models/Order'
import { isAuth } from '../../../utils/auth'
import db from '../../../utils/db'
import { onError } from '../../../utils/error'

const handler = nc({
  onError,
})

// Only AUTHENTICATED users can access to this API
handler.use(isAuth)
// above is MIDDLEWARE

handler.post(async (req, res) => {
  await db.connect()
  const newOrder = new Order({
    ...req.body,
    // isAuth aas irsen LOGGED IN USER info
    user: req.user._id,
  })
  const order = await newOrder.save()
  res.status(201).send(order)
})

export default handler
