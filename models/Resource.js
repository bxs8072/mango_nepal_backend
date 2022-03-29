const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    link: {
      type: String,
      required: "Link is required",
    },
    title: {
      type: String,
      required: "Title is required",
    },
    status: {
      enum: ["Pending", "Active"],
      default: "Pending",
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

schema.index({ "$**": "text" });

module.exports = mongoose.model("Resource", schema);
