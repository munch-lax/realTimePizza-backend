const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser');
const users = require('./routes/userRouter')
const auth = require('./routes/auth')
const inventory = require('./routes/inventory');
const Order = require('./routes/orders');
const config = require('config')
const cors = require('cors');
const app = express()
app.options('*', cors())
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
    cors: { origin: '*' }
});


if (!config.get('jwtSecret')) {
    console.error("jwt secret not found")
    process.exit()
}
mongoose.connect('mongodb://127.0.0.1:27017/play').then((data) => {
}).catch(err => console.log(err))

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(express.json())
app.use(bodyParser.json())
    .use(bodyParser.urlencoded({
        extended: true
    }));
app.set('view engine', 'ejs');
app.use('/api/users', users)
app.use('/api/auth', auth)
app.use('/api/inventory', inventory)
app.use('/api/order', Order)

server.listen(3000, () => console.log("listening on port 3000"))
const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB database connected");
    const thoughtChangeStream = connection.collection("orders").watch();
    io.of("/api/socket").on("connection", (socket) => {
        console.log("socket.io: User connected: ", socket.id);
        socket.join()
        socket.on("disconnect", () => {
            console.log("socket.io: User disconnected: ", socket.id);
        });
    });
    thoughtChangeStream.on("change", (change) => {
        console.log("change detected")
        io.of("/api/socket").emit("newThought", "change detected");
    });
})
