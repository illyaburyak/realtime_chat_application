const path = require('path')
const http = require('http')
const express = require('express')
const Filter = require('bad-words')
const {generateMessage, generateLocationAndTime} = require('./utils/messages')
const {addUser, getUsersInRoom, removeUser, getUser} = require('./utils/users')

const {Server} = require("socket.io");


const port = process.env.PORT || "3000"
const app = express()

const server = http.createServer(app)
const io = new Server(server);

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
  console.log('New websocket connection')


  //listening for an event from the client
  socket.on('join', ({username, room}, callback) => {
    // store users, to keep track
    // socket id -> unique id for particular connection
    const {error, user} = addUser({id: socket.id, username, room})

    if (error) {
      return callback(error)
    }

    // allows join us a given chat room.
    socket.join(user.room)

    // sending event from server to the client through particular connection
    socket.emit('welcome', generateMessage(user.username, ' Welcome'))

    socket.broadcast.to(user.room).emit('welcome', generateMessage(user.username, ' has joined'))

    // sending list of all user in particular room in order to display it
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback()
  })

  socket.on('sendMessage', (message, callback) => {
    // using npm library
    const filter = new Filter()
    const user = getUser(socket.id)

    // validate message from the client for a bad word
    if (filter.isProfane(message)) {
      // sending back acknowledge
      return callback('Profanity is not allowed')
    }

    // sending message to everyone in that room
    io.to(user.room).emit('welcome', generateMessage(user.username, message))
    callback()
  })

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage', generateLocationAndTime(user.username, `https://google.com/maps?q=${coords.lat},${coords.long}`))

    // notify client
    callback('Location Shared!')
  })

  // client gets disconnected
  socket.on('disconnect', () => {
    // clean user when they leave
    const user = removeUser(socket.id)

    // if there is a user, and he left, only then we will notify other users
    if (user) {
      io.to(user.room).emit('welcome', generateMessage(`${user.username},  has left!`))

      // sending list of all user in particular room in order to display it after user left
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})

server.listen(port, () => {
  console.log(`listening on  + ${port}`)
})