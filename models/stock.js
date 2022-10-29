const { number } = require('joi')
const joi = require('joi')
const mongoose = require('mongoose')


const customStockSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    count: { type: Number, required: true },
    price: { type: Number, required: true },
    threshold: { type: Number }
})
const stockSchema = mongoose.model('Stock', new mongoose.Schema({
    pizzas: [customStockSchema],
    stock: {
        basePrice: { type: Number, },
        base: [customStockSchema],
        sauces: [customStockSchema],
        meat: [customStockSchema],
        cheese: [customStockSchema],
        veggies: [customStockSchema]
    },
}))





exports.Stock = stockSchema