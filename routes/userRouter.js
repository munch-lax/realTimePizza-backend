const mongoose = require('mongoose')
const { User, userValidation, loginValidation } = require('../models/users')
const crypt = require('bcrypt')
const express = require('express')
const router = express.Router()
const joi = require('joi')
const config = require('config')
const validateEmail = joi.object().keys({
    email: joi.string().required().max(255).min(3).email()
})
const SECRET = config.get('jwtSecret')
const jwt = require('jsonwebtoken')
router.post('/register', async (req, res) => {

    const { error } = userValidation.validate(req.body)

    if (error) return res.status(400).json(error.details)
    if (!req.body) return res.status(400).json("please check your request")

    let user = await User.findOne({ email: req.body.email })
    if (user) return res.status(400).json("user already registered")

    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })

    const salt = await crypt.genSalt(10)
    user.password = await crypt.hash(user.password, salt)
    const userSecret = SECRET + user.password
    const token = jwt.sign({ email: user.email }, userSecret)
    const link = `http://localhost:3000/api/auth/verify-email/${user.email}/${token}`
    console.log(link)
    await user.save()

    res.send(user)

})
router.get('/:email', async (req, res) => {
    const { email } = req.params
    const { error } = validateEmail.validate({ email })

    if (error) return res.status(400).json(error.details)
    let user = await User.findOne({ email: email })
    if (!user) return res.status(400).json("invalid email")
    res.send({ name: user.name, email: user.email, isSeller: user.isSeller })

})
module.exports = router