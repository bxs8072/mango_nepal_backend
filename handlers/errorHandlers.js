/*
  Catch Errors Handler
*/

exports.catchErrors = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => {
      //Validation Errors
      if (
        typeof err === "string"
        // (typeof err === "object" && Object.keys(err).length > 0)
      ) {
        console.log("Error populated", err);
        res.status(401).json({
          message: err,
        });
      } else {
        next(err);
      }
    });
  };
};

/*
  MongoDB Validation Error Handler

  Detect if there are mongodb validation errors that we send them nicely back.
*/

exports.mongoseErrors = (err, req, res, next) => {
  // console.log(err.errors);
  if (!err.errors) return next(err);
  const errorKeys = Object.keys(err.errors);
  let message = "";
  errorKeys.forEach((key) => (message += err.errors[key].message + "\n"));

  message = message.substr(0, message.length - 2);

  if (process.env.MODE === "PRODUCTION") {
    message = "Internal Server Error";
  }

  res.status(500).json({
    message,
  });
};

/*
  Development Error Handler

  In development we show good error messages so if we hit a syntax error or any other previously un-handled error, we can show good info on what happened
*/
exports.developmentErrors = (err, req, res, next) => {
  err.stack = err.stack || "";
  const errorDetails = {
    message: err.message,
    status: err.status,
    stack: err.stack,
  };

  res.status(err.status || 500).json(errorDetails);
};

/*
  Production Error Handler

  No stacktraces and error details are leaked to user
*/
exports.productionErrors = (err, req, res, next) => {
  res.status(err.status || 500).json({
    error: "Internal Server Error",
  }); // send JSON back
};
