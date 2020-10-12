//Global Variables
var data1 = new Array();
var data2 = new Array();
var data3 = new Array();
var data4 = new Array();

let data1Ready = false;
let data2Ready = false;
let data3Ready = false;
let data4Ready = false;

let statusMsgParse = {
  "file1row": 0,
  "file1time": 0,
  "file2row": 0,
  "file2time": 0,
  "file3row": 0,
  "file3time": 0,
  "file4row": 0,
  "file4time": 0,
  "file1Min": 0,
  "file1Max": 0,
  "file2Min": 0,
  "file2Max": 0,
  "file3Min": 0,
  "file3Max": 0,
  "file4Min": 0,
  "file4Max": 0
};

let name1 = "CSV 1";
let color1 = "#E12B38";
let name2 = "CSV 2";
let color2 = "#3778C2";
let name3 = "CSV 3";
let color3 = "#3EB650";
let name4 = "CSV 4";
let color4 = "#FCC133";

var chart;

//Global Functions
function testF() {

  let dataSeries = [];
  //build the data series
  if (data1.length > 0) {
    dataSeries.push({
      data: data1,
      lineWidth: 0.5,
      name: name1
    });
  }

  if (data2.length > 0) {
    dataSeries.push({
      data: data2,
      lineWidth: 0.5,
      name: name2
    });
  }

  if (data3.length > 0) {
    dataSeries.push({
      data: data3,
      lineWidth: 0.5,
      name: name3
    });
  }

  if (data4.length > 0) {
    dataSeries.push({
      data: data4,
      lineWidth: 0.5,
      name: name4
    });
  }

  //console.time('line');
  chart = Highcharts.chart('container', {

    boost: {
      enabled: true
    },
    chart: {
      zoomType: 'x'
    },

    title: {
      text: 'Auswertung'
    },

    tooltip: {
      valueDecimals: 2,
      crosshairs: true,
      split: true
    },

    xAxis: {
      type: 'datetime'
    },
    colors: [color1, color2, color3, color4],
    series: dataSeries
  });

  //console.timeEnd('line');
  $("#chartDivLoad").remove();
  $("#chartTitle").html(
    '<i class="fas fa-chart-line mr-1"></i> Chart Anzeige'
  );
  $('#drawChart').prop('disabled', true); //release the draw chart button

}

function checkParseReady() {
  if (data1Ready === true && data2Ready === true && data3Ready === true && data4Ready === true) { //all ready and release draw chart button

    //display data informations from parsing
    $("#n1").html('<a style="color:' + color1 + ';">' + name1 + '</a>');
    $("#n2").html('<a style="color:' + color2 + ';">' + name2 + '</a>');
    $("#n3").html('<a style="color:' + color3 + ';">' + name3 + '</a>');
    $("#n4").html('<a style="color:' + color4 + ';">' + name4 + '</a>');

    $("#n11").html(statusMsgParse.file1time.toFixed(1));
    $("#n12").html(statusMsgParse.file1row);

    $("#n21").html(statusMsgParse.file2time.toFixed(1));
    $("#n22").html(statusMsgParse.file2row);

    $("#n31").html(statusMsgParse.file3time.toFixed(1));
    $("#n32").html(statusMsgParse.file3row);

    $("#n41").html(statusMsgParse.file4time.toFixed(1));
    $("#n42").html(statusMsgParse.file4row);

    //complete sums
    $("#n51").html("<strong>" + (statusMsgParse.file1time + statusMsgParse.file2time + statusMsgParse.file3time + statusMsgParse.file4time).toFixed(1) + "</strong>");
    $("#n52").html("<strong>" + (statusMsgParse.file1row + statusMsgParse.file2row + statusMsgParse.file3row + statusMsgParse.file4row) + "</strong>");

    //calc dates
    if (data1.length > 0) { //data here
      $("#a1").html(new Date(data1[0][0]).toISOString());
      $("#a2").html(new Date(data1[data1.length - 1][0]).toISOString());
      $("#a3").html(statusMsgParse.file1Min);
      $("#a4").html(statusMsgParse.file1Max);
    }
    else {
      $("#a1").html("-");
      $("#a2").html("-");
      $("#a3").html("0");
      $("#a4").html("0");
    }

    //calc dates
    if (data2.length > 0) { //data here
      $("#b1").html(new Date(data2[0][0]).toISOString());
      $("#b3").html(statusMsgParse.file2Min);
      $("#b2").html(new Date(data2[data2.length - 1][0]).toISOString());
      $("#b4").html(statusMsgParse.file2Max);
    }
    else {
      $("#b1").html("-");
      $("#b2").html("-");
      $("#b3").html("0");
      $("#b4").html("0");
    }

    //calc dates
    if (data3.length > 0) { //data here
      $("#c1").html(new Date(data3[0][0]).toISOString());
      $("#c2").html(new Date(data3[data3.length - 1][0]).toISOString());
      $("#c3").html(statusMsgParse.file3Min);
      $("#c4").html(statusMsgParse.file3Max);
    }
    else {
      $("#c1").html("-");
      $("#c2").html("-");
      $("#c3").html("0");
      $("#c4").html("0");
    }

    //calc dates
    if (data4.length > 0) { //data here
      $("#d1").html(new Date(data4[0][0]).toISOString());
      $("#d2").html(new Date(data4[data4.length - 1][0]).toISOString());
      $("#d3").html(statusMsgParse.file4Min);
      $("#d4").html(statusMsgParse.file4Max);
    }
    else {
      $("#d1").html("-");
      $("#d2").html("-");
      $("#d3").html("0");
      $("#d4").html("0");
    }

    $("#csvDivLoad").remove();
    $('#drawChart').prop('disabled', false); //release the draw chart button
  }
}

function main() {

  //set alarms invisible at startup
  $('#csvAlert').hide();

  //set the filename after choosen something in the upload -- works global on this site
  $('.custom-file input').change(function (e) {
    var files = [];
    for (var i = 0; i < $(this)[0].files.length; i++) {
      files.push($(this)[0].files[i].name);
    }
    $(this).next('.custom-file-label').html(files.join(', '));
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
    if (chart != undefined) { //first start undefined
      chart.destroy();
    }

    $("#csvDiv").append('<div id="csvDivLoad" class="overlay dark"><i class="fas fa-2x fa-sync-alt fa-spin"></i></div>');

    $('#csvAlert').hide(); //hide alarm message

    $('#drawChart').prop('disabled', true); //disables the draw chart button

    let file1 = document.getElementById('csv1upload').files[0];
    let file2 = document.getElementById('csv2upload').files[0];
    let file3 = document.getElementById('csv3upload').files[0];
    let file4 = document.getElementById('csv4upload').files[0];

    /*
    // Stream big file in worker thread
    Papa.parse(file, {
      worker: true,
      complete: function (results) {
        console.log("Finished parsing data 1");
        data1 = results.data;
        testF();
      }
    });
    */
    //console.log(file1);undefined

    data1 = new Array();
    data2 = new Array();
    data3 = new Array();
    data4 = new Array();

    data1Ready = false;
    data2Ready = false;
    data3Ready = false;
    data4Ready = false;

    statusMsgParse = {
      "file1row": 0,
      "file1time": 0,
      "file2row": 0,
      "file2time": 0,
      "file3row": 0,
      "file3time": 0,
      "file4row": 0,
      "file4time": 0,
      "file1Min": 0,
      "file1Max": 0,
      "file2Min": 0,
      "file2Max": 0,
      "file3Min": 0,
      "file3Max": 0,
      "file4Min": 0,
      "file4Max": 0
    };

    if (file1 != undefined) {
      let start1 = new Date().getTime();
      let init1 = false;
      Papa.parse(file1, {
        download: true,
        header: false,
        dynamicTyping: true,
        //worker: true, //if active sites is still reactive
        step: function (row) {
          //init with data
          if(init1 === false) {
            statusMsgParse.file1Min = row.data[2];
            statusMsgParse.file1Max = row.data[2];
            init1 = true;
          }
          //min value
          if(row.data[2] < statusMsgParse.file1Min) {
            statusMsgParse.file1Min = row.data[2];
          }
          //max value
          if(row.data[2] > statusMsgParse.file1Max) {
            statusMsgParse.file1Max = row.data[2];
          }

          //console.log("Row:", row.data); //NICHT AUSFÜHREN BEI VIELEN DATEN
          data1.push([row.data[1], row.data[2]]);
        },
        complete: function () {
          //data1.shift(); // remove the header from the data
          data1.reverse();
          console.log("Finished parsing data 1");
          statusMsgParse.file1row = data1.length;
          statusMsgParse.file1time = (new Date().getTime() - start1) / 1000;
          data1Ready = true;
          //get names and colors
          if ($("#name1").val()) {
            name1 = $("#name1").val();
          }
          color1 = $('#cp1').colorpicker('colorpicker').getValue();
          checkParseReady();
        }
      });
    }
    else {
      data1Ready = true;
    }

    if (file2 != undefined) {
      let start2 = new Date().getTime();
      let init2 = false;
      Papa.parse(file2, {
        download: true,
        header: false,
        dynamicTyping: true,
        //worker: true, //if active sites is still reactive
        step: function (row) {
                    //init with data
                    if(init2 === false) {
                      statusMsgParse.file2Min = row.data[2];
                      statusMsgParse.file2Max = row.data[2];
                      init2 = true;
                    }
                    //min value
                    if(row.data[2] < statusMsgParse.file2Min) {
                      statusMsgParse.file2Min = row.data[2];
                    }
                    //max value
                    if(row.data[2] > statusMsgParse.file2Max) {
                      statusMsgParse.file2Max = row.data[2];
                    }
          //console.log("Row:", row.data); //NICHT AUSFÜHREN BEI VIELEN DATEN
          data2.push([row.data[1], row.data[2]]);
        },
        complete: function () {

          //data2.shift(); // remove the header from the data
          data2.reverse();
          console.log("Finished parsing data 2");
          statusMsgParse.file2row = data2.length;
          statusMsgParse.file2time = (new Date().getTime() - start2) / 1000;
          data2Ready = true;
          //get names and colors
          if ($("#name2").val()) {
            name2 = $("#name2").val();
          }
          color2 = $('#cp2').colorpicker('colorpicker').getValue();
          checkParseReady();
        }
      });
    }
    else {
      data2Ready = true;
    };

    if (file3 != undefined) {
      let start3 = new Date().getTime();
      let init3 = false;
      Papa.parse(file3, {
        download: true,
        header: false,
        dynamicTyping: true,
        //worker: true, //if active sites is still reactive
        step: function (row) {
                              //init with data
                              if(init3 === false) {
                                statusMsgParse.file3Min = row.data[2];
                                statusMsgParse.file3Max = row.data[2];
                                init3 = true;
                              }
                              //min value
                              if(row.data[2] < statusMsgParse.file3Min) {
                                statusMsgParse.file3Min = row.data[2];
                              }
                              //max value
                              if(row.data[2] > statusMsgParse.file3Max) {
                                statusMsgParse.file3Max = row.data[2];
                              }
          //console.log("Row:", row.data); //NICHT AUSFÜHREN BEI VIELEN DATEN
          data3.push([row.data[1], row.data[2]]);
        },
        complete: function () {

          //data3.shift(); // remove the header from the data
          data3.reverse();
          console.log("Finished parsing data 3");
          statusMsgParse.file3row = data3.length;
          statusMsgParse.file3time = (new Date().getTime() - start3) / 1000;
          data3Ready = true;
          //get names and colors
          if ($("#name3").val()) {
            name3 = $("#name3").val();
          }
          color3 = $('#cp3').colorpicker('colorpicker').getValue();
          checkParseReady();
        }
      });
    }
    else {
      data3Ready = true;
    };

    if (file4 != undefined) {
      let start4 = new Date().getTime();
      let init4 = false;
      Papa.parse(file4, {
        download: true,
        header: false,
        dynamicTyping: true,
        //worker: true, //if active sites is still reactive
        step: function (row) {
                              //init with data
                              if(init4 === false) {
                                statusMsgParse.file4Min = row.data[2];
                                statusMsgParse.file4Max = row.data[2];
                                init4 = true;
                              }
                              //min value
                              if(row.data[2] < statusMsgParse.file4Min) {
                                statusMsgParse.file4Min = row.data[2];
                              }
                              //max value
                              if(row.data[2] > statusMsgParse.file4Max) {
                                statusMsgParse.file4Max = row.data[2];
                              }
          //console.log("Row:", row.data); //NICHT AUSFÜHREN BEI VIELEN DATEN
          data4.push([row.data[1], row.data[2]]);
        },
        complete: function () {

          //data4.shift(); // remove the header from the data
          data4.reverse();
          console.log("Finished parsing data 4");
          statusMsgParse.file4row = data4.length;
          statusMsgParse.file4time = (new Date().getTime() - start4) / 1000;
          data4Ready = true;
          //get names and colors
          if ($("#name4").val()) {
            name4 = $("#name4").val();
          }
          color4 = $('#cp4').colorpicker('colorpicker').getValue();
          checkParseReady();
        }
      });
    }
    else {
      data4Ready = true;
    };

    //nothing selected
    if (file1 === undefined && file2 === undefined && file3 === undefined && file4 === undefined) {
      $('#csvAlert').show();
      $("#csvDivLoad").remove();
      //$("#csvAnalSpinner").remove(); //remove the load spinner and set text back
      //$("#csvAnal").html("CSV Analyisieren");
    }

  });


  $("#drawChart").click(function () {
    $("#chartDiv").append('<div id="chartDivLoad" class="overlay dark"><i class="fas fa-2x fa-sync-alt fa-spin"></i></div>'); //not working
    $("#chartTitle").html(
      '<span id="chartTitleSpinner" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Zeichne Chart...'
    );
    testF();
  });


  //color picker with addon
  //init color
  $('#cp1').colorpicker();
  $('#cp2').colorpicker();
  $('#cp3').colorpicker();
  $('#cp4').colorpicker();

  console.log("Startup AWT HighCharts complete");
}

/**
 * when DOM ready load the main function
 */
$(document).ready(main);
