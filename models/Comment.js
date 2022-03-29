const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
    comment: {
      type: String,
      required: "Comment is required",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      enum: ["Pending", "Active", "Removed"],
      type: String,
      default: "Active",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("Comment", commentSchema);
