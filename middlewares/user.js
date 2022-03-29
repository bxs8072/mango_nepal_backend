const jwt = require("jwt-then");

module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) throw "No authorization";
    let token = req.headers.authorization.split(" ")[1];
    token = token.trim();
    const payload = await jwt.verify(token, process.env.SECRET);
    req.user_id_from_middleware = payload.id;
    next();
  } catch (err) {
    next();
  }
};
