// const mongoose = require('mongoose')
const { User, loginValidation } = require('../models/users')
const crypt = require('bcrypt')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const joi = require('joi')
const config = require('config')
const validateEmail = joi.object().keys({
    email: joi.string().required().max(255).min(3).email()
})

const SECRET = config.get('jwtSecret')

router.post('/login', async (req, res) => {
    const { error } = loginValidation.validate(req.body)
    if (error) return res.status(400).json(error.details)
    if (!req.body) return res.status(400).json("please check your request")
    let user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).json("invalid email or password")
    let isSame = await crypt.compare(req.body.password, user.password)
    if (!isSame) {
        return res.status(400).json("invalid email or password")

    }
    const token = jwt.sign({ _id: user.email, isSeller: user.isSeller ? user.isSeller : false }, SECRET)
    res.send({ user, token })
})


router.post('/forgot-password', async (req, res) => {
    const { error } = validateEmail.validate(req.body)

    if (error) return res.status(400).json(error.details)
    let user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).json("invalid email ")

    const userSecret = SECRET + user.password
    const token = jwt.sign({ email: user.email, isSeller: user.isSeller ? user.isSeller : false }, userSecret)
    const link = `http://localhost:3000/api/auth/reset-password/${user.email}/${token}`

    console.log("line 53", link)
    res.send(link)
})

router.get('/reset-password/:email/:token', async (req, res) => {
    const { email, token } = req.params
    let user = await User.findOne({ email })
    if (!user) return res.status(400).json("invalid email ")
    const userSecret = SECRET + user.password
    try {
        const payload = jwt.verify(token, userSecret)
        res.render('reset-password', { email, token })
    } catch (error) {
        return res.status(403).json("Forbidden")
    }
    res.send(req.params)
})

router.post('/reset-password/:email/:token', async (req, res) => {
    console.log("request line 72", req.body)
    const { email, token } = req.params
    let user = await User.findOne({ email })
    if (!user) return res.status(400).json("invalid email ")
    const userSecret = SECRET + user.password

    try {
        const payload = jwt.verify(token, userSecret)
        const salt = await crypt.genSalt(10)
        user.password = await crypt.hash(req.body.password, salt)
        await user.save()
    } catch (error) {
        return res.status(403).json("Forbidden")
    }

    // try {
    //     const payload = jwt.verify(token, userSecret)

    // } catch (error) {
    //     return res.status(403).json("Forbidden")
    // }

    res.send("password successfully changed")
})

router.get('/verify-email/:email/:token', async (req, res) => {
    const { email, token } = req.params
    let user = await User.findOne({ email })
    if (!user) return res.status(400).json("invalid email ")
    const userSecret = SECRET + user.password
    try {
        const payload = jwt.verify(token, userSecret)
        user.isVerified = true
        await user.save()
    } catch (error) {
        return res.status(403).json("Forbidden")
    }
    res.send("successfully verified")
})

module.exports = router