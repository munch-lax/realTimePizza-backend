const joi = require('joi')
const mongoose = require('mongoose')

const userSchema = mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true, maxlength: 50, minlength: 3 },
    email: { type: String, required: true, maxlength: 255, minlength: 5, unique: true },
    password: { type: String, required: true, maxlength: 1024, minlength: 8 },
    isSeller: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false }
}))


const schema = joi.object().keys({
    name: joi.string().required().max(50).min(3),
    email: joi.string().required().max(255).min(3).email(),
    password: joi.string().required().max(255).min(8),
})

const loginSchema = joi.object().keys({
    email: joi.string().required().max(255).min(3).email(),
    password: joi.string().required().max(255).min(8),
})

exports.User = userSchema
exports.userValidation = schema
exports.loginValidation = loginSchema