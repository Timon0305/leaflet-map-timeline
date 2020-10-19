var customerData;
var table;
var tableArray = new Array();
var markersLayer;
var mymap;
var changes = false;

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

function main() {
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
                mymap = L.map("mapid").setView([50, 13], 5);
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
                            //"<hr class='style1'></div>" +
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
                getCustomers();

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

    // console.log("Startup Auswertungstool Verify Lat/Lon complete");
}

var markedRow = "";
var markedMarker = "";

function setTheLatLonNew(latlon) {
    if (markedRow !== "") {
        for (let index = 0; index < tableArray.length; index++) {
            const element = tableArray[index];
            if (markedRow[0] === element[0]) {
                //console.warn("gefunden");
                tableArray[index][7] = latlon.lat.toString();
                tableArray[index][8] = latlon.lon.toString();
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
                //console.warn("gefunden");
                tableArray[index][7] = latlon.lat.toString();
                tableArray[index][8] = latlon.lon.toString();
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
            //console.warn("gefunden");
            tableArray[index][7] = "";
            tableArray[index][8] = "";
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
            //console.warn(e.latlng.lat);
            markedMarker = e.latlng;
        });
    }
    //var marker = new L.Marker(new L.latLng(loc), { title: title , icon: abnehmerIcon});
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

//csv update lat/lon
async function updateLatLon() {
    //setValueFromInput();
    console.log("start update latlon");
    var howMany = tableArray.length;
    var hmNew = 0;
    var hmOld = 0;
    var hmError = 0;

    //for (const rec of tableArray) {
    for (var i = 0; i < tableArray.length; i++) {
        var rec = tableArray[i];

        var query =
            rec[6] + ", " + rec[5] + ", " + rec[4] + ", " + rec[2] + " " + rec[3]; //how it should look like to be best found

        if (rec[7] !== "") {
            //something here so go to the next one
            console.log("already here");
            hmOld++;
            var makeArray = {
                loc: [rec[7], rec[8]],
                title: rec[1],
                id: rec[0],
                ad1: rec[2],
                ad2: rec[3],
                plz: rec[4],
                town: rec[5],
                country: rec[6],
            };

            setAMarker(makeArray);
            continue;
        }
        try {
            const data = await tryToGetGeoData(query);
            console.log("found");
            hmNew++;
            //add to table
            tableArray[i][7] = data[0].lat;
            tableArray[i][8] = data[0].lon;
            //rewdraw the row
            table.row(i).data(tableArray[i]).draw();
            changes = true;
            releaseWrite();
            //add pointer
            var makeArray = {
                loc: [data[0].lat, data[0].lon],
                title: rec[1],
                id: rec[0],
                ad1: rec[2],
                ad2: rec[3],
                plz: rec[4],
                town: rec[5],
                country: rec[6],
            };
            setAMarker(makeArray);

            updateCounter();
        } catch (e) {
            hmError++;
            console.warn(
                "Many requests or some error! You should try it some later.",
                e
            );
            //break; //to the next one
        }
    }
    var errmsg = "";
    if (hmError > 0) {
        errmsg = hmError + " mit Fehler bei der zuweisung!";
    }
    if (hmOld === howMany) {
        //alert("Alle Adressen haben schon Koordinaten zugewiesen!");
        $("#modalImport1").text(
            "Alle Adressen haben schon Koordinaten zugewiesen!!"
        );
        $("#modal-primary1").modal("toggle");
    } else {
        $("#modalImport1").text(
            "Von " +
            howMany +
            " Adressen wurden " +
            hmNew +
            " automatisch zugewiesen und " +
            hmOld +
            " hatten schon Koordinaten hinterlegt. " +
            errmsg +
            " - Änderungen nicht vergessen in die Datenbank zurückzuschreiben!"
        );
        $("#modal-primary1").modal("toggle");
        //set zoom of map when loaded
        var bounds2 = markersLayer.getBounds();
        mymap.flyToBounds(bounds2, {padding: [20, 20]});
    }
}

$("#autoupdate").click(function () {
    updateLatLon();
});

function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), time);
    });
}

function tryToGetGeoData(query, tryCount = 3) {
    return new Promise(async (resolve, reject) => {
        function getData() {
            const proxyurl = "";
            $.get(proxyurl + nominatimAPI + "/search?format=json&q=" + query)
            //$.get(proxyurl + 'http://localhost:8080/search?format=json&q=' + query)
                .done(function (data) {
                    resolve(data);
                })
                .fail(async function (err) {
                    await sleep(500);
                    if (tryCount-- > 0) {
                        getData();
                    } else {
                        reject("Error getting geo data : ", err);
                    }
                });
        }

        getData();
    });
}

function updateCounter() {
    var hm = tableArray.filter((x) => x[7] !== "").length;
    $("#counter").text(
        hm + " von " + tableArray.length + " Einträgen zugewiesen"
    );
    if (hm === tableArray.length) {
        $("#counter").text(
            hm +
            " von " +
            tableArray.length +
            " Einträgen zugewiesen - VOLLSTÄNDIG - Bitte Koordinaten in die Datenbank schreiben"
        );
    }
}

$("#updateDB").click(function () {
    writeBackToDB();
    changes = false;
    releaseWrite();
});

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
    if (table !== undefined) {
        //reset the table if a new dataset will be loaded
        table.clear();
        table.destroy();
    }

    updateCounter();

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

    table = $("#customerTable").DataTable({
        data: dataSet,
        columns: [
            {title: "ID"},
            {title: "Name"},
            {title: "Adresse 1"},
            {title: "Adresse 2"},
            {title: "Stadt"},
            {title: "Postleitzahl"},
            {title: "Land"},
            {title: "Latitude"},
            {title: "Longitude"},
        ],
        language: {
            url: "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/German.json",
        },
        lengthMenu: [5, 25, 50, 100],
        pageLength: 5,
        scrollX: true,
        scrollY: "185px",
        scrollCollapse: false,
        paging: false,
        info: false,
    });

    $("#customerTable tbody")
        .off("click")
        .on("click", "tr", function () {
            //first turn off the event (click) to prevent multiple clicks/events on a row after rebuild the table
            if ($(this).hasClass("selected")) {
                $(this).removeClass("selected");
            } else {
                table.$("tr.selected").removeClass("selected");
                $(this).addClass("selected");
            }
            console.warn("clicked a row", table.row(this).data());
            markedRow = table.row(this).data();

            //get to the point when clicked in the table
            if (table.row(this).data()[7] !== "") {
                mymap.flyTo([table.row(this).data()[7], table.row(this).data()[8]], 17);
            }

            //open the clicked popup from this marker/abnehmer
            //var latlon = new L.LatLng(table.row(this).data()[7], table.row(this).data()[8]);
            var flat = table.row(this).data()[7];
            var flng = table.row(this).data()[8];

            markersLayer.eachLayer(function (layer) {
                //layer.openPopup();
                if (layer._latlng.lat === flat) {
                    layer.openPopup();
                }
            });
        });

    //set zoom of map when loaded
    var bounds1 = markersLayer.getBounds();
    mymap.flyToBounds(bounds1, {padding: [20, 20]});
}

function getCustomers() {
    $.ajax({
        url: "http://localhost:7000/api/getCustomers",
        dataType: "json",
        success: function (jsonData) {
            //projectname
            //console.log(jsonData);
            //$("#pName").html("<b>Projekt:</b> " + jsonData.pn[0].last);
            customerData = jsonData.cd;
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

            setTable(tableArray);
        },
        error: function (jsonData) {
            console.warn(jsonData);
        },
    });
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
//DB connection Test
/*---------------------------------------*/

/**
 * when DOM ready load the main function
 */
$(document).ready(main);
