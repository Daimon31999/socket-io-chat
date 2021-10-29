const express = require('express')

const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require('unique-names-generator')

const getRandomName = () => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
  })
}

const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
  const userName = getRandomName()

  socket.emit('send-nickname', userName)
  socket.broadcast.emit('is-online', { userName: userName, isOnline: true })
  socket.isOnline = true

  socket.on('chat-message', (msg) => {
    io.emit('chat-message', { msg, userName, isOnline: socket.isOnline })
  })

  socket.on('user-is-typing', (userName) => {
    socket.broadcast.emit('user-is-typing-broadcast', userName)
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit('is-online', { userName: userName, isOnline: false })
    socket.isOnline = false
    io.emit('user disconnect', 'user disconnect ;)  ')
  })
})

server.listen(3000, () => {
  console.log('listening on PORT: 3000')
})
