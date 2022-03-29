const path = require("path");
const mongoose = require("mongoose");
const File = mongoose.model("File");

const moveFile = (file, dir) => {
  return new Promise((resolve, reject) => {
    file.mv(dir, function (err) {
      if (err) {
        reject("Couldn't move file.");
      } else {
        resolve();
      }
    });
  });
};

exports.store = async (req, res) => {
  const user = req.payload.id;
  const file_for = req.body.file_for || "";
  if (!req.files) throw "File wasn't supplied.";

  const file = req.files.file;
  const fileName = file.name;
  const size = file.data.length;
  const extension = path.extname(fileName);
  const allowedExtensions = /png|jpg|gif|jpeg/;

  // Md5 ensure same file cannot be uploaded twice and if uploaded it don't store that file twice in storage
  // just reference previous file
  const md5 = file.md5;
  let URL;

  const validExtension = allowedExtensions.test(extension.toLowerCase());

  if (!validExtension) throw "Only image file is allowed!";
  if (size > 10000000) throw "File size must be less than 10 MB";

  URL = "/uploads/" + md5 + extension;
  await moveFile(file, "./public" + URL);

  const newFile = new File({
    url: URL,
    file_name: fileName,
    size: size,
    file_for,
    user,
  });

  await newFile.save();

  res.json({
    message: "File uploaded successfully",
    id: newFile.id,
    url: process.env.APPURL + URL,
  });
};
