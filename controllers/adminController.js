const mongoose = require("mongoose");
const jwt = require("jwt-then");
const User = mongoose.model("User");
const sha256 = require("js-sha256");
const validator = require("validator");
const ErrorResponsor = require("../utils/errResponsor");
const moment = require("moment");

exports.login = async (req, res) => {
  const errResponser = new ErrorResponsor();
  const { email, password } = req.body;
  if (!password) errResponser.add("password", "Password is required");
  if (password && password.length < 5) errResponser.add("password", "Password should be of min 5 character");
  if (!email || !validator.isEmail(email)) errResponser.add("email", "Email is required & should be valid");
  if (errResponser.hasError) throw errResponser.errString();

  const hashPassword = sha256(process.env.SALT + password);

  const isUser = await User.findOne({
    email,
    password: hashPassword,
    $or: [{ role: "Admin" }, { role: "Moderator" }],
  });
  if (!isUser) throw "Invalid credentials provided";
  const tokenData = {
    id: isUser.id,
    email: isUser.email,
    role: isUser.role,
  };

  const accessToken = await jwt.sign(tokenData, process.env.SECRET);

  res.json({
    message: "Logged in successfully",
    data: tokenData,
    token: accessToken,
  });
};

exports.searchUser = async (req, res) => {
  const search = req.query.search || "";
  console.log(search);
  const users = await User.find({ $text: { $search: search } });
  if (!users) throw "No users found";
  res.json({
    total: users.length,
    data: users,
  });
};

exports.getUserById = async (req, res) => {
  const userId = req.params.user;
  let isUserExists = await User.findById(userId).lean(); // lean convert mongoose object to js object
  if (!isUserExists) throw "User not found";
  delete isUserExists.password; // dont send password...
  res.json(isUserExists);
};

exports.getAllUser = async (req, res) => {
  let { page, per_page, q } = req.query;
  if (!page) page = 0;
  else page = Math.ceil(page) - 1;
  if (!per_page) per_page = 50;
  else per_page = Math.ceil(per_page);

  let search_params = {};
  if (q && q.length > 1) {
    search_params = { $or: [{ first_name: new RegExp(q, "i") }, { last_name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }, { "location.state": new RegExp(q, "i") }, { "location.city": new RegExp(q, "i") }, { "education.university": new RegExp(q, "i") }] };
  }
  const usersCount = await User.countDocuments(search_params);
  let users = await User.find(search_params, "email first_name last_name role gender location.city education.university created_at updated_at")
    .skip(page * per_page)
    .limit(per_page)
    .lean();

  if (!users || users.length === 0) throw "No users found";
  users = users.map((item) => ({
    ...item,
    name: item.first_name + " " + item.last_name,
    created_at: moment(item.created_at).format("Do MMM, YYYY"),
    updated_at: moment(item.updated_at).format("Do MMM, YYYY"),
  }));

  res.json({
    total: usersCount,
    page: page + 1,
    per_page: per_page,
    total_page: Math.ceil(usersCount / per_page),
    data: users,
  });
};
