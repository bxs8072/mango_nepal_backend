const mongoose = require("mongoose");
const KeyValue = mongoose.model("KeyValue");

exports.read = async (req, res) => {
  const { key } = req.query;
  if (!key) throw "Key is required";

  const isThere = await KeyValue.findOne({ key }, "key value").lean();
  if (!isThere) throw "Key is not found";

  res.json(isThere);
};

exports.store = async (req, res) => {
  const { key, value } = req.body;
  if (!key) throw "Key is required";
  if (!value) throw "Value is required";

  const isThere = await KeyValue.findOne({ key });
  if (isThere) {
    isThere.value = value;
    await isThere.save();
  } else {
    const newData = new KeyValue({ key, value });
    await newData.save();
  }

  res.json({ message: "Key updated successfully" });
};
