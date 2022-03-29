const mongoose = require("mongoose");
const User = mongoose.model("User");
const sha256 = require("js-sha256");

module.exports = async () => {
  try {
    const isAdminThere = await User.findOne({ role: "Admin" });
    if (isAdminThere) {
      console.log("Seed already done");
      return;
    }

    const adminAccount = new User({
      first_name: "Admin",
      last_name: "Admin",
      email: "admin@admin.com",
      password: sha256(process.env.SALT + "admin"),
      role: "Admin",
      gender: "Male",
      age_range: "20 Below",
      zip: "00977",
    });

    await adminAccount.save();
    console.log("DB seeded");
  } catch (err) {
    console.log("Error for seeder", err);
  }
};
