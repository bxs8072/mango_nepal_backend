const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      index: true,
      required: "Email address is required",
    },
    first_name: {
      type: String,
      trim: true,
      required: "First name is required",
    },
    last_name: {
      type: String,
      trim: true,
      required: "Last name is required",
    },
    password: {
      type: String,
      required: "Password is required",
    },
    role: {
      enum: ["User", "Admin", "Moderator"],
      type: String,
      default: "User",
    },
    gender: {
      enum: ["Male", "Female", "Non-binary"],
      type: String,
      required: "Gender is required",
    },
    short_bio: {
      type: String,
    },
    age_range: {
      type: String,
      required: "Age range is required",
    },
    location: {
      zip: String,
      city: String,
      state: String,
    },
    phone_number: {
      type: String,
      trim: true,
    },
    privacy: {
      share_name: Boolean,
      share_email: Boolean,
      share_phone: Boolean,
    },
    education: {
      university: String, // api powered, autocomplete
      level: {
        enum: ["Associates", "Bachelor", "Masters", "PhD", "Others"],
        type: String,
      },
      major: String, // api powered, autocomplete
      concentrations: String,
      graduated: Boolean,
      graduation_year: String,
      mentoring_in: String,
      need_mentoring_in: String,
      need_mentoring: Boolean,
      become_mentor: Boolean,
    },
    home_town: {
      type: String,
    },
    image: {
      type: String,
    },
    google: {
      type: String,
    },
    reset_password: {
      token: String,
    },
    first_login: {
      type: Boolean,
      default: true,
    },
    verify: {
      is_verified: Boolean,
      verify_code: String,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

userSchema.index({ "$**": "text" });

module.exports = mongoose.model("User", userSchema);
