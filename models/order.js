const { number } = require('joi')
const joi = require('joi')
const mongoose = require('mongoose')

const customStockSchema = new mongoose.Schema({
    name: { type: String, required: true },
    count: { type: Number },
    price: { type: Number },
    quantity: { type: Number }
})
const orderSchema = mongoose.model('Order', new mongoose.Schema({
    pizzas: [customStockSchema],
    customPizza: {
        base: [customStockSchema],
        sauces: [customStockSchema],
        meat: [customStockSchema],
        cheese: [customStockSchema],
        veggies: [customStockSchema]
    },
    date: { type: Date, default: Date.now },
    price: { type: Number, required: true },
    orderedBy: { type: String, required: true, maxlength: 255, minlength: 5 },
    status: { type: String, required: true, maxlength: 15, minlength: 5 },
}))





exports.Order = orderSchema