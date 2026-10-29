const http = require('node:http')
const path = require('node:path')
const express = require('express')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })
const users = new Map() // socket.id -> { id, name }
const messages = new Map() // room -> messages[]

const publicUsers = () => [...users.values()]
const broadcastUsers = () => io.emit('users', publicUsers())

io.on('connection', socket => {
  console.log(`Client connected: ${socket.id}`)
  socket.on('register', name => {
    const cleanName = String(name || '').trim().slice(0, 30)
    if (!cleanName) return
    users.set(socket.id, { id: socket.id, name: cleanName })
    socket.data.name = cleanName
    console.log(`User registered: ${cleanName} (${socket.id})`)
    socket.emit('users', publicUsers())
    broadcastUsers()
  })

  socket.on('join', ({ room } = {}) => {
    if (!room) return
    socket.join(room)
    socket.emit('history', messages.get(room) || [])
  })

  socket.on('send_message', payload => {
    const room = String(payload?.room || '').trim()
    const text = String(payload?.text || payload?.message || '').trim().slice(0, 2000)
    if (!room || !text) return
    const message = { id: `${Date.now()}-${socket.id}`, sender: socket.data.name || payload.sender || 'Anonymous', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    const history = messages.get(room) || []
    history.push(message)
    messages.set(room, history.slice(-100))
    io.to(room).emit('receive_message', message)
  })

  socket.on('disconnect', () => { console.log(`Client disconnected: ${socket.id}`); users.delete(socket.id); broadcastUsers() })
})

const dist = path.join(__dirname, 'dist')
app.use(express.static(dist))
app.use((_, res) => res.sendFile(path.join(dist, 'index.html')))
server.listen(process.env.PORT || 3000, () => console.log('lucid.chat server listening on port 3000'))
