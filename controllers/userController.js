const mongoose = require("mongoose");
const jwt = require("jwt-then");
const User = mongoose.model("User");
const sha256 = require("js-sha256");
const validator = require("validator");
const ErrorResponsor = require("../utils/errResponsor");
const zipcodes = require("zipcodes");
var crypto = require("crypto");
const sendResetMail = require("../utils/sendResetMail");
const sendActiveMail = require("../utils/sendActivationMail");
const sendContactUsMail = require("../utils/sendContactMail");
const { OAuth2Client } = require("google-auth-library");

exports.register = async (req, res) => {
  const errResponser = new ErrorResponsor();
  let { first_name, last_name, password, email, gender, age_range, zip } = req.body;
  if (!first_name) errResponser.add("name", "First name is required");
  if (!last_name) errResponser.add("name", "Last name is required");
  if (!password) errResponser.add("password", "password is required");
  if (password && password.length < 6) errResponser.add("password", "Password should be of min 6 character");
  if (!email || !validator.isEmail(email)) errResponser.add("email", "Email is required & should be valid");
  if (!gender) errResponser.add("gender", "gender is required");
  if (!age_range) errResponser.add("age_range", "Age range is required");
  if (!zip) errResponser.add("zip", "Zip code is required");
  if (errResponser.hasError) throw errResponser.errString();

  email = email.toLowerCase();

  let location = {
    zip: zip,
    city: "",
    state: "",
  };
  const decodeZip = zipcodes.lookup(zip);
  if (decodeZip) {
    location.city = decodeZip.city;
    location.state = decodeZip.state;
  }

  const hashPassword = sha256(process.env.SALT + password);
  const userExists = await User.findOne({ email });

  if (userExists && userExists.verify && !userExists.verify.is_verified) {
    await userExists.remove();
  } else if (userExists) throw "User with given email already exists";

  const privacy = {
    share_name: true,
    share_email: true,
    share_phone: false,
  };
  const rand_code = crypto.randomBytes(20).toString("hex");

  const verify = {
    is_verified: false,
    verify_code: rand_code,
  };

  const newUser = new User({
    ...req.body,
    email: email,
    password: hashPassword,
    location,
    privacy,
    verify,
    role: "User",
  });
  await newUser.save();

  try {
    await sendActiveMail(email, rand_code);
    res.json({
      message: "User registered successfully, please check your email and activate your account",
    });
  } catch (err) {
    throw "Email sending error occured, try again";
  }
};

exports.login = async (req, res) => {
  const errResponser = new ErrorResponsor();
  let { email, password } = req.body;
  if (!password) errResponser.add("password", "password is required");
  if (password && password.length < 5) errResponser.add("password", "Password should be of min 5 character");
  if (!email || !validator.isEmail(email)) errResponser.add("email", "Email is required & should be valid");
  if (errResponser.hasError) throw errResponser.errString();

  email = email.toLowerCase();
  const hashPassword = sha256(process.env.SALT + password);

  const isUser = await User.findOne({ email, password: hashPassword });
  if (!isUser) throw "Invalid credentials provided";

  if (!isUser.verify || !isUser.verify.is_verified) {
    throw "Please verify your email address before signing in";
  }

  const tokenData = {
    id: isUser.id,
    name: isUser.first_name,
    email: isUser.email,
    role: isUser.role,
    image: isUser.image || false,
  };

  const accessToken = await jwt.sign(tokenData, process.env.SECRET);
  const first_log = isUser.first_login;

  isUser.first_login = false;
  await isUser.save();

  res.json({
    message: "Logged in successfully",
    first_log: first_log,
    data: tokenData,
    token: accessToken,
  });
};

exports.loginWithGoogle = async (req, res) => {
  let { token } = req.body;
  if (!token) throw "Token is required";

  // decode token
  const clientId = ["622915614418-hromd1et35upqosn6f47d3pmpogk8uk2.apps.googleusercontent.com"];
  const client = new OAuth2Client(clientId);
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw "Invalid token provided or token is expired";
  }

  const isUser = await User.findOne({ email: payload.email });
  if (!isUser) throw "Provided google account is not yet registered";

  if (!isUser.verify || !isUser.verify.is_verified) {
    throw "Please verify your email address before signing in";
  }

  const tokenData = {
    id: isUser.id,
    name: isUser.first_name,
    email: isUser.email,
    role: isUser.role,
    image: isUser.image || false,
  };

  const accessToken = await jwt.sign(tokenData, process.env.SECRET);
  const first_log = isUser.first_login;

  isUser.first_login = false;
  await isUser.save();

  res.json({
    message: "Logged in successfully",
    first_log: first_log,
    data: tokenData,
    token: accessToken,
  });
};

exports.deleteAdmin = async (req, res) => {
  const id = req.params.id;

  const isUser = await User.findById(id);
  if (!isUser) "User not found";
  if (isUser.role == "Admin") throw "Cannot delete admin account";
  await isUser.remove();
  res.json({ message: "Your account has been deleted successfully" });
};

exports.delete = async (req, res) => {
  const id = req.payload.id;

  const isUser = await User.findById(id);
  if (!isUser) "User not found";

  await isUser.remove();
  res.json({ message: "Your account has been deleted successfully" });
};

exports.resetPasswordInit = async (req, res) => {
  let { email } = req.body;
  if (!email) throw "Email address is required";
  email = email.toLowerCase();
  const isUser = await User.findOne({ email });
  if (!isUser) throw "Email address is not registered yet";
  const rand_code = crypto.randomBytes(20).toString("hex");
  const reset_password = { token: rand_code };
  isUser.reset_password = reset_password;
  await isUser.save();
  try {
    const info = await sendResetMail(email, rand_code);
    console.log(info);
    res.json({ message: "Reset email sent to your email address successfully" });
  } catch (err) {
    throw "Email sending error occured, try again";
  }
};

exports.changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  if (!old_password) throw "Old password is required";
  if (!new_password) throw "New password is required";
  const id = req.payload.id;

  const hashOldPassword = sha256(process.env.SALT + old_password);
  const isUser = await User.findOne({ _id: id, password: hashOldPassword });
  if (!isUser) throw "Old password didn't matched";

  const hashNewPassword = sha256(process.env.SALT + new_password);
  isUser.password = hashNewPassword;
  await isUser.save();
  res.json({ message: "Your password has been changed successfully" });
};

exports.resetPassword = async (req, res) => {
  let { email, code, password } = req.body;
  if (!email) throw "Email address is required";
  email = email.toLowerCase();
  if (!code) throw "Reset code is required";
  if (!password) throw "New password is required";
  if (code.length < 5) throw "Invalid reset code";
  if (password.length < 5) throw "Password length must be atleast 5 character";

  const isUser = await User.findOne({ email, "reset_password.token": code });
  if (!isUser) throw "Email address & reset code don't match with each other";

  const hashPassword = sha256(process.env.SALT + password);

  isUser.reset_password = "";
  isUser.password = hashPassword;

  await isUser.save();

  res.json({ message: "Your password has been reset successfully" });
};

exports.activateAccount = async (req, res) => {
  let { email, code } = req.body;
  if (!email) throw "Email address is required";
  email = email.toLowerCase();
  if (!code) throw "Reset code is required";
  if (code.length < 5) throw "Invalid reset code";

  const isUser = await User.findOne({ email, "verify.verify_code": code });
  if (!isUser) throw "Email address & verification code don't match with each other";

  isUser.verify = { is_verified: true, verify_code: "" };
  const first_log = isUser.first_login;
  isUser.first_login = false;
  await isUser.save();

  const tokenData = {
    id: isUser.id,
    name: isUser.first_name,
    email: isUser.email,
    role: isUser.role,
    image: isUser.image || false,
  };

  const accessToken = await jwt.sign(tokenData, process.env.SECRET);

  res.json({
    message: "Your account has been activated successfully",
    first_log: first_log,
    data: tokenData,
    token: accessToken,
  });
};

exports.getUserByIdForUser = async (req, res) => {
  const userId = req.params.user;
  let isUserExists = await User.findById(userId).lean(); // lean convert mongoose object to js object
  if (!isUserExists) throw "User not found";
  delete isUserExists.password; // dont send password...
  if (!isUserExists.privacy || !isUserExists.privacy.share_name) {
    isUserExists.first_name = "***";
    isUserExists.last_name = "***";
  }
  if (!isUserExists.privacy || !isUserExists.privacy.share_email) {
    isUserExists.email = "******";
  }
  if (!isUserExists.privacy || !isUserExists.privacy.share_phone) {
    isUserExists.phone_number = "******";
  }
  res.json(isUserExists);
};

exports.contactUs = async (req, res) => {
  const { email } = req.body;
  if (!email) throw "Email is required";

  try {
    await sendContactUsMail(process.env.CONTACT_EMAIL, { ...req.body }, email);
    res.json({ message: "Your request has been submitted successfully" });
  } catch (err) {
    throw "Request submission error please try again";
  }
};
