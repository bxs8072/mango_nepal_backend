const mongoose = require("mongoose")
const chatSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reciever: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    messages: [
        {
            message: String,
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
})

module.exports = mongoose.model("Chat", chatSchema)
