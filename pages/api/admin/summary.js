import nc from 'next-connect'
import Order from '../../../models/Order'
import Product from '../../../models/Product'
import User from '../../../models/User'
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
  const ordersCount = await Order.countDocuments()
  const productsCount = await Product.countDocuments()
  const usersCount = await User.countDocuments()
  const ordersPriceGroup = await Order.aggregate([
    {
      $group: {
        // yamar negen ID ashiglahgui gesen tohirgoo
        _id: null,
        // totalPrice field in Order documents
        sales: { $sum: '$totalPrice' },
      },
    },
  ])
  const ordersPrice =
    ordersPriceGroup.length > 0 ? ordersPriceGroup[0].sales : 0
  // above is method from mongoose, to return number of records inside Order collection
  const salesData = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        totalSales: { $sum: '$totalPrice' },
      },
    },
  ])

  // zaaval disconnect hiij baigaarai
  db.disconnect()
  res.send({ ordersCount, productsCount, usersCount, ordersPrice, salesData })
})

export default handler
