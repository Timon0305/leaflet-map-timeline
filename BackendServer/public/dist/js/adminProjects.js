function main() {
  //set alarms invisible at startup
  $("#importAlert").hide();
  $("#listCard").hide(); //hide alarm message
  $("#uploadInfo").hide();

  //when a change at the data inputfield is made
  $("#projectData").change(function (event) {
    $("#listCard").show();
    $("#projectCreate").prop("disabled", false);

    //var fileName = event.target.files[0].name;

    //console.warn(event);
    //if (event.target.nextElementSibling != null) {
    //  event.target.nextElementSibling.innerText = fileName;
    //}
    event.target.nextElementSibling.innerText = "Dateien ausgewählt";

    var fileInputT = document.getElementById("projectData");
    var fileListT = [];
    var completeFileSize = 0;
    var completeNameString = "";

    for (var i = 0; i < fileInputT.files.length; i++) {
      //get all files in an array
      fileListT.push(fileInputT.files[i]);
      completeFileSize = completeFileSize + fileInputT.files[i].size;
      if (i == 0) {
        completeNameString =
          "<b>" +
          fileInputT.files[i].name +
          "</b> (" +
          (fileInputT.files[i].size / 1024 / 1024).toFixed(2) +
          " MB)";
      } else {
        completeNameString =
          completeNameString +
          ", <b>" +
          fileInputT.files[i].name +
          "</b> (" +
          (fileInputT.files[i].size / 1024 / 1024).toFixed(2) +
          " MB)";
      }
    }

    completeFileSize = completeFileSize / 1024 / 1024; //get the MB out of it

    $("#listHeader").text(
      fileListT.length +
      " JSON Dateien ausgewählt - Gesamtgröße: " +
      completeFileSize.toFixed(2) +
      " MB"
    ); //write how many are selected
    $("#listBody").html(completeNameString); //write all selected
  });

  //function to make the database fresh and clean
  function makeFresh(pn) {
    return $.ajax({
      url: "http://localhost:7000/api/dropAndCreateDB",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(pn),
      success: function (data) {
        console.warn("Delete and Create the DB: " + data);
      },
    }).then((response) => response.data);
  }

  //function to make the database fresh and clean
  function createProject(pn) {
    return $.ajax({
      url: "http://localhost:7000/api/createProject",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(pn),
      success: function (data) {
        console.warn("Create the Project: " + data);
      },
    }).then((response) => response.data);
  }

  //function to write the datapoints to the influx db over the backend
  async function writeTheData(tempData) {
    //console.warn("ccccccc");
    return $.ajax({
      url: "http://localhost:7000/api/writeJSONtoInfluxDB",
      type: "POST",
      contentType: "application/json",
      data: tempData,
      success: function (data) {
        console.warn(".. uploading and import data: " + data);
      },
    }).then((response) => response.data);
  }

  async function writeDataOne() {
    $("#importAlert").hide(); //hide alarm message
    $("#uploadInfo").show();
    $("#uploadTxt").text("Daten upload und Import in die Datenbank läuft!");

    let startUpload = new Date().getTime();

    var fileInput = document.getElementById("projectData");
    var fileList = [];

    for (var i = 0; i < fileInput.files.length; i++) {
      //get all files in an array
      fileList.push(fileInput.files[i]);
    }

    var progress = 0;
    var progressSteps = 100 / fileList.length;

    function setProgressBar(value) {
      $("#progressBarVisual").width(value + "%");
      $("#progressBarText").text(value + "%");
    }

    setProgressBar(progress);

    //delete or create the database so everything is fresh
    let tempName = $("#projectName").val();
    let pn = {
      project: {
        id: "",
        name: tempName,
      },
    };
    //console.log("1---------------------------");
    await makeFresh(pn); // is working sync
    //console.log("2---------------------------");

    function Sleep(milliseconds) {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    //console.log("Vor der sleep-Funktion");
    await Sleep(3000); // pauses the function for 3 seconds just in case to give the database some time between drop and create
    //console.log("Nach der Sleep Funktion");

    await createProject(pn);

    //console.log("START---------------------------");

    //not the best method to load a lot of data/files to the server because of the filereader
    /*
    //go over every element and send to server
    for (var i = 0; i < fileList.length; i++) {
      //read the json from the selected input field
      console.log("a---------------------------");
      let reader = new FileReader();
      reader.onload = await onReaderLoad;
      reader.readAsText(fileList[i]);
      console.log("a1---------------------------");
      let tempData = "";
      async function onReaderLoad(event) {
        console.log("b------");
        //data1 = JSON.parse(event.target.result);
        tempData = event.target.result; //send as text is much faster to the server as as parsed JSON

        //console.log("Finished parsing data 1");
        console.log("c------");

        await writeTheData(tempData);
        console.log("d------");
        progress = progress + progressSteps;
        setProgressBar(progress.toFixed(0));
        if (progress >= 100) {
          finishedImport();
        }
      }
      console.log("x---------------------------");
    } //for  finished
    */

    //recursive function to make it in a sequence
    var attachmentI = { i: fileList.length };
    var fulllength = fileList.length;
    function UploadMe() {
      attachmentI.i--;
      if (attachmentI.i > -1) {
        var file = fileList[attachmentI.i];
        var reader = new FileReader();
        console.log("Datafile: " + (fulllength - attachmentI.i) + " out of " + fulllength);
        reader.onload = async function (progressEvent) {
          //add to Map here
          let tempData = "";
          tempData = progressEvent.target.result;
          //console.log("c------");
          await writeTheData(tempData);
          //console.log("d------");
          progress = progress + progressSteps;
          setProgressBar(progress.toFixed(0));
          //console.warn("prog --> " + progress);
          if (progress >= 99.9) {
            finishedImport();
          }
          UploadMe();
        }
        reader.readAsText(file);
      }
    }

    UploadMe();

    //console.log("END---------------------------");

    function finishedImport() {
      //get infos fresh because of new import of data
      getInfoDB();
      let timeNeeded = (new Date().getTime() - startUpload) / 1000;
      $("#uploadTxt").text(
        "Daten ERFOLGREICH in " +
        timeNeeded +
        " Sekunden importiert! -> Sie können zur Auswertungsrubrik wechseln oder den Abnehmern Kooridinaten zuweisen!"
      );
      $("#modalImport").text(
        "Daten ERFOLGREICH in " +
        timeNeeded +
        " Sekunden importiert! -> Sie können zur Auswertungsrubrik wechseln oder den Abnehmern Kooridinaten zuweisen!"
      );
      $('#modal-primary').modal('toggle');
    }
  }

  //start the upload if everything is ok (so far)
  $("#projectCreate").click(function () {
    if (
      $("#projectName").val() == "" ||
      document.getElementById("projectData").files.length == 0
    ) {
      //if not everything is in place
      $("#importAlert").show();
      $("#uploadInfo").hide();
    } else {
      $("#projectCreate").prop("disabled", true); //lock the import button
      writeDataOne();
    }
  });

  console.log("Startup Auswertungstool Daten Import complete");
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
      if (jsonData.pn !== "") {
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
