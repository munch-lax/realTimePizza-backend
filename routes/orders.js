const { User, loginValidation } = require('../models/users')
const { Order } = require("../models/order")
const express = require('express')
const { Stock } = require("../models/stock")
const auth = require('../middleware/verifytoken')
const router = express.Router()
const config = require('config')
const SECRET = config.get('jwtSecret')

router.post('/createOrder', auth, async (req, res) => {
    const { pizzas, customPizza, price, orderedBy } = req.body
    let user = await User.findOne({ email: orderedBy })
    if (!user) return res.status(400).json("User does not exist")
    let inventory = await Stock.findOne()

    let newpizzas = inventory.pizzas.map((pizza) => {
        let obj = pizzas.find(item => item._id == pizza._id)
        if (obj) {
            let count = pizza.count - obj.quantity

            if (pizza.threshold > count) {
                //send mail
            }
            return { ...pizza, count, threshold: 2 }
        }
        else {
            return { ...pizza, threshold: 2 }
        }
    })
    if (customPizza) {
        let customPizzaStock = inventory.stock
        let newObj = {}
        Object.keys(customPizza).map(key => {
            let arr = customPizza[key]
            let newArr = []
            if (arr) {
                newArr = customPizzaStock[key].map((pizza) => {
                    let obj = arr.find(item => item._id == pizza._id)
                    if (obj) {
                        let count = pizza.count - 1
                        if (pizza.threshold > count) {
                            //send mail
                        }
                        return { ...pizza, count, threshold: 2 }
                    }
                    else {
                        return { ...pizza, threshold: 2 }
                    }
                })
            }
            else {
                newArr = customPizzaStock[key]
            }
            newObj[key] = newArr
        })

        inventory.pizzas = newpizzas
        inventory.stock = newObj

        await inventory.save()

    }
    const order = new Order(
        {
            pizzas: pizzas,
            customPizza: customPizza,
            price: price,
            orderedBy: orderedBy,
            status: 'received'
        })
    await order.save()
    res.send("order created successfully")
})
router.get('/allOrders/:email', auth, async (req, res) => {
    const { email } = req.params
    let user = await User.findOne({ email })
    if (!user) return res.status(400).json("User does not exist")
    let orders = await Order.find({ orderedBy: email })
    res.send(orders)
})

router.get('/allOrders', auth, async (req, res) => {
    // const { email } = req.params
    // let user = await User.findOne({ email })
    // if (!user) return res.status(400).json("User does not exist")
    let orders = await Order.find({})
    res.send(orders)
})

router.post('/status', auth, async (req, res) => {
    const { orderId } = req.body
    let order = await Order.findOne({ _id: orderId })
    if (!order) return res.status(400).json("Order does not exist")

    order.status = req.body?.status
    await order.save()
    res.send(order)
})

module.exports = router