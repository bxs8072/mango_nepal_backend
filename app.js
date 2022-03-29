const express = require("express");
const cors = require("cors");
const errorHandlers = require("./handlers/errorHandlers");
const useragent = require("express-useragent");
const app = express();

//File Upload Enable
app.use(express.static("./public"));
app.use(require("express-fileupload")());

//Allow JSON Data
app.use(cors());
app.use(useragent.express());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Bring in the routes!
app.use("/v1", require("./routes/apis"));
app.use("/v1/admin", require("./routes/admin"));

//Error handlers
app.use(errorHandlers.mongoseErrors);

if (process.env.MODE === "PRODUCTION") {
  app.use(errorHandlers.productionErrors);
} else {
  app.use(errorHandlers.developmentErrors);
}

module.exports = app;
