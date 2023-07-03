const express = require("express")
const router = express.Router();
const { getAllGifts } = require ("./../controllers/gifts.js")

router.get('/getGifts',getAllGifts);

module.exports = router