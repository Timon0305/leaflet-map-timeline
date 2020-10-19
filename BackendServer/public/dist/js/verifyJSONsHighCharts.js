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

var error = false;
var errortype = 0;

//Global Variables
var data1 = new Array();

var primVL = new Array();
var primRL = new Array();
var sekVLSoll = new Array();
var sekVLIst = new Array();
var aussenTemp = new Array();
var durchfluss = new Array();
var leistung = new Array();
var energie = new Array();
var t1 = new Array();
var t2 = new Array();
var t3 = new Array();

let data1Ready = false;

let statusMsgParse = {
  file1row: 0,
  file1time: 0,
};

var wichType = "none";

/*
let color1 = "#E12B38";
let color2 = "#3778C2";
let color3 = "#3EB650";
let color4 = "#FCC133";
*/

var colors = Highcharts.getOptions().colors;
var chart;

//Global Functions
function testF() {
  //set highchart to german options
  Highcharts.setOptions({
    lang: {
      decimalPoint: ",",
      thousandsSep: ".",
      loading: "Daten werden geladen...",
      months: [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember",
      ],
      weekdays: [
        "Sonntag",
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag",
      ],
      shortMonths: [
        "Jan",
        "Feb",
        "Mär",
        "Apr",
        "Mai",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Okt",
        "Nov",
        "Dez",
      ],
      exportButtonTitle: "Exportieren",
      printButtonTitle: "Drucken",
      rangeSelectorFrom: "Von",
      rangeSelectorTo: "Bis",
      rangeSelectorZoom: "Zeitraum",
      downloadPNG: "Download als PNG-Bild",
      downloadJPEG: "Download als JPEG-Bild",
      downloadPDF: "Download als PDF-Dokument",
      downloadSVG: "Download als SVG-Bild",
      resetZoom: "Zoom zurücksetzen",
      resetZoomTitle: "Zoom zurücksetzen",
    },
  });

  console.log(primVL);
  let dataSeries = [
    {
      yAxis: 1,
      data: primVL,
      lineWidth: 0.5,
      name: "primVL",
      tooltip: {
        valueSuffix: " °C",
        valueDecimals: 2,
      },
    },
    {
      yAxis: 1,
      data: primRL,
      lineWidth: 0.5,
      name: "primRL",
      tooltip: {
        valueDecimals: 2,
        valueSuffix: " °C",
      },
    },
    {
      yAxis: 1,
      data: sekVLSoll,
      lineWidth: 0.5,
      name: "sekVLSoll",
      tooltip: {
        valueDecimals: 2,
        valueSuffix: " °C",
      },
    },
    {
      yAxis: 1,
      data: sekVLIst,
      lineWidth: 0.5,
      name: "sekVLIst",
      tooltip: {
        valueDecimals: 2,
        valueSuffix: " °C",
      },
    },
    {
      yAxis: 1,
      data: aussenTemp,
      lineWidth: 0.5,
      name: "aussenTemp",
      tooltip: {
        valueDecimals: 2,
        valueSuffix: " °C",
      },
    },
    {
      yAxis: 1,
      data: durchfluss,
      lineWidth: 0.5,
      name: "durchfluss",
      tooltip: {
        valueDecimals: 0,
        valueSuffix: " l/h",
      },
    },
    {
      yAxis: 1,
      data: leistung,
      lineWidth: 0.5,
      name: "leistung",
      tooltip: {
        valueDecimals: 0,
        valueSuffix: " kW",
      },
    },
    {
      yAxis: 0,
      data: energie,
      lineWidth: 0.5,
      name: "energie",
      tooltip: {
        valueDecimals: 0,
        valueSuffix: " kWh",
      },
    },
    {
      yAxis: 0,
      data: t1,
      lineWidth: 0.5,
      name: "t1",
    },
    {
      yAxis: 0,
      data: t2,
      lineWidth: 0.5,
      name: "t2",
    },
    {
      yAxis: 0,
      data: t3,
      lineWidth: 0.5,
      name: "t3",
    },
  ];

  //console.time('line');
  if (wichType === "Abnehmer") {
    chart = Highcharts.chart("container", {
      boost: {
        enabled: true,
      },
      chart: {
        zoomType: "x",
      },

      title: {
        text: data1.customerData.name,
      },

      subtitle: {
        text:
          "Berechnete Spreizung: " +
          data1.customerData.calcDiffTemp +
          " K | Maximale Leistung: " +
          data1.customerData.maxLeistung +
          " kW",
      },

      tooltip: {
        crosshairs: true,
        split: true,
      },

      xAxis: {
        type: "datetime",
      },

      yAxis: [
        {
          // Primary yAxis 0

          title: {
            text: "Große Werte",
          },
          opposite: true,
        },
        {
          // Secondary yAxis 1
          gridLineWidth: 1,
          title: {
            text: "Temperaturen & diverse",
          },
          /*
      labels: {
        formatter: function() {
            return this.value + ' °C';
        }
    }
    */
        },
      ],

      colors: colors,
      series: dataSeries,
    });
  }
  console.log(dataSeries);

  if (wichType === "Heizhaus") {
    chart = Highcharts.chart("container", {
      boost: {
        enabled: true,
      },
      chart: {
        zoomType: "x",
      },

      title: {
        text: data1.boilerhouseData.name,
      },

      subtitle: {
        text:
          "Berechnete Spreizung: " +
          data1.boilerhouseData.calcDiffTemp +
          " K | Maximale Leistung: " +
          data1.boilerhouseData.maxLeistung +
          " kW",
      },

      tooltip: {
        crosshairs: true,
        split: true,
      },

      xAxis: {
        type: "datetime",
      },

      yAxis: [
        {
          // Primary yAxis 0

          title: {
            text: "Große Werte",
          },
          opposite: true,
        },
        {
          // Secondary yAxis 1
          gridLineWidth: 1,
          title: {
            text: "Temperaturen & diverse",
          },
          /*
      labels: {
        formatter: function() {
            return this.value + ' °C';
        }
    }
    */
        },
      ],

      colors: colors,
      series: dataSeries,
    });
  }
  console.log(data1)
  //console.timeEnd('line');
  $("#chartDivLoad").remove();
  $("#chartTitle").html('<i class="fas fa-chart-line mr-1"></i> Chart Anzeige');
  $("#drawChart").prop("disabled", true); //release the draw chart button
}

function checkParseReady() {
  if (data1Ready === true) {
    //all ready and release draw chart button

    let allDatapoints =
      primVL.length +
      primRL.length +
      sekVLSoll.length +
      sekVLIst.length +
      aussenTemp.length +
      durchfluss.length +
      leistung.length +
      energie.length +
      t1.length +
      t2.length +
      t3.length;

    let tempNaming = "";

    if (wichType === "Abnehmer") {
      $("#jsonTime").text(statusMsgParse.file1time + " Sekunden");
      $("#jsonAllDPs").text(allDatapoints);

      //make general info table
      $("#iTable").empty();
      //Header
      $("#iTable").append(
        '<thead class="thead-dark"><tr><th scope="col">Name</th><th scope="col">Werte</th></tr></thead>'
      );
      //data (body)
      $("#iTable").append(
        "<tr><td>Projekt ID</td><td>" + data1.projectId + "</td> </tr>"
      );
      $("#iTable").append(
        "<tr><td>Eindeudige Abnehmer ID</td><td>" +
        data1.customerData.id +
        "</td> </tr>"
      );
      $("#iTable").append(
        "<tr><td>Zusatz ID</td><td>" +
        data1.customerData.customerId +
        "</td> </tr>"
      );
      $("#iTable").append(
        "<tr><td>Name</td><td>" + data1.customerData.name + "</td> </tr>"
      );
      $("#iTable").append(
        "<tr><td>Adresse</td><td>" +
        data1.customerData.address1 +
        " " +
        data1.customerData.address2 +
        " - " +
        data1.customerData.plz +
        " " +
        data1.customerData.town +
        " - " +
        data1.customerData.country +
        "</td> </tr>"
      );
      $("#iTable").append(
        "<tr><td>Berechnete Spreizung</td><td>" +
        data1.customerData.calcDiffTemp +
        " K" +
        "</td> </tr>"
      );
      $("#iTable").append(
        "<tr><td>Maximale Leistung</td><td>" +
        data1.customerData.maxLeistung +
        " kW" +
        "</td> </tr>"
      );
      $("#iTable").append(
        "<tr><td>Geographischen Koordinaten (Latitude/Longitude)</td><td>" +
        data1.customerData.coordinates.lat +
        "/" +
        data1.customerData.coordinates.lon +
        "</td> </tr>"
      );
      $("#iTable").append(
        "<tr><td>Beschreibung</td><td>" +
        data1.customerData.description +
        "</td> </tr>"
      );
    }
    if (wichType === "Heizhaus") {
      $("#jsonTime").text(statusMsgParse.file1time + " Sekunden");
      $("#jsonAllDPs").text(allDatapoints);

      //make general info table
      $("#iTable").empty();
      //Header
      $("#iTable").append(
        '<thead class="thead-dark"><tr><th scope="col">Name</th><th scope="col">Werte</th></tr></thead>'
      );
      //data (body)
      $("#iTable").append(
        "<tr><td>Projekt ID</td><td>" + data1.projectId + "</td> </tr>"
      );

      $("#iTable").append(
        "<tr><td>Name</td><td>" + data1.boilerhouseData.name + "</td> </tr>"
      );
      $("#iTable").append(
        "<tr><td>Adresse</td><td>" +
        data1.boilerhouseData.address1 +
        " " +
        data1.boilerhouseData.address2 +
        " - " +
        data1.boilerhouseData.plz +
        " " +
        data1.boilerhouseData.town +
        " - " +
        data1.boilerhouseData.country +
        "</td> </tr>"
      );
      $("#iTable").append(
        "<tr><td>Berechnete Spreizung</td><td>" +
        data1.boilerhouseData.calcDiffTemp +
        " K" +
        "</td> </tr>"
      );
      $("#iTable").append(
        "<tr><td>Maximale Leistung</td><td>" +
        data1.boilerhouseData.maxLeistung +
        " kW" +
        "</td> </tr>"
      );
      $("#iTable").append(
        "<tr><td>Geographischen Koordinaten (Latitude/Longitude)</td><td>" +
        data1.boilerhouseData.coordinates.lat +
        "/" +
        data1.boilerhouseData.coordinates.lon +
        "</td> </tr>"
      );
      $("#iTable").append(
        "<tr><td>Beschreibung</td><td>" +
        data1.boilerhouseData.description +
        "</td> </tr>"
      );
    }

    $("#iTable").append(
      "<tr><td>Erstelldatum der JSON Datei</td><td>" +
      data1.createDate +
      "</td> </tr>"
    );

    //make history info table
    $("#hTable").empty();
    //Header
    $("#hTable").append(
      '<thead class="thead-dark"><tr><th scope="col">#</th><th scope="col">Name</th><th scope="col">Startzeit</th><th scope="col">Endzeit</th><th scope="col">Min. Wert</th><th scope="col">Max. Wert</th><th scope="col">Anzahl Datenpunkte</th></tr></thead>'
    );

    //data (body)
    $("#hTable").append(
      '<tr><th scope="row">' +
      1 +
      "</th><td><b>primVL</b> - Primär Vorlauf Temp. [°C] </td><td>" +
      new Date(primVL[0][0]).toISOString() +
      "</td><td>" +
      new Date(primVL[primVL.length - 1][0]).toISOString() +
      "</td><td>" +
      statusMsgParse.primVL[0] +
      "</td><td>" +
      statusMsgParse.primVL[1] +
      "</td><td>" +
      primVL.length +
      "</td>    </tr>"
    );
    $("#hTable").append(
      '<tr><th scope="row">' +
      2 +
      "</th><td><b>primRL</b> - Primär Rücklauf Temp. [°C] </td><td>" +
      new Date(primRL[0][0]).toISOString() +
      "</td><td>" +
      new Date(primRL[primRL.length - 1][0]).toISOString() +
      "</td><td>" +
      statusMsgParse.primRL[0] +
      "</td><td>" +
      statusMsgParse.primRL[1] +
      "</td><td>" +
      primRL.length +
      "</td>    </tr>"
    );
    $("#hTable").append(
      '<tr><th scope="row">' +
      3 +
      "</th><td><b>sekVLSoll</b> - Sekundär Vorlauf Soll Temp. [°C] </td><td>" +
      new Date(sekVLSoll[0][0]).toISOString() +
      "</td><td>" +
      new Date(sekVLSoll[sekVLSoll.length - 1][0]).toISOString() +
      "</td><td>" +
      statusMsgParse.sekVLSoll[0] +
      "</td><td>" +
      statusMsgParse.sekVLSoll[1] +
      "</td><td>" +
      sekVLSoll.length +
      "</td>    </tr>"
    );
    $("#hTable").append(
      '<tr><th scope="row">' +
      4 +
      "</th><td><b>sekVLIst</b> - Sekunkär Vorlauf Ist Temp. [°C] </td><td>" +
      new Date(sekVLIst[0][0]).toISOString() +
      "</td><td>" +
      new Date(sekVLIst[sekVLIst.length - 1][0]).toISOString() +
      "</td><td>" +
      statusMsgParse.sekVLIst[0] +
      "</td><td>" +
      statusMsgParse.sekVLIst[1] +
      "</td><td>" +
      sekVLIst.length +
      "</td>    </tr>"
    );
    $("#hTable").append(
      '<tr><th scope="row">' +
      5 +
      "</th><td><b>aussenTemp</b> - Aussentemperatur [°C] </td><td>" +
      new Date(aussenTemp[0][0]).toISOString() +
      "</td><td>" +
      new Date(aussenTemp[aussenTemp.length - 1][0]).toISOString() +
      "</td><td>" +
      statusMsgParse.aussenTemp[0] +
      "</td><td>" +
      statusMsgParse.aussenTemp[1] +
      "</td><td>" +
      aussenTemp.length +
      "</td>    </tr>"
    );
    $("#hTable").append(
      '<tr><th scope="row">' +
      6 +
      "</th><td><b>durchfluss</b> - Primär Durchluss [l/h] </td><td>" +
      new Date(durchfluss[0][0]).toISOString() +
      "</td><td>" +
      new Date(durchfluss[durchfluss.length - 1][0]).toISOString() +
      "</td><td>" +
      statusMsgParse.durchfluss[0] +
      "</td><td>" +
      statusMsgParse.durchfluss[1] +
      "</td><td>" +
      durchfluss.length +
      "</td>    </tr>"
    );
    $("#hTable").append(
      '<tr><th scope="row">' +
      7 +
      "</th><td><b>leistung</b> - Primär Leistung [kW] </td><td>" +
      new Date(leistung[0][0]).toISOString() +
      "</td><td>" +
      new Date(leistung[leistung.length - 1][0]).toISOString() +
      "</td><td>" +
      statusMsgParse.leistung[0] +
      "</td><td>" +
      statusMsgParse.leistung[1] +
      "</td><td>" +
      leistung.length +
      "</td>    </tr>"
    );
    $("#hTable").append(
      '<tr><th scope="row">' +
      8 +
      "</th><td><b>energie</b> - Primär Energie (Verbrauch) [kWh] </td><td>" +
      new Date(energie[0][0]).toISOString() +
      "</td><td>" +
      new Date(energie[energie.length - 1][0]).toISOString() +
      "</td><td>" +
      statusMsgParse.energie[0] +
      "</td><td>" +
      statusMsgParse.energie[1] +
      "</td><td>" +
      energie.length +
      "</td>    </tr>"
    );
    $("#hTable").append(
      '<tr><th scope="row">' +
      9 +
      "</th><td><b>t1</b> - [-] </td><td>" +
      new Date(t1[0][0]).toISOString() +
      "</td><td>" +
      new Date(t1[t1.length - 1][0]).toISOString() +
      "</td><td>" +
      statusMsgParse.t1[0] +
      "</td><td>" +
      statusMsgParse.t1[1] +
      "</td><td>" +
      t1.length +
      "</td>    </tr>"
    );
    $("#hTable").append(
      '<tr><th scope="row">' +
      10 +
      "</th><td><b>t2</b> - [-] </td><td>" +
      new Date(t2[0][0]).toISOString() +
      "</td><td>" +
      new Date(t2[t2.length - 1][0]).toISOString() +
      "</td><td>" +
      statusMsgParse.t2[0] +
      "</td><td>" +
      statusMsgParse.t2[1] +
      "</td><td>" +
      t2.length +
      "</td>    </tr>"
    );
    $("#hTable").append(
      '<tr><th scope="row">' +
      11 +
      "</th><td><b>t3</b> - [-] </td><td>" +
      new Date(t3[0][0]).toISOString() +
      "</td><td>" +
      new Date(t3[t3.length - 1][0]).toISOString() +
      "</td><td>" +
      statusMsgParse.t3[0] +
      "</td><td>" +
      statusMsgParse.t3[1] +
      "</td><td>" +
      t3.length +
      "</td>    </tr>"
    );
    $("#hTable").append(
      '<tr><th scope="row">' +
      "" +
      "</th><td></td><td>" +
      "" +
      "</td><td>" +
      "" +
      "</td><td>" +
      "" +
      "</td><td><b>" +
      "Gesamt:" +
      "</b></td><td><b>" +
      allDatapoints +
      "</b></td>    </tr>"
    );

    $("#csvDivLoad").remove();
    $('#cinfo').CardWidget('toggle');
    $('#modal-primary1').modal('toggle');
    $("#drawChart").prop("disabled", false); //release the draw chart button
  }
}

function main() {
  //set alarms invisible at startup
  $("#csvAlert").hide();

  //set the filename after choosen something in the upload -- works global on this site
  $(".custom-file input").change(function (e) {
    var files = [];
    for (var i = 0; i < $(this)[0].files.length; i++) {
      files.push($(this)[0].files[i].name);
    }
    $(this).next(".custom-file-label").html(files.join(", "));
  });

  //csv1 analysis
  $("#csvAnal").click(function () {
    /*
    //add working spinner to button
    $("#csvAnal").html(
      `<span id="csvAnalSpinner" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Lade Daten...`
    );
    */

    //destroy the chart to save memory
    if (chart != undefined) {
      //first start undefined
      chart.destroy();
    }

    $("#csvDiv").append(
      '<div id="csvDivLoad" class="overlay dark"><i class="fas fa-2x fa-sync-alt fa-spin"></i></div>'
    );

    $("#csvAlert").hide(); //hide alarm message

    $("#drawChart").prop("disabled", true); //disables the draw chart button

    let file1 = document.getElementById("csv1upload").files[0];

    data1 = "";

    primVL = new Array();
    primRL = new Array();
    sekVLSoll = new Array();
    sekVLIst = new Array();
    aussenTemp = new Array();
    durchfluss = new Array();
    leistung = new Array();
    energie = new Array();
    t1 = new Array();
    t2 = new Array();
    t3 = new Array();

    data1Ready = false;

    statusMsgParse = {
      file1row: 0,
      file1time: 0,
      primVL: [0, 0],
      primRL: [0, 0],
      sekVLSoll: [0, 0],
      sekVLIst: [0, 0],
      aussenTemp: [0, 0],
      durchfluss: [0, 0],
      leistung: [0, 0],
      energie: [0, 0],
      t1: [0, 0],
      t2: [0, 0],
      t3: [0, 0],
    };

    if (file1 != undefined) {
      let start1 = new Date().getTime();
      let init1 = false;

      //reset

      //read the json from the selected input field
      var reader = new FileReader();
      reader.onload = onReaderLoad;
      reader.readAsText(file1);

      function onReaderLoad(event) {

        try {
          data1 = JSON.parse(event.target.result);
        } catch (e) {
          console.warn("as", e);
          error = true;
          errortype = e;
          $("#modalImport").text(errortype);
          $('#modal-primary').modal('toggle');
          $("#csvDivLoad").remove();
        }

        let data1Temp;


        if (data1.product === "AWT - Abnehmerdaten") {
          wichType = "Abnehmer";
          data1Temp = data1.customerData.historyData;
        } else if (data1.product === "AWT - Heizhausdaten") {
          wichType = "Heizhaus";
          data1Temp = data1.boilerhouseData.historyData;
        } else {
          wichType = "none";
          console.warn("ERROR IN JSON FILE - NO VALID PRODUCT;");
        }
        console.warn(wichType);

        data1Temp.forEach((element) => {
          //init with data
          if (init1 === false) {
            statusMsgParse.primVL = [element.primVL, element.primVL];
            statusMsgParse.primRL = [element.primRL, element.primRL];
            statusMsgParse.sekVLSoll = [element.sekVLSoll, element.sekVLSoll];
            statusMsgParse.sekVLIst = [element.sekVLSoll, element.sekVLSoll];
            statusMsgParse.aussenTemp = [
              element.aussenTemp,
              element.aussenTemp,
            ];
            statusMsgParse.durchfluss = [
              element.durchfluss,
              element.durchfluss,
            ];
            statusMsgParse.leistung = [element.leistung, element.leistung];
            statusMsgParse.energie = [element.energie, element.energie];
            statusMsgParse.t1 = [element.t1, element.t1];
            statusMsgParse.t2 = [element.t2, element.t2];
            statusMsgParse.t3 = [element.t3, element.t3];
            init1 = true;
          }

          //min max values
          if (element.primVL < statusMsgParse.primVL[0]) {
            statusMsgParse.primVL[0] = element.primVL;
          }
          if (element.primVL > statusMsgParse.primVL[1]) {
            statusMsgParse.primVL[1] = element.primVL;
          }
          if (element.primRL < statusMsgParse.primRL[0]) {
            statusMsgParse.primRL[0] = element.primRL;
          }
          if (element.primRL > statusMsgParse.primRL[1]) {
            statusMsgParse.primRL[1] = element.primRL;
          }
          if (element.sekVLSoll < statusMsgParse.sekVLSoll[0]) {
            statusMsgParse.sekVLSoll[0] = element.sekVLSoll;
          }
          if (element.sekVLSoll > statusMsgParse.sekVLSoll[1]) {
            statusMsgParse.sekVLSoll[1] = element.sekVLSoll;
          }
          if (element.sekVLIst < statusMsgParse.sekVLIst[0]) {
            statusMsgParse.sekVLIst[0] = element.sekVLIst;
          }
          if (element.sekVLIst > statusMsgParse.sekVLIst[1]) {
            statusMsgParse.sekVLIst[1] = element.sekVLIst;
          }
          if (element.aussenTemp < statusMsgParse.aussenTemp[0]) {
            statusMsgParse.aussenTemp[0] = element.aussenTemp;
          }
          if (element.aussenTemp > statusMsgParse.aussenTemp[1]) {
            statusMsgParse.aussenTemp[1] = element.aussenTemp;
          }
          if (element.durchfluss < statusMsgParse.durchfluss[0]) {
            statusMsgParse.durchfluss[0] = element.durchfluss;
          }
          if (element.durchfluss > statusMsgParse.durchfluss[1]) {
            statusMsgParse.durchfluss[1] = element.durchfluss;
          }
          if (element.leistung < statusMsgParse.leistung[0]) {
            statusMsgParse.leistung[0] = element.leistung;
          }
          if (element.leistung > statusMsgParse.leistung[1]) {
            statusMsgParse.leistung[1] = element.leistung;
          }
          if (element.energie < statusMsgParse.energie[0]) {
            statusMsgParse.energie[0] = element.energie;
          }
          if (element.energie > statusMsgParse.energie[1]) {
            statusMsgParse.energie[1] = element.energie;
          }
          if (element.t1 < statusMsgParse.t1[0]) {
            statusMsgParse.t1[0] = element.t1;
          }
          if (element.t1 > statusMsgParse.t1[1]) {
            statusMsgParse.t1[1] = element.t1;
          }
          if (element.t2 < statusMsgParse.t2[0]) {
            statusMsgParse.t2[0] = element.t2;
          }
          if (element.t2 > statusMsgParse.t2[1]) {
            statusMsgParse.t2[1] = element.t2;
          }
          if (element.t3 < statusMsgParse.t3[0]) {
            statusMsgParse.t3[0] = element.t3;
          }
          if (element.t3 > statusMsgParse.t3[1]) {
            statusMsgParse.t3[1] = element.t3;
          }

          //element timestamp convert to unix timestamp for the chart
          var tempDate = new Date(element.timestamp).getTime();

          //fill data for chart
          primVL.push([tempDate, element.primVL]);
          primRL.push([tempDate, element.primRL]);
          sekVLSoll.push([tempDate, element.sekVLSoll]);
          sekVLIst.push([tempDate, element.sekVLIst]);
          aussenTemp.push([tempDate, element.aussenTemp]);
          durchfluss.push([tempDate, element.durchfluss]);
          leistung.push([tempDate, element.leistung]);
          energie.push([tempDate, element.energie]);
          t1.push([tempDate, element.t1]);
          t2.push([tempDate, element.t2]);
          t3.push([tempDate, element.t3]);
        });

        console.log("Finished parsing JSON");
        statusMsgParse.file1row = primVL.length;
        statusMsgParse.file1time = (new Date().getTime() - start1) / 1000;
        data1Ready = true;


        //reverse the array to go from start to end
        primVL.reverse();
        primRL.reverse();
        sekVLSoll.reverse();
        sekVLIst.reverse();
        aussenTemp.reverse();
        durchfluss.reverse();
        leistung.reverse();
        energie.reverse();
        t1.reverse();
        t2.reverse();
        t3.reverse();

        checkParseReady();
      }
    } else {
      data1Ready = true;
    }

    //nothing selected
    if (file1 === undefined) {
      $("#csvAlert").show();
      $("#csvDivLoad").remove();
      //$("#csvAnalSpinner").remove(); //remove the load spinner and set text back
      //$("#csvAnal").html("CSV Analyisieren");
    }
  });

  $("#drawChart").click(function () {
    $("#chartDiv").append(
      '<div id="chartDivLoad" class="overlay dark"><i class="fas fa-2x fa-sync-alt fa-spin"></i></div>'
    ); //not working
    $("#chartTitle").html(
      '<span id="chartTitleSpinner" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Zeichne Chart...'
    );
    testF();
  });

  console.log("Startup AWT JSON verify complete");
}

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

/* not used
function loadJSON(file, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType('application/json');
  xobj.open('GET', file, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == '200') {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}
*/

/**
 * when DOM ready load the main function
 */
$(document).ready(main);
