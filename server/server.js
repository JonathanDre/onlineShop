const express = require("express")
const app = express()
const http = require("http");
const socketIO = require("socket.io");
const bodyParser =require("body-parser")
const {db} =require("./firebase.js")
const cors =require("cors")
const configureSocketServer = require("./socket.js");
const getRawBody = require('raw-body')
require('dotenv').config();

const cookieParser = require('cookie-parser');
app.use(cookieParser());
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

app.use(
  (
    req,
    res,
    next
  ) => {
    console.log("req.originalUrl", req.originalUrl)
    if (req.originalUrl === '/webhook') {
      next();
    } else {
      express.json()(req, res, next);
    }
  }
);

const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:5173', 'http://localhost:5173'], // Add your allowed origins here
  methods: ['GET', 'POST'], // Add the allowed HTTP methods // Add any additional allowed headers
};

app.use(cors(corsOptions));
const server = http.createServer(app);
const authRouter =require("./routes/auth.js")
const userRouter =require("./routes/user.js")
const itemsRouter =require("./routes/items.js")
const giftsRouter =require("./routes/gifts.js")

/*app.options('/webhook', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.sendStatus(200);
});*/
const endpointSecret = process.env.WEBHOOK_SECRET

/*app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const payload = request.body.toString();
  console.log("payload", payload)
  const sig = request.headers['stripe-signature'];

  let event;
 console.log("sig", sig)
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.log("error", err)
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    // Retrieve the session. If you require line items in the response, you may include them by expanding line_items.
    const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
      event.data.object.id,
      {
        expand: ['line_items'],
      }
    );
    const lineItems = sessionWithLineItems.line_items;

    // Fulfill the purchase...
    fulfillOrder(lineItems);
  }

  response.status(200).end();
});*/
app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  //const payload = Buffer.from(JSON.stringify(request.body), 'utf-8');
  const rawPayload = request.getRawBody()
  const payloadString = rawPayload.toString('utf-8')
  const payload = JSON.parse(payloadString)
 
  
  const valueObjectList = {"19999": {value:1500, name: "Diamond"}, "39999": {value:3500, name: "Ruby"}, "9999": {value:700, name: "Gold"}, "4999": {value:300, name: "Silver"} }
  const sig = request.headers['stripe-signature'];
  console.log("sig", sig)
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawPayload, sig, endpointSecret);
  
  } catch (err) {
    console.log("errr", err.message)
  }
  if(event.type == "charge.succeeded"){
    try {
      const session = payload.data.object.metadata.user;
      const amount = payload.data.object.amount
      const timestamp = Date.now()
      const date = new Date(timestamp)
      const firebaseDate = date.toISOString()
      const subsc = valueObjectList[String(amount)]
      console.log('Got session payload:', session);
    
      console.log("Got payload: " + JSON.stringify(payload));
      const userRef = db.collection('users');
      const snapshot = await userRef.where('userName', '==', session).limit(1).get();
      if (snapshot.empty) {
        console.log('No matching documents.');
        res.status(404).json({ message: 'User not found' });
      } 
      
        const userDoc = snapshot.docs[0];
        const currentSubscription = userDoc.data().subscription
        const tokens = userDoc.data().tokens
        console.log("currentSubscription", currentSubscription)
      if (userDoc && currentSubscription.hasOwnProperty("value") && currentSubscription.value < subsc.value) {
       await userDoc.ref.update({ subscription : {value: subsc.value, name: subsc.name, createdAt: firebaseDate }, tokens: tokens + subsc.value});
       console.log("new subscription is bigger") 
      } else if(userDoc && currentSubscription.hasOwnProperty("value") && currentSubscription.value > subsc.value){
        console.log("old subscription is bigger") 
        await userDoc.ref.update({tokens: tokens + subsc.value})
      }else if(userDoc && !currentSubscription.hasOwnProperty("value")){
        await userDoc.ref.update({ subscription : {value: subsc.value, name: subsc.name, createdAt: firebaseDate }, tokens: tokens + subsc.value});
        console.log("no subscription or price")
      }else{
        console.log("nowhere")
        await userDoc.ref.update({tokens: tokens + subsc.value})
      }
      }catch(err){
        console.log(err)
      }
  }
  response.status(200).end();
});
configureSocketServer(server)
app.use('/auth', authRouter)
app.use('/user', userRouter)
app.use('/subscriptions', itemsRouter)
app.use('/gifts', giftsRouter)
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});