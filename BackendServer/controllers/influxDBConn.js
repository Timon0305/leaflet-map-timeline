//Connection from the Backend to InfluxDB
console.log("################################");
console.log("### Open InfluxDB Connection ###");
console.log("################################");

//Influx DB Connection
const Influx = require("influx");
const influx = new Influx.InfluxDB("http://localhost:8086"); //at this thime without security

const influxCustomer = new Influx.InfluxDB(
  "http://localhost:8086/customerData"
); //use the right database
const influxMeta = new Influx.InfluxDB("http://localhost:8086/metaData");
const influxBoiler = new Influx.InfluxDB(
  "http://localhost:8086/boilerhouseData"
);

//count on how many databases
var datapointsInHistoryDB = 0;
var dpLoaded = false;
var dpRunning = false;

function refreshDatapointCount() {
  dpRunning = true;
  /*
  influxCustomer
    .query(
      `SELECT SUM(count) FROM (SELECT *,count::INTEGER FROM historyData GROUP BY count FILL(1))`
    )
    .catch((err) => {
      console.log(err);
      dpRunning = false;
      dpLoaded = false;
    })
    .then((results) => {
      //console.log(results);
      datapointsInHistoryDB = results[0].sum;
      console.log("HistoryDB measurements: " + datapointsInHistoryDB);
      dpLoaded = true;
      dpRunning = false;
    });
    */
  dpLoaded = true;
  dpRunning = false;
}


//on startup refresh once the datapoint count
if (dpLoaded === false) {
  refreshDatapointCount();
}

//Functions that get called from the api

//Get the loaded Project Information (if something is there)
exports.getInfo = (req, res) => {
  let info = {
    pn: "",
    howManyCu: 0,
    dataI: 0,
  };

  //get the projectname and customers
  influxMeta
    .query(`SELECT LAST("projectname") FROM "project"`)
    .catch((err) => {
      console.log(err);
    })
    .then((results) => {
      //console.log(results);
      info.pn = results[0].last;
      //get all customers
      influxMeta
        .query(`SELECT * FROM "customer"`)
        .catch((err) => {
          console.log(err);
        })
        .then((results) => {
          //console.log(results);
          info.howManyCu = results.length;
          //get infos on datapoints in database

          if (dpLoaded === true) {
            info.dataI = datapointsInHistoryDB;
          } else {
            if (dpRunning === false) {
              refreshDatapointCount();
            }

            //while (dpLoaded === false && dpRunning === true) {
            //wait that this query is finished // i know not nice but working
            //}
            info.dataI = datapointsInHistoryDB;
          }

          res.json(info);
        });
    });
};

//Get all data from the customers and boilerhouse
exports.getAllData = (req, res) => {
  console.log("hIEEEEEEEEEEEEEERR")
  let response = {
    customer: "",
    boiler: ""
  };

  //get the projectname and customers
  influxCustomer
    .query(`SELECT * FROM "historyData"`)
    .catch((err) => {
      console.log(err);
    })
    .then((results) => {
      //console.log(results);
      response.customer = results;
      //get all customers
      influxBoiler
        .query(`SELECT * FROM "boilerhouseHistoryData"`)
        .catch((err) => {
          console.log(err);
        })
        .then((results) => {
          //console.log(results);
          response.boiler = results;
          res.json('boilder response',response); //answer to the browser
        });
    });
};

//Check if database connection is here and running  /////////////////////NEED TO BE WRITTEN NEW HEAD COMMENT
exports.getCustomers = (req, res) => {
  var data = { pn: "", cd: "", bd: "" };
  //get the projectname and customers
  influxMeta
    .query(`SELECT LAST("projectname") FROM "project"`)
    .catch((err) => {
      console.log(err);
    })
    .then((results) => {
      //console.log(results);
      data.pn = results;
      //get all customers
      influxMeta
        .query(`SELECT * FROM "customer"`)
        .catch((err) => {
          console.log(err);
        })
        .then((results) => {
          //console.log(results);
          data.cd = results;
          influxMeta
            .query(`SELECT * FROM "boilerhouse"`)
            .catch((err) => {
              console.log(err);
            })
            .then((results) => {
              //console.log(results);
              data.bd = results;
              res.json(data);
            });
        });
    });
};

//Check if database connection is here and running
exports.check = (req, res) => {
  let status = {
    status: "NOT",
    server: "",
    responseTime: "",
    version: "",
    versionAWT: "0.1.16",
  };

  influx.ping(5000).then((hosts) => {
    hosts.forEach((host) => {
      if (host.online) {
        console.log(
          `Still alive --> ${host.url.host} responded in ${host.rtt}ms running ${host.version}`
        );
        status.status = "OK";
        status.server = `${host.url.host}`;
        status.responseTime = `${host.rtt}`;
        status.version = `${host.version}`;
      } else {
        console.log(`${host.url.host} is offline :(`);
        status.server = `${host.url.host}`;
      }
      res.json(status);
    });
  });
};

//create at new import (and delete)
exports.dcDB = (req, res) => {
  //console.log(req.body);
  console.log("--> Start drop and create DB in InfluxDB");
  var data = req.body;

  //check if database is already there
  influx
    .getDatabaseNames()
    .then((names) => {
      //console.log(names); //displays the databases wich are there
      if (!names.includes("customerData")) {
        console.log("--> Create Databases");
        influx.createDatabase("customerData");
        influx.createDatabase("metaData");
        influx.createDatabase("boilerhouseData");
        //return influx.createDatabase('metaData');
      } else {
        console.log("--> Delete Databases/Measurements");

        influxMeta.dropMeasurement("customer");
        influxMeta.dropMeasurement("project");
        influxMeta.dropMeasurement("boilerhouse");
        influxCustomer.dropMeasurement("historyData");
        influxBoiler.dropMeasurement("boilerhouseHistoryData");
        //console.log("löschen fertig");
      }
    })
    .then(() => {
      console.log("--> New Project: " + req.body.project.name);
      console.log("--> Database create and drop finished");
    })
    .catch((error) => console.log({ error }));

  //when Finished send statuscode ok
  res.sendStatus(200);
};

//create at new import (and delete)
exports.createProject = (req, res) => {
  //console.log(req.body);
  console.log("--> Create the Project");
  var data = req.body;
  //write the projectname to metadata
  influxMeta
    .writePoints(
      [
        {
          measurement: "project",
          tags: { project: req.body.project.name },
          fields: { projectname: req.body.project.name },
          timestamp: new Date(),
        },
      ],
      {
        database: "metaData",
        precision: "m",
      }
    )
    .catch((err) => {
      console.error(`Error saving data to InfluxDB (Project)! ${err.stack}`);
    });

  //when Finished send statuscode ok
  res.sendStatus(200);
};

//Write meta and history data to the database
exports.writeJSON = (req, res) => {
  console.log("-> Start Write JSONs to InfluxDB");
  var data = req.body;

  let wichType = "none";
  if (data.product === "AWT - Abnehmerdaten") {
    wichType = "Abnehmer";
  }
  if (data.product === "AWT - Heizhausdaten") {
    wichType = "Heizhaus";
  }

  if (wichType === "Abnehmer") {
    //write metadata to influx db
    console.log("--> Write Abnehmer Data to Database");
    influxMeta
      .writePoints(
        [
          {
            measurement: "customer",
            tags: { customerId: data.customerData.id },
            fields: {
              ID: data.customerData.id,
              customerId: data.customerData.customerId,
              name: data.customerData.name,
              address1: data.customerData.address1,
              address2: data.customerData.address2,
              plz: data.customerData.plz,
              town: data.customerData.town,
              country: data.customerData.country,
              calcDiffTemp: data.customerData.calcDiffTemp,
              maxLeistung: data.customerData.maxLeistung,
              lat: data.customerData.coordinates.lat,
              lon: data.customerData.coordinates.lon,
              description: data.customerData.description,
            },
            timestamp: new Date(),
          },
        ],
        {
          database: "metaData",
          precision: "m",
        }
      )
      .catch((err) => {
        console.error(`Error saving data to InfluxDB! ${err.stack}`);
      });

    //write the project again if not there

    //write the history data
    //make the json array ready to write to influxdb

    var dataArray = new Array();
    data.customerData.historyData.forEach((element) => {
      let tempObj = {
        measurement: "historyData",
        tags: { customerId: data.customerData.id },
        fields: {
          primVL: element.primVL,
          primRL: element.primRL,
          sekVLSoll: element.sekVLSoll,
          sekVLIst: element.sekVLIst,
          aussenTemp: element.aussenTemp,
          durchluss: element.durchfluss,
          leistung: element.leistung,
          energie: element.energie,
          t1: element.t1,
          t2: element.t2,
          t3: element.t3,
        },
        timestamp: new Date(element.timestamp),
      };
      dataArray.push(tempObj);
    });
    dataArray.reverse(); //start with the oldes timestamp in database write has a huge impact on speed
    //console.log(dataArray);
    console.log("---> Write " + dataArray.length + " Measurements to the Database");
    influx
      .writePoints(dataArray, {
        database: "customerData",
        precision: "s",
      })
      .catch((err) => {
        console.error(`Error saving data to InfluxDB! ${err.stack}`);
      });
  }

  if (wichType === "Heizhaus") {
    console.log("--> Write Heizhaus Data to Database");
    //write metadata to influx db
    influxMeta
      .writePoints(
        [
          {
            measurement: "boilerhouse",
            tags: { projectId: data.projectId },
            fields: {
              ID: data.projectId,
              name: data.boilerhouseData.name,
              address1: data.boilerhouseData.address1,
              address2: data.boilerhouseData.address2,
              plz: data.boilerhouseData.plz,
              town: data.boilerhouseData.town,
              country: data.boilerhouseData.country,
              calcDiffTemp: data.boilerhouseData.calcDiffTemp,
              maxLeistung: data.boilerhouseData.maxLeistung,
              lat: data.boilerhouseData.coordinates.lat,
              lon: data.boilerhouseData.coordinates.lon,
              description: data.boilerhouseData.description,
            },
            timestamp: new Date(),
          },
        ],
        {
          database: "metaData",
          precision: "m",
        }
      )
      .catch((err) => {
        console.error(`Error saving data to InfluxDB! ${err.stack}`);
      });

    //write the history data
    //make the json array ready to write to influxdb
    var dataArray = new Array();
    data.boilerhouseData.historyData.forEach((element) => {
      let tempObj = {
        measurement: "boilerhouseHistoryData",
        tags: { ID: data.projectId },
        fields: {
          primVL: element.primVL,
          primRL: element.primRL,
          sekVLSoll: element.sekVLSoll,
          sekVLIst: element.sekVLIst,
          aussenTemp: element.aussenTemp,
          durchluss: element.durchfluss,
          leistung: element.leistung,
          energie: element.energie,
          t1: element.t1,
          t2: element.t2,
          t3: element.t3,
        },
        timestamp: new Date(element.timestamp),
      };
      dataArray.push(tempObj);
    });
    dataArray.reverse(); //start with the oldes timestamp in database write has a huge impact on speed
    console.log("---> Write " + dataArray.length + " Measurements to the Database");

    //if the data is to big the import can ran into a timeout so split the array into chunks if needet and write it in smaller pieces to the database
    function chunkArray(myArray, chunk_size) {
      var results = [];

      while (myArray.length) {
        results.push(myArray.splice(0, chunk_size));
      }

      return results;
    }

    if (dataArray.length > 50000) {
      // Split in group of 3 items
      var chunkedArray = chunkArray(dataArray, 50000);
      console.log("----> Write " + chunkedArray.length + " chunked Arrays to the Database");
      //console.log(dataArray.length); //this array is afterwards empty
      for (let index = 0; index < chunkedArray.length; index++) {
        console.log("-----> Write " + chunkedArray[index].length + " Measurements [chunked] to the Database");
        influx
          .writePoints(chunkedArray[index], {
            database: "boilerhouseData",
            precision: "s",
          })
          .catch((err) => {
            console.error(`Error saving data to InfluxDB! ${err.stack}`);
          });
      }
    } else {
      influx
        .writePoints(dataArray, {
          database: "boilerhouseData",
          precision: "s",
        })
        .catch((err) => {
          console.error(`Error saving data to InfluxDB! ${err.stack}`);
        });
    }
  }

  dpLoaded = false;
  //refreshDatapointCount();
  //when Finished send statuscode ok
  res.sendStatus(200);
};

//Updates the Customers and the Boilerhouses
exports.updateDBll = (req, res) => {
  console.log("--> Update Customers and Boilerhouse with Lat/Lon");
  var data = req.body;

  var datafromDBcu;
  influxMeta
    .query(`SELECT * FROM "customer"`)
    .catch((err) => {
      console.log(err);
    })
    .then((results) => {
      //console.log(results[2].address1);
      datafromDBcu = results;
      //datafromDBcu[2].address1 = "alles neu 222"
      for (let index = 0; index < datafromDBcu.length; index++) {
        const element = datafromDBcu[index];
        influxMeta
          .writePoints(

            [
              {
                measurement: "customer",
                tags: { customerId: element.ID },
                fields: {
                  ID: element.ID,
                  name: element.name,
                  address1: element.address1,
                  address2: element.address2,
                  plz: element.plz,
                  town: element.town,
                  country: element.country,
                  calcDiffTemp: element.calcDiffTemp,
                  maxLeistung: element.maxLeistung,
                  lat: data[data.findIndex(x => x[0] === element.ID)][7],
                  lon: data[data.findIndex(x => x[0] === element.ID)][8],
                  description: element.description,
                },
                timestamp: element.time,
              },
            ],

            {
              database: "metaData",
              precision: "m",
            }
          )
          .catch((err) => {
            console.error(`Error saving data to InfluxDB! ${err.stack}`);
          });
      }
      influxMeta
        .query(`SELECT * FROM "boilerhouse"`)
        .catch((err) => {
          console.log(err);
        })
        .then((results) => {
          datafromDBbh = results;
          //datafromDBcu[2].address1 = "alles neu 222"
          for (let index = 0; index < datafromDBbh.length; index++) {
            const element = datafromDBbh[index];

            influxMeta
              .writePoints(

                [
                  {
                    measurement: "boilerhouse",
                    tags: { projectId: element.projectId },
                    fields: {
                      ID: element.projectId,
                      projectId: element.projectId,
                      name: element.name,
                      address1: element.address1,
                      address2: element.address2,
                      plz: element.plz,
                      town: element.town,
                      country: element.country,
                      calcDiffTemp: element.calcDiffTemp,
                      maxLeistung: element.maxLeistung,
                      lat: data[data.findIndex(x => x[0] === (parseInt(element.projectId) + 1000))][7],
                      lon: data[data.findIndex(x => x[0] === (parseInt(element.projectId) + 1000))][8],
                      description: element.description,
                    },
                    timestamp: element.time,
                  },
                ],

                {
                  database: "metaData",
                  precision: "m",
                }
              )
              .catch((err) => {
                console.error(`Error saving data to InfluxDB! ${err.stack}`);
              });

          }
          //
          // res.json(data);
        });


    });

  //when Finished send statuscode ok
  res.sendStatus(200);
};
