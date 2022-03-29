const mongoose = require("mongoose");
const Business = mongoose.model("Business");
const zipcodes = require("zipcodes");
const moment = require("moment");

exports.store = async (req, res) => {
  const user = req.payload.id;
  const { zip } = req.body;
  const decodeZip = zipcodes.lookup(zip);

  const newPro = new Business({
    ...req.body,
    city: decodeZip.city,
    state: decodeZip.state,
    user,
    status: "Pending",
  });
  await newPro.save();
  res.json({
    message: "Organization added successfully and is awaiting review by admin",
  });
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const { zip } = req.body;
  const newPro = await Business.findById(id);
  if (!newPro) throw "Organization not found";

  let more_field = {};
  if (zip) {
    const decodeZip = zipcodes.lookup(zip);
    more_field = { city: decodeZip.city, state: decodeZip.state };
  }

  await newPro.updateOne({
    ...req.body,
    ...more_field,
  });

  res.json({ message: "Organization updated successfully" });
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const user = req.payload.id;
  const role = req.payload.role;

  const newPro = await Business.findById(id);
  if (!newPro) throw "Organization not found";
  if (newPro.user != user && role != "Admin") throw "You are not permitted";

  await newPro.remove();

  res.json({ message: "Organization deleted successfully" });
};

exports.read = async (req, res) => {
  const pros = await Business.find().sort({ _id: -1 }).lean();

  if (!pros || pros.length == 0) throw "No organization found";
  const formattedPros = pros.map((item) => ({ ...item, created_at: moment(item.created_at).format("Do MMM, YYYY") }));
  res.json(formattedPros);
};

exports.readByType = async (req, res) => {
  const { type, q } = req.query;
  let search_query = { business_type: type, status: "Active" };
  if (type == "All") search_query = { status: "Active" };
  if (q && q.length > 0) search_query = { status: "Active", $or: [{ name: new RegExp(q, "i") }, { description: new RegExp(q, "i") }, { state: new RegExp(q, "i") }] };
  const pros = await Business.find(search_query).sort({ _id: -1 }).lean();
  if (!pros || pros.length == 0) throw "No organization found in this category";
  const formattedPros = pros.map((item) => ({ ...item, created_at: moment(item.created_at).format("Do MMM, YYYY") }));
  res.json(formattedPros);
};
