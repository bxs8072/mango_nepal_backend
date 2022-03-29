const jwt = require("jwt-then");

module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) throw "No authorization";
    let token = req.headers.authorization.split(" ")[1];
    token = token.trim();
    const payload = await jwt.verify(token, process.env.SECRET);
    if (payload.role != "Admin") throw "Forbidden";
    req.payload = payload;
    next();
  } catch (err) {
    res.status(403).json({
      error: true,
      message: "Forbidden",
    });
  }
};
