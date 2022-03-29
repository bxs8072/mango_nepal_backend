const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: "Title is required",
      index: "text",
    },
    slug: {
      type: String,
      index: true,
      required: "Slug is required",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    like_count: {
      type: Number,
      default: 0,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    status: {
      enum: ["Active", "Pending", "Removed"],
      type: String,
      default: "Active",
    },
    cover_photo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
    body: {
      type: String,
      required: "Body is required",
    },
    tags: [],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("Blog", blogSchema);
