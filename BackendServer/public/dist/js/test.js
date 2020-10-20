//==================Global Map Variables ======================
var slider_data_format = {
    "type": "FeatureCollection",
    "features": []
};
var markersLayer;
var chart_customer_data_format = {"historyData": {}};
var chart_boiler_data_format = {"historyData": {}};

//------------------------------

var sliderControl = null;
var customOptions = {
    className: "custom",
};
var hhIcon = new L.Icon({
    //own marker icons
    iconUrl: "/dist/images/marker/marker_hh.png",
    // shadowUrl: "/dist/images/marker/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

var abnehmerIcon = new L.Icon({
    //own marker icons
    iconUrl: "/dist/images/marker/marker_ab.png",
    // shadowUrl: "/dist/images/marker/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
var customerHistory, boilerHistory, customerData, boilerData;
/*************************************************************/
//============****** Global Chart Variables ********* ==============
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

var colors = Highcharts.getOptions().colors;

var chart;
//*****************************************
var slideMap = null;
let initMap = (slider_data_format, history_value_type) => {
    var custom_marker;

    function getAPIsettings() {
        if (slideMap !== null && slideMap !== undefined) {
            slideMap.remove();
        }
        $.ajax({
            url: "http://localhost:7000/api/getApiSettings",
            dataType: "json",
            success: function (jsonData) {
                tilesAPI = jsonData.KartenTiles;
                nominatimAPI = jsonData.Nominatim;

                if (slider_data_format.features.length > 0) {
                    //sort date time
                    slider_data_format.features.sort(function (a, b) {
                        return (a.properties.DateStart > b.properties.DateStart);
                    });

                    slideMap = L.map("timeSlider", {
                        zoom: 10,
                        center: [47.13498225, 14.310545998145553],
                        timeDimension: true,
                        timeDimensionControl: true,
                    });
                    L.tileLayer(tilesAPI + "/{z}/{x}/{y}.png", {
                        attribution:
                            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    }).addTo(slideMap);
                    //Create a marker layer (in the example done via a GeoJSON FeatureCollection)


                    var sliderControl = null;

                    var testlayer = L.geoJson(slider_data_format, {
                        pointToLayer: function (feature, latlng) {
                            if (parseInt(feature.properties.GPSID) > 1000) {
                                return new L.Marker(latlng, {icon: hhIcon});
                            } else {
                                return new L.Marker(latlng, {icon: abnehmerIcon});
                            }
                        },
                        onEachFeature: function (feature, layer) {
                            switch (parseInt(history_value_type)) {
                                case 1:
                                    layer.bindPopup("<div class='text-left'><h6>" + feature.properties.name + "</h6> <b>Latitude:  </b>" +
                                        feature.geometry.coordinates[1] +
                                        "<br><b>Longitude:  </b>" +
                                        feature.geometry.coordinates[0] +
                                        "<br><b>primVL:  </b>" + feature.properties.primVL +
                                        "<br><b>primRL:  </b>" + feature.properties.primRL +
                                        "<br><b>leistung:  </b>" + feature.properties.leistung +
                                        "<br><b>durchluss:  </b>" + feature.properties.durchluss +
                                        "<br><b>aussenTemp:  </b>" + feature.properties.aussenTemp
                                    );
                                    break;
                                case 2:
                                    layer.bindPopup("<div class='text-center'><h6>" + feature.properties.name + "</h6> <b>Latitude:  </b>" +
                                        feature.geometry.coordinates[1] +
                                        "<br><b>Longitude:  </b>" +
                                        feature.geometry.coordinates[0] +
                                        "<br><b>sekVLSoll:  </b>" + feature.properties.sekVLSoll +
                                        "<br><b>sekVLIst:  </b>" + feature.properties.sekVLIst +
                                        "<br><b>aussenTemp:  </b>" + feature.properties.aussenTemp
                                    );

                                    break;
                                case 3:
                                    layer.bindPopup("<div class='text-center'><h6>" + feature.properties.name + "</h6> <b>Latitude:  </b>" +
                                        feature.geometry.coordinates[1] +
                                        "<br><b>Longitude:  </b>" +
                                        feature.geometry.coordinates[0] +
                                        "<br><b>t1:  </b>" + feature.properties.t1 +
                                        "<br><b>t2:  </b>" + feature.properties.t2 +
                                        "<br><b>t3:  </b>" + feature.properties.t3
                                    );

                                    break;
                                case 4:
                                    layer.bindPopup("<div class='text-center'><h6>" + feature.properties.name + "</h6> <b>Latitude:  </b>" +
                                        feature.geometry.coordinates[1] +
                                        "<br><b>Longitude:  </b>" +
                                        feature.geometry.coordinates[0] +
                                        "<br><b>energie:  </b>" + feature.properties.energie
                                    );
                                    break;
                            }
                        },
                    });//.addTo(slideMap);

                    /*****************************************/
                    /*****************************************/

                    sliderControl = L.control.sliderControl({
                        position: "bottomleft",
                        layer: testlayer,
                        range: false,
                        // timeAttribute: "DateStart",
                        showAllOnStart: false,
                    });

                    // L.timeDimension.layer.geoJson(slider_data_format).addTo(slideMap);
                    //Make sure to add the slider to the map ;-)
                    slideMap.addControl(sliderControl);
                    //And initialize the slider
                    sliderControl.startSlider();
                }
            },
            error: function (e) {
                console.warn(e);
            }
        });
    }

    getAPIsettings(slider_data_format);

};

//===Get Data for map markers. customer, boiler, history, boilerhistory.

function getAllhistory() {
    $.ajax({
        url: "http://localhost:7000/api/getAllData",
        dataType: "json",
        success: function (jsonData) {
            customerHistory = jsonData.customer;
            boilerHistory = jsonData.boiler;
        },
        error: function (jsonData) {
            console.warn(jsonData);
        },
    });
}

getAllhistory();

function getMetaData() {

    $.ajax({
        url: "http://localhost:7000/api/getCustomers",
        dataType: "json",
        success: function (jsonData) {
            customerData = jsonData.cd;
            //projectname
            boilerData = jsonData.bd;
            customerData.forEach((element) => {
                $(".total_service_number").append("<option value='" + element.name + "'>" + element.name + "</option>");
            });
            boilerData.forEach((element) => {
                $(".total_service_number").append("<option value='" + element.name + "'>" + element.name + "</option>");
            });
        },
        error: function (jsonData) {
            console.warn(jsonData);
        },
    });

}

getMetaData();

function dataformat_fuc(history_value_type, start_time_set_value, end_time_set_value) {
    var customer_marker_number = customerData.length;
    var boiler_marker_number = boilerData.length;
    for (var i = 0; i < customer_marker_number; i++) {

        customerHistory.forEach((element) => {

            if (parseInt(element.customerId) === parseInt(customerData[i].ID)) {

                var start_time = element.time;
                var start_time_timestamp = new Date(start_time);
                var end_time_timestamp = new Date(start_time);
                end_time_timestamp.setMinutes(start_time_timestamp.getMinutes() + 14);
                end_time_timestamp.setSeconds(start_time_timestamp.getSeconds() + 59);
                end_time_timestamp.setTime(end_time_timestamp.valueOf() + end_time_timestamp.getTimezoneOffset() * 60 * 1000);
                start_time_timestamp.setTime(start_time_timestamp.valueOf() + start_time_timestamp.getTimezoneOffset() * 60 * 1000);
                if (start_time_set_value < start_time_timestamp && end_time_set_value > end_time_timestamp) {
                    switch (parseInt(history_value_type)) {
                        case 1:
                            slider_data_format.features.push({
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [parseFloat(customerData[i].lon), parseFloat(customerData[i].lat)]
                                },
                                "properties": {
                                    "GPSID": element.customerId,
                                    "time": (new Date(start_time_timestamp)).toString(),
                                    "DateClosed": (new Date(end_time_timestamp)).toString(),
                                    "primVL": element.primVL,
                                    "primRL": element.primRL,
                                    "leistung": element.leistung,
                                    "durchluss": element.durchluss,
                                    "aussenTemp": element.aussenTemp,
                                    "name": customerData[i].name
                                }
                            });
                            break;
                        case 2:
                            slider_data_format.features.push({
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [parseFloat(customerData[i].lon), parseFloat(customerData[i].lat)]
                                },
                                "properties": {
                                    "GPSID": (parseInt(element.customerId) + 1000).toString(),
                                    "time": start_time_timestamp.toString(),
                                    "DateClosed": end_time_timestamp.toString(),
                                    "sekVLSoll": element.sekVLSoll,
                                    "sekVLIst": element.sekVLIst,
                                    "aussenTemp": element.aussenTemp,
                                    "name": customerData[i].name
                                }
                            });
                            break;
                        case 3:
                            slider_data_format.features.push({
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [parseFloat(customerData[i].lon), parseFloat(customerData[i].lat)]
                                },
                                "properties": {
                                    "GPSID": element.customerId,
                                    "time": start_time_timestamp.toString(),
                                    "DateClosed": end_time_timestamp.toString(),
                                    "t1": element.t1,
                                    "t2": element.t2,
                                    "t3": element.t3,
                                    "name": customerData[i].name
                                }
                            });
                            break;
                        case 4:
                            slider_data_format.features.push({
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [parseFloat(customerData[i].lon), parseFloat(customerData[i].lat)]
                                },
                                "properties": {
                                    "GPSID": element.customerId,
                                    "time": start_time_timestamp.toString(),
                                    "DateClosed": end_time_timestamp.toString(),
                                    "energie": element.energie,
                                    "name": customerData[i].name
                                }
                            });
                            break;
                    }
                }

            }
        })
    }

    for (var j = 0; j < boiler_marker_number; j++) {
        boilerHistory.forEach((element) => {
            if (parseInt(element.ID) === parseInt(boilerData[j].ID)) {
                var start_time = element.time;
                var start_time_timestamp = new Date(start_time);
                var end_time_timestamp = new Date(start_time);
                end_time_timestamp.setMinutes(start_time_timestamp.getMinutes() + 14);
                end_time_timestamp.setSeconds(start_time_timestamp.getSeconds() + 59);
                end_time_timestamp.setTime(end_time_timestamp.valueOf() + end_time_timestamp.getTimezoneOffset() * 60 * 1000);
                start_time_timestamp.setTime(start_time_timestamp.valueOf() + start_time_timestamp.getTimezoneOffset() * 60 * 1000);

                if (start_time_set_value < start_time_timestamp && end_time_set_value > end_time_timestamp) {
                    switch (parseInt(history_value_type)) {
                        case 1:
                            slider_data_format.features.push({
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [parseFloat(boilerData[j].lon), parseFloat(boilerData[j].lat)]
                                },
                                "properties": {
                                    "GPSID": (element.ID + 1000),
                                    "time": start_time_timestamp.toString(),
                                    "DateClosed": end_time_timestamp.toString(),
                                    "primVL": element.primVL,
                                    "primRL": element.primRL,
                                    "leistung": element.leistung,
                                    "durchluss": element.durchluss,
                                    "aussenTemp": element.aussenTemp,
                                    "name": boilerData[j].name
                                }
                            });
                            break;
                        case 2:
                            slider_data_format.features.push({
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [parseFloat(boilerData[j].lon), parseFloat(boilerData[j].lat)]
                                },
                                "properties": {
                                    "GPSID": element.customerId,
                                    "time": start_time_timestamp.toString(),
                                    "DateClosed": end_time_timestamp.toString(),
                                    "sekVLSoll": element.sekVLSoll,
                                    "sekVLIst": element.sekVLIst,
                                    "aussenTemp": element.aussenTemp,
                                    "name": boilerData[j].name
                                }
                            });
                            break;
                        case 3:
                            slider_data_format.features.push({
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [parseFloat(boilerData[j].lon), parseFloat(boilerData[j].lat)]
                                },
                                "properties": {
                                    "GPSID": element.customerId,
                                    "time": start_time_timestamp.toString(),
                                    "DateClosed": end_time_timestamp.toString(),
                                    "t1": element.t1,
                                    "t2": element.t2,
                                    "t3": element.t3,
                                    "name": boilerData[j].name
                                }
                            });
                            break;
                        case 4:
                            slider_data_format.features.push({
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [parseFloat(boilerData[j].lon), parseFloat(boilerData[j].lat)]
                                },
                                "properties": {
                                    "GPSID": element.customerId,
                                    "time": start_time_timestamp.toString(),
                                    "DateClosed": end_time_timestamp.toString(),
                                    "energie": element.energie,
                                    "name": boilerData[j].name
                                }
                            });
                            break;
                    }
                }
            }
        })
    }
    if (slider_data_format.features.length > 0) {
        $("#timeSlider").css('display', 'block');
        initMap(slider_data_format, history_value_type);
    } else {
        alert("I can not found matched data from Database!");
    }

}

//*****************************************************

//Global Functions for Chart
function testF(customer_type, history_value_type) {
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
    let dataSeries;
    switch (parseInt(history_value_type)) {
        case 1:
            dataSeries = [
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
                }
            ];
            break;
        case 2:
            dataSeries = [
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
                }
            ];
            break;
        case 3:
            dataSeries = [
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
                }
            ];
            break;
        case 4:
            dataSeries = [

                {
                    yAxis: 0,
                    data: energie,
                    lineWidth: 0.5,
                    name: "energie",
                    tooltip: {
                        valueDecimals: 0,
                        valueSuffix: " kWh",
                    },
                }
            ];
            break;
    }


    //console.time('line');
    var customer_marker_number = customerData.length;
    var boiler_marker_number = boilerData.length;

    for (var i = 0; i < customer_marker_number; i++) {
        if (customerData[i].name === customer_type) {
            chart = Highcharts.chart("chart_container", {
                boost: {
                    enabled: true,
                },
                chart: {
                    zoomType: "x",
                },

                title: {
                    text: customerData[i].name,
                },

                subtitle: {
                    text:
                        "Berechnete Spreizung: " +
                        customerData[i].calcDiffTemp +
                        " K | Maximale Leistung: " +
                        customerData[i].maxLeistung +
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
                    },
                ],

                colors: colors,
                series: dataSeries,
            });
        }
        // if (customerData.name !== "" && customerData.name !==null) {
    }


    for (var j = 0; j < boiler_marker_number; j++) {
        if (boilerData[j].name === customer_type) {
            chart = Highcharts.chart("chart_container", {
                boost: {
                    enabled: true,
                },
                chart: {
                    zoomType: "x",
                },

                title: {
                    text: boilerData[j].name,
                },

                subtitle: {
                    text:
                        "Berechnete Spreizung: " +
                        boilerData[j].calcDiffTemp +
                        " K | Maximale Leistung: " +
                        boilerData[j].maxLeistung +
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

                    },
                ],

                colors: colors,
                series: dataSeries,
            });
        }

    }
    // console.log(dataSeries);
    //console.timeEnd('line');
    $("#chartDivLoad").remove();
    $("#chartTitle").html('<i class="fas fa-chart-line mr-1"></i> Chart Anzeige');
    // $("#drawChart").prop("disabled", true); //release the draw chart button
}

function chart_data_format(history_value_type, start_time_set_value, end_time_set_value, customer_type) {
    let start1 = new Date().getTime();
    let data1Temp;
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
    var customer_marker_number = customerData.length;
    var boiler_marker_number = boilerData.length;
    for (var i = 0; i < customer_marker_number; i++) {
        if (customerData[i].name === customer_type) {
            customerHistory.forEach((element) => {
                if (parseInt(element.customerId) === parseInt(customerData[i].ID)) {
                    var start_time = element.time;
                    var start_time_timestamp = new Date(start_time);
                    var end_time_timestamp = new Date(start_time);
                    end_time_timestamp.setMinutes(start_time_timestamp.getMinutes() + 15);
                    end_time_timestamp.setTime(end_time_timestamp.valueOf() + end_time_timestamp.getTimezoneOffset() * 60 * 1000);
                    start_time_timestamp.setTime(start_time_timestamp.valueOf() + start_time_timestamp.getTimezoneOffset() * 60 * 1000);
                    if (start_time_set_value < start_time_timestamp && end_time_set_value > end_time_timestamp) {

                        statusMsgParse.primVL = [element.primVL, element.primVL];
                        statusMsgParse.primRL = [element.primRL, element.primRL];
                        statusMsgParse.sekVLSoll = [element.sekVLSoll, element.sekVLSoll];
                        statusMsgParse.sekVLIst = [element.sekVLSoll, element.sekVLSoll];
                        statusMsgParse.aussenTemp = [
                            element.aussenTemp,
                            element.aussenTemp,
                        ];
                        statusMsgParse.durchfluss = [
                            element.durchluss,
                            element.durchluss,
                        ];
                        statusMsgParse.leistung = [element.leistung, element.leistung];
                        statusMsgParse.energie = [element.energie, element.energie];
                        statusMsgParse.t1 = [element.t1, element.t1];
                        statusMsgParse.t2 = [element.t2, element.t2];
                        statusMsgParse.t3 = [element.t3, element.t3];
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

                        //fill data for chart
                        var tempDate = new Date(start_time_timestamp).getTime();
                        primVL.push([tempDate, element.primVL]);
                        primRL.push([tempDate, element.primRL]);
                        sekVLSoll.push([tempDate, element.sekVLSoll]);
                        sekVLIst.push([tempDate, element.sekVLIst]);
                        aussenTemp.push([tempDate, element.aussenTemp]);
                        durchfluss.push([tempDate, element.durchluss]);
                        leistung.push([tempDate, element.leistung]);
                        energie.push([tempDate, element.energie]);
                        t1.push([tempDate, element.t1]);
                        t2.push([tempDate, element.t2]);
                        t3.push([tempDate, element.t3]);
                    }
                }
            });

        }
    }

    for (var j = 0; j < boiler_marker_number; j++) {
        if (boilerData[j].name === customer_type) {
            boilerHistory.forEach((element) => {
                if (parseInt(element.ID) === parseInt(boilerData[j].ID)) {
                    var start_time = element.time;
                    var start_time_timestamp = new Date(start_time);
                    var end_time_timestamp = new Date(start_time);
                    end_time_timestamp.setMinutes(start_time_timestamp.getMinutes() + 15);
                    end_time_timestamp.setTime(end_time_timestamp.valueOf() + end_time_timestamp.getTimezoneOffset() * 60 * 1000);
                    start_time_timestamp.setTime(start_time_timestamp.valueOf() + start_time_timestamp.getTimezoneOffset() * 60 * 1000);
                    if (start_time_set_value < start_time_timestamp && end_time_set_value > end_time_timestamp) {
                        statusMsgParse.primVL = [element.primVL, element.primVL];
                        statusMsgParse.primRL = [element.primRL, element.primRL];
                        statusMsgParse.sekVLSoll = [element.sekVLSoll, element.sekVLSoll];
                        statusMsgParse.sekVLIst = [element.sekVLSoll, element.sekVLSoll];
                        statusMsgParse.aussenTemp = [
                            element.aussenTemp,
                            element.aussenTemp,
                        ];
                        statusMsgParse.durchfluss = [
                            element.durchluss,
                            element.durchluss,
                        ];
                        statusMsgParse.leistung = [element.leistung, element.leistung];
                        statusMsgParse.energie = [element.energie, element.energie];
                        statusMsgParse.t1 = [element.t1, element.t1];
                        statusMsgParse.t2 = [element.t2, element.t2];
                        statusMsgParse.t3 = [element.t3, element.t3];
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

                        //fill data for chart
                        var tempDate = new Date(start_time_timestamp).getTime();
                        primVL.push([tempDate, element.primVL]);
                        primRL.push([tempDate, element.primRL]);
                        sekVLSoll.push([tempDate, element.sekVLSoll]);
                        sekVLIst.push([tempDate, element.sekVLIst]);
                        aussenTemp.push([tempDate, element.aussenTemp]);
                        durchfluss.push([tempDate, element.durchluss]);
                        leistung.push([tempDate, element.leistung]);
                        energie.push([tempDate, element.energie]);
                        t1.push([tempDate, element.t1]);
                        t2.push([tempDate, element.t2]);
                        t3.push([tempDate, element.t3]);
                    }
                }
            });

        }
    }

    primVL.sort();
    primRL.sort();
    sekVLSoll.sort();
    sekVLIst.sort();
    aussenTemp.sort();
    durchfluss.sort();
    leistung.sort();
    energie.sort();
    t1.sort();
    t2.sort();
    t3.sort();
    statusMsgParse.file1row = primVL.length;

    statusMsgParse.file1time = (new Date().getTime() - start1) / 1000;
    data1Ready = true;

    testF(customer_type, history_value_type);
}

//check the connection to the Influx DB
function getInfoDB() {
    $.ajax({
        url: "http://localhost:7000/api/getInfo",
        dataType: "json",
        success: function (jsonData) {
            // console.log(getInfoDB());
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

$(document).ready(() => {
    // initMap(slider_data_format);

    //==== date picker ========
    $(".form_datetime").datetimepicker({
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        forceParse: 0,
        showMeridian: 1
    });
    //===== generate Map ======
    $("#generate_map").on("click", function () {
        var start_time = $("#dtp_input1").val();
        var end_time = $("#dtp_input2").val();
        var history_value_type = $(".history_value_type").val();
        var start_time_convert = start_time.split(/-|:| +/);
        var end_time_convert = end_time.split(/-|:| +/);
        var start_time_set_value = new Date(start_time_convert[0], --start_time_convert[1], start_time_convert[2], start_time_convert[3], start_time_convert[4], start_time_convert[5]);
        var end_time_set_value = new Date(end_time_convert[0], --end_time_convert[1], end_time_convert[2], end_time_convert[3], end_time_convert[4], end_time_convert[5]);
        var start_time_to_timestamp = (start_time_set_value).getTime();
        var end_time_to_timestamp = (end_time_set_value).getTime();

        if (start_time !== "" || end_time !== "") {
            if (end_time_to_timestamp > start_time_to_timestamp) {
                dataformat_fuc(history_value_type, start_time_set_value, end_time_set_value);
            } else {
                alert("End Time must later than Start Time.!");
            }
        } else {
            alert("please enter Time line!");
        }
    });


    //====== generate Chart ======
    $("#generate_chart").on("click", function () {
        // $("#chart_container").css("display", "block");
        var start_time = $("#dtp_chart_input1").val();
        var end_time = $("#dtp_chart_input2").val();
        var history_value_type = $(".history_chart_value_type").val();
        var start_time_convert = start_time.split(/-|:| +/);
        var end_time_convert = end_time.split(/-|:| +/);
        var start_time_set_value = new Date(start_time_convert[0], --start_time_convert[1], start_time_convert[2], start_time_convert[3], start_time_convert[4], start_time_convert[5]);
        var end_time_set_value = new Date(end_time_convert[0], --end_time_convert[1], end_time_convert[2], end_time_convert[3], end_time_convert[4], end_time_convert[5]);
        var start_time_to_timestamp = (start_time_set_value).getTime();
        var end_time_to_timestamp = (end_time_set_value).getTime();
        var customer_type = $(".total_service_number").val();

        if (start_time !== "" || end_time !== "") {
            if (end_time_to_timestamp > start_time_to_timestamp) {
                $("#chartDiv").append(
                    '<div id="chartDivLoad" class="overlay dark"><i class="fas fa-2x fa-sync-alt fa-spin"></i></div>'
                ); //not working
                $("#chartTitle").html(
                    '<span id="chartTitleSpinner" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Zeichne Chart...'
                );
                if (chart !== undefined) {
                    //first start undefined
                    chart.destroy();
                }
                chart_data_format(history_value_type, start_time_set_value, end_time_set_value, customer_type);
                // dataformat_fuc(history_value_type, start_time_set_value, end_time_set_value);
            } else {
                alert("End Time must later than Start Time.!");
            }
        } else {
            alert("please enter Time line!");
        }
    })
});
