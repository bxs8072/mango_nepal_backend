const mongoose = require("mongoose");
const Testimonial = mongoose.model("Testimonial");
const KeyValue = mongoose.model("KeyValue");
const moment = require("moment");

exports.store = async (req, res) => {
  const newPro = new Testimonial({
    ...req.body,
    status: "Active",
  });
  await newPro.save();
  res.json({
    message: "Testimonial added successfully",
  });
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const newPro = await Testimonial.findById(id);
  if (!newPro) throw "Testimonial not found";
  await newPro.updateOne({
    ...req.body,
  });

  res.json({ message: "Testimonial updated successfully" });
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const newPro = await Testimonial.findById(id);
  if (!newPro) throw "Testimonial not found";
  await newPro.remove();
  res.json({ message: "Testimonial deleted successfully" });
};

exports.read = async (req, res) => {
  const findList = await Testimonial.find({}, "name work_as image status description side created_at").lean();
  if (!findList || findList.length === 0) throw "Testimonials not found";

  const key_val = await KeyValue.findOne({ key: "Testimonial" }, "value").lean();
  const key_valR = await KeyValue.findOne({ key: "TestimonialR" }, "value").lean();

  const formatted = findList.map((item) => ({ ...item, created_at: moment(item.created_at).format("Do MMM, YYYY") }));
  res.json({
    title: key_val ? key_val.value : "What Client Say",
    titleR: key_valR ? key_valR.value : "Announcement",
    data: formatted,
  });
};
