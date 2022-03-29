const mongoose = require("mongoose");

const proSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: "Name is required",
    },
    pro_type: {
      type: String,
      required: "Professional type is required",
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
    prefix: {
      type: String,
      default: "",
    },
    zip: String,
    city: String,
    state: String,
    home_town: String,
    specialized: String,
    contact: String,
    description: String,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("Professional", proSchema);
