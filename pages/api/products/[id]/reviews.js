//   /api/products/:id/reviews
import mongoose from 'mongoose'
import nextConnect from 'next-connect'
import {onError} from '../../../../utils/error'
import { isAuth } from '../../../../utils/auth'
import db from '../../../../utils/db'
import Product from '../../../../models/Product'

const handler = nextConnect({
  onError,
})

// hun bolgon review harah tul middleware hiisengui
handler.get(async (req, res) => {
  db.connect()
  const product = await Product.findById(req.query.id)
  db.disconnect()
  if (product) {
    res.send(product.reviews)
  } else {
    res.status(404).send({ message: 'Product not found' })
  }
})

handler.use(isAuth).post(async (req, res) => {
  await db.connect()
  const product = await Product.findById(req.query.id)
  if (product) {
    // hervee current user already created review, then can't add again
    const existReview = product.reviews.find((x) => x.user == req.user._id)
    if (existReview) {
      await Product.updateOne(
        { _id: req.query.id, 'reviews._id': existReview._id },
        {
          $set: {
            // comment of current review gesen utgatai. Yynd FRONTEND-ees irsen comment-iig suulgana, values of the input box
            'reviews.$.comment': req.body.comment,
            'reviews.$.rating': Number(req.body.rating),
          },
        }
      )

      const updatedProduct = await Product.findById(req.query.id)
      updatedProduct.numReviews = updatedProduct.reviews.length
      updatedProduct.rating =
        updatedProduct.reviews.reduce((a, c) => c.rating + a, 0) /
        updatedProduct.reviews.length
      await updatedProduct.save()

      await db.disconnect()
      return res.send({ message: 'Review updated' })
    } else {
      // If this user didn't create review for this product
      const review = {
        // Doorhiin format ni Product model iin LINE-6 ObjectId-tai taarah yostoi
        user: mongoose.Types.ObjectId(req.user._id),
        name: req.user.name,
        rating: Number(req.body.rating),
        // last one is text of comment
        comment: req.body.comment,
      }
      // push this review to the list of reviews of this product
      product.reviews.push(review)
      // update number of reviews
      product.numReviews = product.reviews.length
      // update average of reviews
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length

      // deerh byh info-g DB-d save
      await product.save()
      await db.disconnect()
      res.status(201).send({
        message: 'Review submitted',
      })
    }
  } else {
    // If not finding product in the database
    await db.disconnect()
    res.status(404).send({ message: 'Product Not Found' })
  }
})

export default handler
