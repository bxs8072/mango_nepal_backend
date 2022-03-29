const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    url: {
      required: "URL is required",
      type: String,
    },
    size: {
      type: String,
    },
    file_for: {
      type: String,
    },
    file_name: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("File", fileSchema);
