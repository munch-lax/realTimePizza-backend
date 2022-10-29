const { Stock } = require("../models/stock")
const express = require('express')
const router = express.Router()
const auth = require('../middleware/verifytoken')

router.get('/', auth, async (req, res) => {
    let inventory = await Stock.findOne()
    res.send(inventory)
})

module.exports = router