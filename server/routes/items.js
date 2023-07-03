const express = require("express")
const router = express.Router();
const {shop,checkout} = require ("./../controllers/items.js")
const {verifyToken} = require("./../middleware/checkToken.js")
router.get('/shop',verifyToken, shop);
router.post('/create-checkout-session',verifyToken, checkout )
module.exports = router