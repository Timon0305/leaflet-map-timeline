function main() {
    console.log("Startup Helpsite complete");
  }
  
  //check the connection to the Influx DB
  function getInfoDB() {
    $.ajax({
      url: "http://localhost:7000/api/getInfo",
      dataType: "json",
      success: function (jsonData) {
        $("#pi").text(jsonData.pn);
        $("#ki").text(jsonData.howManyCu);
        $("#di").text(jsonData.dataI);
        if(jsonData.pn !== "") {
          $("#loadedProjectName").text("Projekt: " + jsonData.pn);
        }
  
      },
      error: function (jsonData) {
        $("#pi").text("ERROR");
        $("#ki").text("0");
        $("#di").text("0");
      },
    });
  }
  //get infos from db if something is already there to work with
  getInfoDB();
  
  /*---------------------------------------*/
  //DB connection Test
  var colorRed = "#dc3545";
  var colorGreen = "#28a745";
  var colorYellow = "#ffc107";
  
  //check the connection to the Influx DB
  function checkDB() {
    $.ajax({
      url: "http://localhost:7000/api/checkInfluxDBConn",
      dataType: "json",
      success: function (jsonData) {
        //set the icon and text
        if (jsonData.status == "OK") {
          $("#dbIcon").css("color", colorGreen);
          $("#dbText").text("Datenbank OK");
          //also the backend ok
          $("#sIcon").css("color", colorGreen);
          $("#sText").text("Backend OK");
        } else if (jsonData.status == "NOT") {
          $("#dbIcon").css("color", colorRed);
          $("#dbText").text("Datenbank FEHLER");
          //the backend ok
          $("#sIcon").css("color", colorGreen);
          $("#sText").text("Backend OK");
        } else {
          $("#dbIcon").css("color", colorRed);
          $("#dbText").text("Datenbank FEHLER");
          //backend NOT OK
          $("#sIcon").css("color", colorRed);
          $("#sText").text("Backend FEHLER");
        }
        $("#vawt").text("Version " + jsonData.versionAWT);
      },
      error: function (jsonData) {
        $("#dbIcon").css("color", colorRed);
        $("#dbText").text("Datenbank FEHLER");
        //backend NOT OK
        $("#sIcon").css("color", colorRed);
        $("#sText").text("Backend FEHLER");
      },
    });
  }
  //check DB at startup
  checkDB();
  
  window.setInterval(function () {
    checkDB();
  }, 10000);
  //DB connection Test
  /*---------------------------------------*/
  
  /**
   * when DOM ready load the main function
   */
  $(document).ready(main);
  