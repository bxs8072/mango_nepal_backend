const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    key: String,
    value: String,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("KeyValue", schema);
