const express = require("express");
const path = require("path");
const index = require("./config/index");
const mongoose = require("mongoose");
const cors = require("cors");
const Influx = require("influx");
const log = require("morgan");
const logger = require("./middlewares/logger");
var bodyParser = require('body-parser');
const router = express.Router();
const app = express();
let response = {};

// dont needed because of every site
/* MongoDB Connection */
/*
mongoose
  .connect(index.config.dev.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    response = index.globalCode.success;
    response.msg = "Successfully connected to the MongoDB database";
    logger.info(response);
  })
  .catch(err => {
    response = index.globalCode.error;
    response.msg = "Error:" + err;
    logger.error(response);
    process.exit();
  });
*/
/* InfluxDB Connection */
/*
const influx = new Influx.InfluxDB({
  host: index.config.dev.influxhost,
  database: index.config.dev.influxDB
});

influx
  .getDatabaseNames()
  .then(names => {
    if (!names.includes(index.config.dev.influxDB)) {
      return influx.createDatabase(index.config.dev.influxDB);
    }
  })
  .then(() => {
    response = index.globalCode.success;
    response.msg = "Successfully connected to the Influx database";
    logger.info(response);
  })
  .catch(err => {
    response = index.globalCode.error;
    response.msg = "Error:" + err;
    logger.error(response);
    process.exit();
  });

  */
// view engine setup
/* app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
 */


//start informations
console.log("AWT - node.js Server is starting ...")

/* Middlewares */
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(log("dev"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.json({limit: "350mb"}));
app.use(bodyParser.urlencoded({
  limit: "350mb",
  extended: true,
  parameterLimit:50000000
}));

app.use(bodyParser.raw());

/* Routes */
require("./routes/indexRoutes")(app, router);

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  logger.info(`Connected with the port ${PORT}`);
});
