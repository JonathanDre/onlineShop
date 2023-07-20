const {db} =  require("./../firebase.js")
const jwt = require("jsonwebtoken")
const verifyToken = require("./../middleware/checkToken.js")
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

const shop = async function(req, res){

    try {
      const itemsRef = db.collection('items');
      const snapshot = await itemsRef.get();
      const items = []
      snapshot.forEach(doc => {
        items.push({id: doc.id, data: doc.data()})
      });
      res.status(200).json({
        items: items
      })
      // Fetch the user's information from your database using userId
    } catch (error) {
      res.status(401).json({
        error: {
          name: error.name,
          message: error.message
        }
      });
    }
  }

  const checkout = async function(req, res){
    const userId = req.body[0].user
    console.log(userId)
    console.log(req.body[0].item)
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: req.body.map(item => {
            return {
              price_data : {
                currency: 'usd',
                product_data: {
                  name: item.item.data.name
                },
                unit_amount: item.item.data.price
              },
            quantity: item.quantity,
            }
          }),
          payment_intent_data
: {
            metadata : {user: userId}
            // Include any other custom information you want
          },
          success_url: 'http://127.0.0.1:5173/login',
          cancel_url: 'http://127.0.0.1:5173/login'
        })
        res.json({ url: session.url })
      } catch (e) {
        res.status(500).json({error: e.message})
      }
  }

  module.exports = {shop,checkout}