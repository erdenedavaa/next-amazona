import nc from 'next-connect'
import Order from '../../../models/Order'
import { isAuth, isAdmin } from '../../../utils/auth'
import db from '../../../utils/db'
import { onError } from '../../../utils/error'

const handler = nc({
  onError,
})

// Only AUTHENTICATED users can access to this API
// 1-st, check isAuth, 2-nd, check isAdmin daraalaltai gesen ug
handler.use(isAuth, isAdmin)
// above is MIDDLEWARE

handler.get(async (req, res) => {
  await db.connect()
  // fetch order for all users
  const orders = await Order.find({}).populate('user', 'name')

  await db.disconnect()
  res.send(orders)
})

export default handler
