require("dotenv").config();
//Setup database connection
const mongoose = require("mongoose");

//Connect to MongoDB
mongoose.connect(process.env.DATABASE_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

mongoose.set("useCreateIndex", true);
mongoose.connection.on("error", () => {
  console.error("MongoDB Connection ERROR");
});

mongoose.connection.once("open", function () {
  console.log("MongoDB connected");
  setTimeout(() => {
    const seed = require("./utils/dbSeeder");
    seed();
  }, 500);
  // do database seeding on this line if needed to
});

//Bring in the models!
require("./models/User");
require("./models/Converstation");
require("./models/Chat");
require("./models/Blog");
require("./models/Comment");
require("./models/Like");
require("./models/File");
require("./models/Professional");
require("./models/Business");
require("./models/Resource");
require("./models/KeyValue");
require("./models/Testimonial");

//Start the server
const app = require("./app")

const server = app.listen(process.env.PORT, () => {
  console.log("Server Listening on: " + process.env.PORT)
})

var io = require('socket.io')(server)
const chatAuth = require('./middlewares/chatAuth')
const Chat = require("./models/Chat");
const Converstation = require("./models/Converstation");
const User = require("./models/User");

io.use(chatAuth)

io.on('connection', async (socket) => {
  const sender = await User.findById(socket.payload.id)

  console.log("Connected: ", sender._id)
  socket.on('disconnect', () => {
    console.log("Disconnected", sender._id)
  })

  socket.on('joinRoom', ({ chatId }) => {
    socket.join(chatId)
    console.log("A user joined: " + chatId)
  })

  socket.on('leaveRoom', ({ chatId }) => {
    socket.leave(chatId)
    console.log("A user left: " + chatId)
  })

  socket.on("chatroomMessage", async ({ chatId, reciever, message }) => {
    const chat = await Chat.findById(chatId)
    chat.sender = sender
    chat.reciever = reciever
    const createdAt = Date.now()
    chat.messages.push({ message, sender, createdAt })
    io.to(chatId).emit('newMessage', {
      message,
      sender,
      createdAt
    })
    await chat.save()

    Converstation
      .findOne({ user: sender, hero: reciever })
      .then(async (conv) => {
        if (conv) {
          conv.user = sender
          conv.hero = reciever
          conv.message = {
            message: message,
            sender: sender
          }
          conv.save()
        } else {
          await new Converstation({
            user: sender,
            hero: reciever,
            message: {
              sender: sender,
              message: message
            },
          }).save()
        }
      })

    Converstation
      .findOne({ user: reciever, hero: sender })
      .then(async (conv) => {
        if (conv) {
          conv.user = reciever
          conv.hero = sender
          conv.message = {
            message: message,
            sender: sender
          }
          await conv.save()
        } else {
          await new Converstation({
            user: reciever,
            hero: sender,
            message: {
              sender: sender,
              message: message
            },
          }).save()
        }
      })

  })

})





