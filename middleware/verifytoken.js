const jwt = require('jsonwebtoken')
const config = require('config')
const SECRET = config.get('jwtSecret')
function auth(req, res, next) {
    const token = req.header('x-auth-token')

    if (!token) return res.status(400).json("Please provide a token")

    try {
        const payload = jwt.verify(token, SECRET)
        next()
    } catch (error) {
        return res.status(401).json("invalid token")
    }
}

module.exports = auth