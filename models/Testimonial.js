const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: String,
    work_as: String,
    description: String,
    image: String,
    side: {
      enum: ["Left", "Right"],
      type: String,
      default: "Left",
    },
    status: {
      enum: ["Pending", "Active"],
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("Testimonial", schema);
