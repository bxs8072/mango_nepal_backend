const mongoose = require("mongoose");
const User = mongoose.model("User");
const zipcodes = require("zipcodes");
exports.storeEducation = async (req, res) => {
  const id = req.payload.id;

  const { home_town, mentoring_in, need_mentoring_in, university, level, major, concentrations, graduated, graduation_year, need_mentoring, become_mentor } = req.body;

  const education = {
    university,
    level,
    mentoring_in,
    need_mentoring_in,
    major,
    concentrations,
    graduated,
    graduation_year,
    need_mentoring,
    become_mentor,
  };

  const userExists = await User.findById(id);
  if (!userExists) throw "User not found";

  userExists.education = education;
  userExists.home_town = home_town;
  await userExists.save();

  res.json({
    message: "User details updated successfully",
  });
};

exports.readMyInfo = async (req, res) => {
  const userId = req.payload.id;
  let isUserExists = await User.findById(userId).lean();
  if (!isUserExists) throw "User not found";
  delete isUserExists.password; // dont send password...
  res.json(isUserExists);
};

exports.updateByAdmin = async (req, res) => {
  const id = req.params.id;
  let isUserExists = await User.findById(id);
  if (!isUserExists) throw "User not found";
  const { age_range, phone_number, home_town, location, education, privacy, image, short_bio } = req.body;
  if (age_range) isUserExists.age_range = age_range;
  if (image) isUserExists.image = image;
  if (short_bio) isUserExists.short_bio = short_bio;
  if (phone_number) isUserExists.phone_number = phone_number;
  if (home_town) isUserExists.home_town = home_town;
  if (location) {
    const loc = {
      zip: location.zip,
      city: "",
      state: "",
    };
    const decodeZip = zipcodes.lookup(location.zip);
    if (decodeZip) {
      loc.city = decodeZip.city;
      loc.state = decodeZip.state;
    }
    isUserExists.location = loc;
  }
  if (education) isUserExists.education = { ...isUserExists.education, ...education };
  if (privacy) isUserExists.privacy = { ...isUserExists.privacy, ...privacy };

  await isUserExists.save();
  res.json({
    message: "User details updated successfully",
  });
};

exports.update = async (req, res) => {
  const id = req.payload.id;
  let isUserExists = await User.findById(id);
  if (!isUserExists) throw "User not found";
  const { age_range, phone_number, home_town, location, education, privacy, image, short_bio } = req.body;
  if (age_range) isUserExists.age_range = age_range;
  if (image) isUserExists.image = image;
  if (short_bio) isUserExists.short_bio = short_bio;
  if (phone_number) isUserExists.phone_number = phone_number;
  if (home_town) isUserExists.home_town = home_town;
  if (location) {
    const loc = {
      zip: location.zip,
      city: "",
      state: "",
    };
    const decodeZip = zipcodes.lookup(location.zip);
    if (decodeZip) {
      loc.city = decodeZip.city;
      loc.state = decodeZip.state;
    }
    isUserExists.location = loc;
  }
  if (education) isUserExists.education = { ...isUserExists.education, ...education };
  if (privacy) isUserExists.privacy = { ...isUserExists.privacy, ...privacy };

  await isUserExists.save();
  res.json({
    message: "User details updated successfully",
  });
};

exports.read = async (req, res) => {
  // name, major, degree, university, graduated, year, mentor, email
  let { q, level, page, per_page } = req.query;
  if (!page) page = 0;
  else page = Math.ceil(page) - 1;
  if (!per_page) per_page = 1;
  else per_page = Math.ceil(per_page);

  if (!level) level = "All";

  let search_params = { role: { $not: /Admin/ }, "education.university": { $ne: null } };
  if (level != "All") {
    search_params = { ...search_params, "education.level": level };
  }
  if (q) {
    search_params = { ...search_params, $or: [{ first_name: new RegExp(q, "i") }, { last_name: new RegExp(q, "i") }, { "education.level": new RegExp(q, "i") }, { "education.major": new RegExp(q, "i") }, { "education.university": new RegExp(q, "i") }] };
  }

  const totalCount = await User.countDocuments(search_params);

  const users = await User.find(search_params, "first_name image last_name email education.university education.level education.major education.graduated education.graduation_year education.become_mentor home_town phone_number privacy")
    .skip(page * per_page)
    .limit(per_page)
    .lean();

  if (!users || users.length === 0) throw "No user found in this category";

  const formattedUsers = users.map((item) => {
    let newItem = { ...item, name: "******", first_name: "", last_name: "" };
    if (item.first_name) newItem.name = item.first_name + " " + item.last_name;

    if (!item.privacy || !item.privacy.share_name) {
      newItem.name = "******";
    }
    if (!item.privacy || !item.privacy.share_email) {
      newItem.email = "******";
    }
    if (!item.privacy || !item.privacy.share_phone) {
      newItem.phone_number = "";
    }

    return newItem;
  });

  res.json({
    total: totalCount,
    page: page + 1,
    per_page: per_page,
    total_page: Math.ceil(totalCount / per_page),
    education: formattedUsers,
  });
};

exports.readMentor = async (req, res) => {
  let { q, page, per_page } = req.query;
  if (!page) page = 0;
  else page = Math.ceil(page) - 1;
  if (!per_page) per_page = 1;
  else per_page = Math.ceil(per_page);

  let search_params = { role: { $not: /Admin/ }, "education.become_mentor": true };
  if (q) {
    search_params = { ...search_params, $or: [{ first_name: new RegExp(q, "i") }, { last_name: new RegExp(q, "i") }, { "education.level": new RegExp(q, "i") }, { "education.mentoring_in": new RegExp(q, "i") }] };
  }

  const totalCount = await User.countDocuments(search_params);

  const users = await User.find(search_params, "first_name image last_name email education.become_mentor education.mentoring_in phone_number privacy")
    .skip(page * per_page)
    .limit(per_page)
    .lean();

  if (!users || users.length === 0) throw "No mentors found";

  const formattedUsers = users.map((item) => {
    let newItem = { ...item, name: "******", first_name: "", last_name: "" };
    if (item.first_name) newItem.name = item.first_name + " " + item.last_name;

    if (!item.privacy || !item.privacy.share_name) {
      newItem.name = "******";
    }
    if (!item.privacy || !item.privacy.share_email) {
      newItem.email = "******";
    }
    if (!item.privacy || !item.privacy.share_phone) {
      newItem.phone_number = "";
    }

    return newItem;
  });

  res.json({
    total: totalCount,
    page: page + 1,
    per_page: per_page,
    total_page: Math.ceil(totalCount / per_page),
    data: formattedUsers,
  });
};

exports.readMentee = async (req, res) => {
  let { q, page, per_page } = req.query;
  if (!page) page = 0;
  else page = Math.ceil(page) - 1;
  if (!per_page) per_page = 1;
  else per_page = Math.ceil(per_page);

  let search_params = { role: { $not: /Admin/ }, "education.need_mentoring": true };
  if (q) {
    search_params = { ...search_params, $or: [{ first_name: new RegExp(q, "i") }, { last_name: new RegExp(q, "i") }, { "education.level": new RegExp(q, "i") }, { "education.need_mentoring_in": new RegExp(q, "i") }] };
  }

  const totalCount = await User.countDocuments(search_params);

  const users = await User.find(search_params, "first_name image last_name email education.need_mentoring education.need_mentoring_in phone_number privacy")
    .skip(page * per_page)
    .limit(per_page)
    .lean();

  if (!users || users.length === 0) throw "No mentee found";

  const formattedUsers = users.map((item) => {
    let newItem = { ...item, name: "******", first_name: "", last_name: "" };
    if (item.first_name) newItem.name = item.first_name + " " + item.last_name;

    if (!item.privacy || !item.privacy.share_name) {
      newItem.name = "******";
    }
    if (!item.privacy || !item.privacy.share_email) {
      newItem.email = "******";
    }
    if (!item.privacy || !item.privacy.share_phone) {
      newItem.phone_number = "";
    }

    return newItem;
  });

  res.json({
    total: totalCount,
    page: page + 1,
    per_page: per_page,
    total_page: Math.ceil(totalCount / per_page),
    data: formattedUsers,
  });
};
