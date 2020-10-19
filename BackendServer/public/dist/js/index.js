var customerData;
var table;
var tableArray = new Array();
var markersLayer;
var mymap;
var changes = false;
var customerHistory;
var boilerHistory;
var tilesAPI = "";
var nominatimAPI = "";

function releaseWrite() {
    if (changes === true) {
        $("#updateDB").prop("disabled", false); //release the draw chart button
        $("#updateDB").removeClass("btn-primary").addClass("btn-danger");
    } else {
        $("#updateDB").prop("disabled", true); //release the draw chart button
        $("#updateDB").removeClass("btn-danger").addClass("btn-primary");
    }
}

releaseWrite();

function initMap() {
    //Read the api settings from the server and set it to the input fields
    function getAPIsettings() {

        $.ajax({
            url: "http://localhost:7000/api/getApiSettings",
            dataType: "json",
            success: function (jsonData) {
                //console.warn(jsonData);
                tilesAPI = jsonData.KartenTiles;
                nominatimAPI = jsonData.Nominatim;
                //map functions
                //initialize the map
                mymap = L.map("timeSlider").setView([50, 13], 5);
                L.tileLayer(tilesAPI + "/{z}/{x}/{y}.png", {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }).addTo(mymap);

                //set popups when click somewhere on the map

                var popup = L.popup(customOptions);

                var markedlatlon = {lat: "", lon: ""};

                function onMapClick(e) {
                    //console.warn("clicked on map ", e);
                    markedlatlon.lat = e.latlng.lat;
                    markedlatlon.lon = e.latlng.lng;
                    popup
                        .setLatLng(e.latlng)
                        .setContent(
                            "<div class='text-center'><h6>Koordinaten an dieser Position</h6> <b>Latitude:  </b>" +
                            e.latlng.lat +
                            "<br><b>Longitude:  </b>" +
                            e.latlng.lng +
                            "<button type='button' id='zoomto' class='btn-xs btn-warning btn-block'>Diese Position bei markierten Abn. setzen</button>"
                        )
                        .openOn(mymap);
                }

                mymap.on("click", onMapClick);

                $(document).on("click", "#zoomto", function () {
                    setTheLatLonNew(markedlatlon);
                });

                $(document).on("click", "#abn1", function () {
                    delLatLon();
                });

                markersLayer = new L.FeatureGroup(); //layer contain searched elements
                mymap.addLayer(markersLayer);

                //get the table data
                // getCustomers();

                L.easyButton("fa-compress-arrows-alt", function (btn, map) {
                    var bounds = markersLayer.getBounds();
                    map.flyToBounds(bounds, {padding: [20, 20]});
                }).addTo(mymap);
            },
            error: function (jsonData) {
                console.warn("ERROR in getApiSetting");
            },
        });
    }

    getAPIsettings(); //get it once on startup

}

var markedRow = "";
var markedMarker = "";

function setTheLatLonNew(latlon) {
    if (markedRow !== "") {
        for (let index = 0; index < tableArray.length; index++) {
            const element = tableArray[index];
            if (markedRow[0] === element[0]) {
                markersLayer.clearLayers();
                markedRow = ""; //clear it
                markedMarker = ""; //clear it
                setTable(tableArray);
                mymap.closePopup();
                changes = true;
                releaseWrite();
                break;
            }
        }
    } else if (markedMarker !== "") {
        for (let index = 0; index < tableArray.length; index++) {
            const element = tableArray[index];
            if (markedMarker.lat === element[7] && markedMarker.lng === element[8]) {
                markersLayer.clearLayers();
                markedMarker = ""; //clear it
                markedRow = ""; //clear it
                setTable(tableArray);
                mymap.closePopup();
                changes = true;
                releaseWrite();
                break;
            }
        }
    } else {
        $("#modalImport").text("Keinen Abnehmer ausgewählt!");
        $("#modal-primary").modal("toggle");
    }
}

function delLatLon() {
    for (let index = 0; index < tableArray.length; index++) {
        const element = tableArray[index];
        if (markedMarker.lat === element[7] && markedMarker.lng === element[8]) {
            markersLayer.clearLayers();
            markedMarker = ""; //clear it
            markedRow = ""; //clear it
            setTable(tableArray);
            mymap.closePopup();
            changes = true;
            releaseWrite();
            break;
        }
    }
}

var hhIcon = new L.Icon({
    //own marker icons
    iconUrl: "/dist/images/marker/marker_hh.png",
    shadowUrl: "/dist/images/marker/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

var abnehmerIcon = new L.Icon({
    //own marker icons
    iconUrl: "/dist/images/marker/marker_ab.png",
    shadowUrl: "/dist/images/marker/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

var customOptions = {
    className: "custom",
};

function setAMarker(markerArray) {
    const title = markerArray.title; //value searched
    var loc = markerArray.loc; //position found
    if (markerArray.id > 1000) {
        var marker = new L.Marker(new L.latLng(loc), {
            title: title,
            icon: hhIcon,
        }).on("click", function (e) {
            markedMarker = e.latlng;
        });
    } else {
        var marker = new L.Marker(new L.latLng(loc), {
            title: title,
            icon: abnehmerIcon,
        }).on("click", function (e) {
            markedMarker = e.latlng;
        });
    }
    marker.bindPopup(
        "<div class='text-center'><h6>" +
        title +
        //"</h6><hr class='style1'>" +
        "</h6>" +
        "<b>ID: </b> " +
        markerArray.id +
        "<br><b>Adresse: </b> " +
        markerArray.ad1 +
        " " +
        markerArray.ad2 +
        "<br><b>PLZ/Stadt: </b> " +
        markerArray.plz +
        " - " +
        markerArray.town +
        "<br><b>Land: </b> " +
        markerArray.country +
        "<br><br><b>Latitude: </b>" +
        loc[0] +
        "<br><b>Longitude: </b>" +
        loc[1] +
        "<button type='button' id='abn1' class='btn-xs btn-danger btn-block'>Koordinaten löschen</button>" +
        "</div>",
        customOptions
    );
    markersLayer.addLayer(marker);
}

function writeBackToDB() {
    return $.ajax({
        url: "http://localhost:7000/api/ull",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(tableArray),
        success: function (data) {
            console.warn("Write back to the database: " + data);
            $("#modalImport1").text(
                "Koordinaten erfolgreich in die Datenbank geschrieben!"
            );
            $("#modal-primary1").modal("toggle");
            setTable(tableArray);
        },
    }).then((response) => response.data);
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

function setTable(dataSet) {

    //set marker on map if already something in lat/lon
    dataSet.forEach((element) => {
        if (element[7] !== "") {
            //something is there
            var makeArray = {
                loc: [element[7], element[8]],
                title: element[1],
                id: element[0],
                ad1: element[2],
                ad2: element[3],
                plz: element[4],
                town: element[5],
                country: element[6],
            };
            setAMarker(makeArray);
        }
    });

    //set zoom of map when loaded
    var bounds1 = markersLayer.getBounds();
    mymap.flyToBounds(bounds1, {padding: [20, 20]});
}

function getCustomers(event_trigger_value) {

    $.ajax({
        url: "http://localhost:7000/api/getCustomers",
        dataType: "json",
        success: function (jsonData) {
            //$("#pName").html("<b>Projekt:</b> " + jsonData.pn[0].last);
            customerData = jsonData.cd;
            //projectname
            console.log(customerData);
            boilerhouseData = jsonData.bd;
            tableArray = new Array();
            customerData.forEach((element) => {
                tableArray.push([
                    element.ID,
                    element.name,
                    element.address1,
                    element.address2,
                    element.town,
                    element.plz,
                    element.country,
                    element.lat,
                    element.lon,
                ]);
            });

            boilerhouseData.forEach((element) => {
                tableArray.push([
                    parseInt(element.ID) + 1000,
                    element.name,
                    element.address1,
                    element.address2,
                    element.town,
                    element.plz,
                    element.country,
                    element.lat,
                    element.lon,
                ]);
            });
            //custom marker labels ===
            // console.log(event_trigger_value);
            setTable(tableArray);
        },
        error: function (jsonData) {
            console.warn(jsonData);
        },
    });

}

function getAllhistory() {
    $.ajax({
        url: "http://localhost:7000/api/getAllData",
        dataType: "json",
        success: function (jsonData) {
            // console.log(jsonData)
            customerHistory = jsonData.customer;
            boilerHistory = jsonData.boiler;
            console.log(customerHistory);
            // for (var i = 0; i < customerHistory.length; i++) {
            //
            // }
        }
    });
}

getAllhistory();
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
            if (jsonData.status === "OK") {
                $("#dbIcon").css("color", colorGreen);
                $("#dbText").text("Datenbank OK");
                //also the backend ok
                $("#sIcon").css("color", colorGreen);
                $("#sText").text("Backend OK");
            } else if (jsonData.status === "NOT") {
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

/**
 * when DOM ready load the main function
 */
$(document).ready(function () {
    initMap();
    $(".form_datetime").datetimepicker({
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        forceParse: 0,
        showMeridian: 1
    });


    $("#generate_map").on("click", async function () {
        var start_time = $("#dtp_input1").val();
        var end_time = $("#dtp_input2").val();
        var history_value_type = $(".history_value_type").val();
        var start_time_convert = start_time.split(/-|:| +/);
        var end_time_convert = end_time.split(/-|:| +/);
        var start_time_to_timestamp = (new Date(start_time_convert[0], start_time_convert[1], start_time_convert[2], start_time_convert[3], start_time_convert[4], start_time_convert[5])).getTime();
        var end_time_to_timestamp = (new Date(end_time_convert[0], end_time_convert[1], end_time_convert[2], end_time_convert[3], end_time_convert[4], end_time_convert[5])).getTime();
        // console.log(start_time_to_timestamp, end_time_to_timestamp);

        if (start_time !== "" || end_time !== "") {
            if (end_time_to_timestamp > start_time_to_timestamp) {
                var slider_range = (end_time_to_timestamp - start_time_to_timestamp) / (1000 * 3600 * 24);
                var ticks = [], ticks_labels = [];
                for (var i = start_time_to_timestamp; i < end_time_to_timestamp; i += 86400000) {
                    ticks.push(i);
                    ticks_labels.push(i.toString());
                }
                $("#history_timestamp").slider({
                    animate: true,
                    min: start_time_to_timestamp,
                    max: end_time_to_timestamp,
                    step: 90000,
                    // ticks: ticks,
                    // ticks_labels: ticks_labels,
                    // ticks_snap_bounds: 1000,
                    value: 0,
                    slide: function (event, ui) {
                        var event_trigger_value = ui.value;
                    },
                    // stop: function (event, ui) {
                    //
                    // }
                });
                getCustomers(event_trigger_value);
                var event_trigger_value = $("#history_timestamp").slider("value");

                // getCustomers();
            } else {
                alert('End Time is earlier than Start Time!');
            }
            // console.log(start_time, end_time, history_value_type);
        }

    });
    $("#history_timestamp").slider({
        animate: true,
        // ticks: [0, 100, 200, 300, 400, 500, 600, 700, 800],
        // ticks_labels: ['0', '100', '200', '300', '400', '500', '600', '700', '800'],
        // ticks_snap_bounds: 5,
        value: 0
    });
});
