const express = require("express")

const config = require("./config")
const socket = require("./socket")

const app = express()
const server = require("http").createServer(app)
const io = require("socket.io")(server)

app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({ extended: true, limit: "2mb" }))
app.use(express.json())

socket(io)

server.listen(config.port, () => {
	console.log("Listening at http://localhost:" + config.port)
})