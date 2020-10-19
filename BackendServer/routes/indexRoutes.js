const userCtrl1 = require("../controllers/testCall.js");
//const callWrite = require("../controllers/writeJSONtoInfluxDB.js");
//const checkDB = require("../controllers/checkInfluxDBConn.js");
//const dcDB = require("../controllers/dropAndCreateDB.js");
const influx = require("../controllers/influxDBConn.js");
const apis = require("../controllers/ApiSettings.js");

module.exports = (app, router) => {
  router.get("/testCall", userCtrl1.testCall);

  //influx db connections
  router.post("/dropAndCreateDB", influx.dcDB);
  router.post("/createProject", influx.createProject);
  router.post("/writeJSONtoInfluxDB", influx.writeJSON);
  router.get("/checkInfluxDBConn", influx.check);
  router.get("/getCustomers", influx.getCustomers);
  router.get("/getInfo", influx.getInfo);
  router.post("/ull", influx.updateDBll);
  router.get("/getAllData", influx.getAllData);
  // router.get("/getMergeData", influx.getMergeData);

  router.get("/getApiSettings", apis.getApiSettings);
  router.post("/writeApiSettings", apis.writeApiSettings);

  app.use("/api", router);
};
