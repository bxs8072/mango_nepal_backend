// this controller handles api logic of universities & majors listing
const mongoose = require("mongoose");
const Resource = mongoose.model("Resource");
const zipcodes = require("zipcodes");
const moment = require("moment");

const universityNames = require("../utils/UniversityNames");
const majorNames = require("../utils/MajorListing");

exports.readUniversity = async (req, res) => {
  res.json(universityNames);
};

exports.readMajor = async (req, res) => {
  res.json(majorNames);
};

//=============================================================

exports.store = async (req, res) => {
  const user = req.payload.id;

  const newPro = new Resource({
    ...req.body,
    user,
    status: "Pending",
  });

  await newPro.save();
  res.json({
    message: "Resource added successfully and is awaiting review by admin",
  });
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const newPro = await Resource.findById(id);
  if (!newPro) throw "Resource not found";
  await newPro.updateOne({
    ...req.body,
  });

  res.json({ message: "Resource updated successfully" });
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const user = req.payload.id;
  const role = req.payload.role;

  const newPro = await Resource.findById(id);
  if (!newPro) throw "Resource not found";
  if (newPro.user != user && role != "Admin") throw "You are not permitted";

  await newPro.remove();

  res.json({ message: "Resource deleted successfully" });
};

exports.read = async (req, res) => {
  let search_filter = { status: "Active" };
  let { q } = req.query;
  const role = (req.payload && req.payload.role) || "";
  if (role == "Admin") search_filter = {};

  let pros;
  let pros2;
  if (!q || q.length == 0) {
    pros = await Resource.find({ ...search_filter, pinned: true })
      .sort({ _id: -1 })
      .lean();
    pros2 = await Resource.find({ ...search_filter, pinned: false })
      .sort({ _id: -1 })
      .lean();
  } else {
    pros = await Resource.find({ ...search_filter, pinned: true, $or: [{ title: new RegExp(q, "i") }, { link: new RegExp(q, "i") }] })
      .sort({ _id: -1 })
      .lean();
    pros2 = await Resource.find({ ...search_filter, pinned: false, $or: [{ title: new RegExp(q, "i") }, { link: new RegExp(q, "i") }] })
      .sort({ _id: -1 })
      .lean();
  }

  if ((!pros || pros.length == 0) && (!pros2 || pros2.length == 0)) throw "No resource found";
  const formattedPros = pros.map((item) => ({ ...item, created_at: moment(item.created_at).format("Do MMM, YYYY") }));
  const formattedPros2 = pros2.map((item) => ({ ...item, created_at: moment(item.created_at).format("Do MMM, YYYY") }));
  res.json([...formattedPros, ...formattedPros2]);
};
