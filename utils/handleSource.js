const mongoose = require("mongoose");
const Source = mongoose.model("Source");

const handleSource = async (req, user_id, auth_for) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const { browser, version, os, platform, source } = req.useragent;
  const details = { browser, version, os, platform, source };

  const newSource = new Source({ ip, details, auth_for, user: user_id });
  await newSource.save();
};

module.exports = handleSource;
