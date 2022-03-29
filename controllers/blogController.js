const mongoose = require("mongoose");
const Blog = mongoose.model("Blog");
const Like = mongoose.model("Like");
const cleanHtml = require("../utils/cleanHtml");
const ErrorResponser = require("../utils/errResponsor");
const slugify = require("slugify");
const moment = require("moment");
const KeyValue = mongoose.model("KeyValue");
const Testimonial = mongoose.model("Testimonial");

const defaultPhotoPath = "/default_cover.jpg";

exports.store = async (req, res) => {
  const user = req.payload.id;
  const role = req.payload.role;

  let status = "Pending";
  if (role == "Admin") status = "Active";

  const errResponser = new ErrorResponser();
  let { title, body } = req.body;
  if (!title) errResponser.add("title", "Title is required");
  if (!body) errResponser.add("body", "Body is required");

  if (errResponser.hasError) throw errResponser.errString();

  const cleanBody = cleanHtml(body);
  const slug = slugify(title, { lower: true });

  const isSlugExist = await Blog.findOne({ slug });
  if (isSlugExist) throw "Blog title already exists";

  const newBlog = new Blog({
    ...req.body,
    body: cleanBody,
    slug,
    user,
    status,
  });

  await newBlog.save();

  res.json({ message: "Blog added successfully", data: newBlog });
};

exports.read = async (req, res) => {
  let blogs = await Blog.find({}, "title cover_photo status user created_at pinned slug like_count").sort({ _id: -1 }).populate("user", "first_name last_name").populate("cover_photo", "url").lean();

  blogs = blogs.map((item) => ({
    ...item,
    created_at: moment(item.created_at).format("Do MMM, YYYY"),
    cover_photo: item.cover_photo ? process.env.APPURL + item.cover_photo.url : defaultPhotoPath,
  }));

  if (!blogs || blogs.length === 0) throw "No blog found";
  res.json({ total: blogs.length, data: blogs });
};

exports.readBySlug = async (req, res) => {
  const slug = req.params.slug;
  const user = req.user_id_from_middleware || false;

  let blog = await Blog.findOne({ slug }, "title cover_photo user status created_at body like_count").populate("user", "first_name role last_name").populate("cover_photo", "url").lean();

  if (!blog) throw "No blog found";
  blog.cover_photo = blog.cover_photo ? process.env.APPURL + blog.cover_photo.url : defaultPhotoPath;
  blog.created_at = moment(blog.created_at).format("Do MMM, YYYY");

  let moreBlogs = await Blog.find({ status: "Active", _id: { $ne: blog._id } }, "title cover_photo user slug status created_at like_count")
    .sort({ like_count: -1 })
    .limit(10)
    .populate("user", "first_name last_name")
    .populate("cover_photo", "url")
    .lean();

  moreBlogs = moreBlogs.map((item) => ({
    ...item,
    created_at: moment(item.created_at).format("Do MMM, YYYY"),
    cover_photo: item.cover_photo ? process.env.APPURL + item.cover_photo.url : defaultPhotoPath,
  }));

  res.json({ ...blog, more: moreBlogs });
};

exports.update = async (req, res) => {
  const bId = req.params.id;

  const isBlogExist = await Blog.findById(bId);
  if (!isBlogExist) throw "Blog not found";

  await isBlogExist.updateOne({
    ...req.body,
    slug: isBlogExist.slug,
    like_count: isBlogExist.like_count,
  });

  res.json({ message: "Blog updated successfully" });
};

exports.updateMyBlog = async (req, res) => {
  const bId = req.params.id;
  const user = req.payload.id;

  const isBlogExist = await Blog.findById(bId);
  if (!isBlogExist) throw "Blog not found";
  if (isBlogExist.user != user) throw "You are not allowed to perform this action";

  await isBlogExist.updateOne({
    ...req.body,
    // title: isBlogExist.title,
    slug: isBlogExist.slug,
    like_count: isBlogExist.like_count,
  });

  res.json({ message: "Blog updated successfully" });
};

exports.readMyBlogs = async (req, res) => {
  const id = req.payload.id;
  let blogs = await Blog.find({ user: id }, "title cover_photo status user created_at slug like_count").sort({ _id: -1 }).populate("user", "first_name last_name").populate("cover_photo", "url").lean();

  blogs = blogs.map((item) => ({
    ...item,
    created_at: moment(item.created_at).format("Do MMM, YYYY"),
    cover_photo: item.cover_photo ? process.env.APPURL + item.cover_photo.url : defaultPhotoPath,
  }));

  if (!blogs || blogs.length === 0) throw "No blog found";
  res.json({ total: blogs.length, data: blogs });
};

exports.readById = async (req, res) => {
  const id = req.params.id;

  let blog = await Blog.findById(id, "title cover_photo user status created_at body like_count").populate("user", "first_name last_name").populate("cover_photo", "url").lean();

  if (!blog) throw "No blog found";
  if (blog.cover_photo) {
    blog.cover_photo = {
      id: blog.cover_photo._id,
      url: process.env.APPURL + blog.cover_photo.url,
    };
  } else {
    blog.cover_photo = {
      id: false,
      url: defaultPhotoPath,
    };
  }
  res.json(blog);
};

exports.doLike = async (req, res) => {
  const slug = req.params.slug;
  const user = req.payload.id;

  const isBlogExist = await Blog.findOne({ slug }, "like_count");
  if (!isBlogExist) throw "Blog not found";

  const hasLiked = await Like.findOne({ blog: isBlogExist._id, user });
  if (hasLiked) throw "Already liked this blog";

  const newLike = new Like({ user, blog: isBlogExist._id });
  await newLike.save();
  const like_count = isBlogExist.like_count;
  isBlogExist.like_count = like_count + 1;
  await isBlogExist.save();

  res.json({ message: "Like done successfully" });
};

exports.pinBlog = async (req, res) => {
  const bId = req.params.id;
  const isBlogExist = await Blog.findById(bId);
  if (!isBlogExist) throw "Blog not found";

  const getPinned = await Blog.findOne({ pinned: true });
  if (getPinned) {
    getPinned.pinned = false;
    await getPinned.save();
  }

  isBlogExist.pinned = true;
  await isBlogExist.save();
  res.json({ message: "Blog pinned successfully" });
};

exports.getHome = async (req, res) => {
  const fields = "title cover_photo user slug status created_at like_count";
  let pinnedBlog = await Blog.findOne({ pinned: true, status: "Active" }, fields).populate("user", "first_name last_name").populate("cover_photo", "url").lean();

  if (pinnedBlog) {
    pinnedBlog.cover_photo = pinnedBlog.cover_photo ? process.env.APPURL + pinnedBlog.cover_photo.url : defaultPhotoPath;
    pinnedBlog.created_at = moment(pinnedBlog.created_at).format("Do MMM, YYYY");
  }

  let trendingBlog = await Blog.find({ status: "Active" }, fields).sort({ like_count: -1 }).limit(4).populate("user", "first_name last_name").populate("cover_photo", "url").lean();
  let latestBlog = await Blog.find({ status: "Active" }, fields).sort({ _id: -1 }).limit(2).populate("user", "first_name last_name").populate("cover_photo", "url").lean();

  const key_val = await KeyValue.findOne({ key: "Testimonial" }, "value").lean();
  const key_valR = await KeyValue.findOne({ key: "TestimonialR" }, "value").lean();
  const testimonials = await Testimonial.find({ status: "Active" }, "name side image work_as description").lean();

  const testiL = testimonials.filter((item) => item.side != "Right");
  const testiR = testimonials.filter((item) => item.side == "Right");

  trendingBlog = trendingBlog.map((item) => ({
    ...item,
    created_at: moment(item.created_at).format("Do MMM, YYYY"),
    cover_photo: item.cover_photo ? process.env.APPURL + item.cover_photo.url : defaultPhotoPath,
  }));

  latestBlog = latestBlog.map((item) => ({
    ...item,
    created_at: moment(item.created_at).format("Do MMM, YYYY"),
    cover_photo: item.cover_photo ? process.env.APPURL + item.cover_photo.url : defaultPhotoPath,
  }));

  res.json({
    pinned_blog: pinnedBlog,
    trending_blog: trendingBlog,
    latest_blog: latestBlog,
    testimonial: {
      titleL: key_val ? key_val.value : "What Client Say",
      titleR: key_valR ? key_valR.value : "Announcement",
      dataL: testiL,
      dataR: testiR,
    },
  });
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const blg = await Blog.findById(id);
  if (!blg) throw "No blog found";
  await blg.remove();
  res.json({ message: "Blog removed successfully" });
};

exports.deleteMyBlog = async (req, res) => {
  const id = req.params.id;
  const user = req.payload.id;
  const blg = await Blog.findById(id);
  if (!blg) throw "No blog found";
  if (blg.user != user) throw "You are not allowed to perform this action";
  await blg.remove();
  res.json({ message: "Blog removed successfully" });
};

exports.readForUser = async (req, res) => {
  let { page, per_page, q } = req.query;
  if (!page) page = 0;
  else page = Math.ceil(page) - 1;
  if (!per_page) per_page = 20;
  else per_page = Math.ceil(per_page);

  let search_query = { status: "Active" };
  if (q && q.length > 0) search_query = { status: "Active", title: new RegExp(q, "i") };

  const blogCount = await Blog.countDocuments(search_query);

  let blogs = await Blog.find(search_query, "title cover_photo status user created_at pinned slug like_count")
    .sort({ _id: -1 })
    .skip(page * per_page)
    .limit(per_page)
    .populate("user", "first_name last_name")
    .populate("cover_photo", "url")
    .lean();

  blogs = blogs.map((item) => ({
    ...item,
    created_at: moment(item.created_at).format("Do MMM, YYYY"),
    cover_photo: item.cover_photo ? process.env.APPURL + item.cover_photo.url : defaultPhotoPath,
  }));

  if (!blogs || blogs.length === 0) throw "No blog found";
  res.json({
    total: blogCount,
    page: page + 1,
    per_page: per_page,
    total_page: Math.ceil(blogCount / per_page),
    blogs: blogs,
  });
};
