const mongoose = require("mongoose");
const User = mongoose.model("User");

exports.byLevel = async (req, res) => {
  const counter = await User.aggregate([
    {
      $group: {
        _id: { level: "$education.level" },
        value: { $sum: 1 },
      },
    },
  ]);

  if (!counter) throw "No user with level found";
  counter.forEach((item) => {
    item.name = item._id.level;
    if (!item.name) item.name = "Unknown";
    delete item._id;
  });

  res.json(counter);
};
exports.byAge = async (req, res) => {
  const counter = await User.aggregate([
    {
      $group: {
        _id: { level: "$age_range" },
        value: { $sum: 1 },
      },
    },
  ]);

  if (!counter) throw "No user with age range found";
  counter.forEach((item) => {
    item.name = item._id.level;
    if (!item.name) item.name = "Unknown";
    delete item._id;
  });

  res.json(counter);
};
exports.byState = async (req, res) => {
  const counter = await User.aggregate([
    {
      $group: {
        _id: { level: "$location.state" },
        user_count: { $sum: 1 },
      },
    },
  ]);

  if (!counter) throw "No user with state found";
  counter.forEach((item) => {
    item.state = item._id.level;
    if (!item.state) item.state = "Unknown";
    delete item._id;
  });

  res.json(counter);
};
exports.byHometown = async (req, res) => {
  const counter = await User.aggregate([
    {
      $group: {
        _id: { level: "$home_town" },
        user_count: { $sum: 1 },
      },
    },
  ]);

  if (!counter) throw "No user with homw town found";
  counter.forEach((item) => {
    item.home_town = item._id.level;
    if (!item.home_town) item.home_town = "Unknown";
    delete item._id;
  });

  res.json(counter);
};
