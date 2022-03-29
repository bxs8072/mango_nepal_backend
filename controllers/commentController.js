const mongoose = require("mongoose");
const Blog = mongoose.model("Blog");
const Comment = mongoose.model("Comment");
const moment = require("moment");

exports.store = async (req, res) => {
  const { comment } = req.body;
  const { slug } = req.params;
  const user = req.payload.id;

  if (!comment) throw "Comment is required";

  const blogExists = await Blog.findOne({ slug });
  if (!blogExists || blogExists.status != "Active") throw "Blog not found";

  // TODO: filter bad words
  const newComment = new Comment({
    comment,
    blog: blogExists.id,
    user,
  });

  await newComment.save();

  res.json({ message: "Comment added successfully", data: newComment });
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const user = req.payload.id;
  const role = req.payload.role;

  const comment = await Comment.findById(id);
  if (!comment) throw "Comment not found";
  if (role != "Admin" && comment.user != user) throw "You are not permitted for this action";
  await comment.deleteOne();

  res.json({ message: "Comment deleted successfully" });
};

exports.read = async (req, res) => {
  const { slug } = req.params;
  const user = req.user_id_from_middleware || false;

  const blogExists = await Blog.findOne({ slug });
  if (!blogExists) throw "Blog not found";

  const findComments = await Comment.find({ blog: blogExists.id, status: "Active" }, "comment user created_at").sort({ _id: -1 }).populate("user", "first_name last_name image").lean();

  if (!findComments || findComments.length === 0) throw "No comments found";

  const modifiedComment = findComments.map((item) => {
    let is_my_comment = false;
    if (item.user && item.user._id == user) is_my_comment = true;
    return {
      ...item,
      created_at: moment(item.created_at).format("Do MMM, YYYY"),
      is_my_comment,
    };
  });

  res.json(modifiedComment);
};

exports.updateStatus = async (req, res) => {
  // this method is for admin to update status of comment
  // status value is Active, Pending, Removed
  const { comment } = req.params;
  const { status } = req.body;
  const findComments = await Comment.findById(comment);
  if (!findComments || findComments.length === 0) throw "No comments found";
  if (status) findComments.status = status;
  await findComments.save();
  res.json({
    message: "Comment status updated successfully",
    data: findComments,
  });
};

// exports.readAdmin = async (req, res) => {
//   const { slug } = req.params;

//   const blogExists = await Blog.findOne({ slug });
//   if (!blogExists) throw "Blog not found";

//   const findComments = await Comment.find({ blog: blogExists.id }, "comment user created_at").populate("user", "first_name last_name image");

//   if (!findComments || findComments.length === 0) throw "No comments found";

//   res.json(findComments);
// };
