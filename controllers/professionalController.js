const mongoose = require("mongoose");
const Professional = mongoose.model("Professional");
const zipcodes = require("zipcodes");
const moment = require("moment");

exports.store = async (req, res) => {
  const user = req.payload.id;
  const { zip } = req.body;
  const decodeZip = zipcodes.lookup(zip);

  const newPro = new Professional({
    ...req.body,
    city: decodeZip.city,
    state: decodeZip.state,
    user,
    status: "Pending",
  });
  await newPro.save();
  res.json({
    message: "Profession added successfully and is awaiting review by admin",
  });
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const { zip } = req.body;
  const newPro = await Professional.findById(id);
  if (!newPro) throw "Professional not found";

  let more_field = {};
  if (zip) {
    const decodeZip = zipcodes.lookup(zip);
    more_field = { city: decodeZip.city, state: decodeZip.state };
  }

  await newPro.updateOne({
    ...req.body,
    ...more_field,
  });

  res.json({ message: "Professional updated successfully" });
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const user = req.payload.id;
  const role = req.payload.role;

  const newPro = await Professional.findById(id);
  if (!newPro) throw "Professional not found";
  if (newPro.user != user && role != "Admin") throw "You are not permitted";

  await newPro.remove();

  res.json({ message: "Professional deleted successfully" });
};

exports.read = async (req, res) => {
  const pros = await Professional.find().sort({ _id: -1 }).lean();
  if (!pros || pros.length == 0) throw "No professional found";
  const formattedPros = pros.map((item) => ({ ...item, created_at: moment(item.created_at).format("Do MMM, YYYY") }));
  res.json(formattedPros);
};

exports.readByType = async (req, res) => {
  const { type, q } = req.query;
  let search_query = { pro_type: type, status: "Active" };
  if (type == "All") search_query = { status: "Active" };
  if (q) search_query = { ...search_query, $or: [{ state: new RegExp(q, "i") }, { home_town: new RegExp(q, "i") }, { home_town: new RegExp(q, "i") }, { specialized: new RegExp(q, "i") }, { zip: new RegExp(q, "i") }, { name: new RegExp(q, "i") }, { pro_type: new RegExp(q, "i") }] };

  const pros = await Professional.find(search_query).sort({ _id: -1 }).lean();
  if (!pros || pros.length == 0) throw "No professional found in this category";
  const formattedPros = pros.map((item) => ({ ...item, created_at: moment(item.created_at).format("Do MMM, YYYY") }));
  res.json(formattedPros);
};
