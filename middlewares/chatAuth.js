const jwt = require('jwt-then')

module.exports = async (socket, next) => {
    try {
        const token = socket.handshake.query.token || ""
        const payload = await jwt.verify(token, process.env.SECRET)
        socket.payload = payload
        socket.join(payload.id)
        next()
    } catch (err) {
        console.log('Error Authentication')
        next(err)
    }
}