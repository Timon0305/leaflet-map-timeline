console.log("################################");
console.log("### Initialize API Settings  ###");
console.log("################################");

const fs = require("fs");

var apiJSON;

//Return to Website
exports.getApiSettings = (req, res) => {
  console.log("--> Get API Settings for AWT");
  fs.readFile("./config/ApiSettings.json", (err, data) => {
    if (err) throw err;
    apiJSON = JSON.parse(data);
    res.json(apiJSON);
  });
};

//Get new URLs and save in JSON
exports.writeApiSettings = (req, res) => {
  console.log("--> Write new API Settings for AWT");
  var data = req.body;
  apiJSON.KartenTiles = data.kt;
  apiJSON.Nominatim = data.no;
  let dataS = JSON.stringify(apiJSON);
  fs.writeFileSync("./config/ApiSettings.json", dataS);
};
