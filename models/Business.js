const mongoose = require("mongoose");

const proSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: "Name is required",
      index: "text",
    },
    business_type: {
      type: String,
      required: "Professional type is required",
    },
    status: {
      enum: ["Pending", "Active"],
      default: "Pending",
      type: String,
    },
    logo: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    zip: String,
    city: String,
    state: {
      type: String,
      index: "text",
    },
    description: {
      type: String,
      index: "text",
    },
    contact: String,
    email: String,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("Business", proSchema);
