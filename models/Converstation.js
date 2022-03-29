const mongoose = require("mongoose")
const conversationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    hero: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    message: {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        message: {
            type: String
        }
    }
})

module.exports = mongoose.model("Conversation", conversationSchema)
