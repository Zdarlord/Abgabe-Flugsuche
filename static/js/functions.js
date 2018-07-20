/*** Main Script ***/
var flightSearch = new FlightSearchAPI();
var params = {
    from: document.getElementById('from').value,
    to: document.getElementById('to').value
};
// Display All available airports
flightSearch.requestAPI('/airports/all', params, successCallback);

//------------------------------------------------------------------------------

/** API functions **/
function FlightSearchAPI() {
    this.endpoint = 'http://flights.eliashenrich.de/api.php';

    this.requestAPI = function(action, data, callback) {
        var url = this.endpoint + '?action=' + action;

        var keys = Object.keys(data);
        for (var i = 0; i < keys.length; i++) {
            var paramName = keys[i];
            var paramValue = data[keys[i]];

            url += "&" + paramName + "=" + paramValue;
        }

        var request = new XMLHttpRequest();

        request.onreadystatechange = function() {
            console.log("Status hat sich geändert", this.readyState);

            // Ist die Anfrage beendet?
            if (this.readyState === 4) {
                // Http-Statuscode prüfen
                if (this.status === 200) {
                    console.log("Anfrage erfolgreich: " + action);
                    console.log(this.responseText);

                    callback(this.responseText, action);
                }
            }
        };

        request.open('GET', url, true);
        request.send();
    };
}

function successCallback(data, action) {
    var response = JSON.parse(data);

    if (action == '/route/find') {
        for (var i = 0; i < response.length; i++) {
            var flug = response[i];

            console.log("Flug " + i);

            for (var j = 0; j < flug.length; j++) {
                var leg = flug[j];

                console.log("Leg " + j, leg);

                var airportFrom = leg.airportFrom.CityName;
                var airportTo = leg.airportTo.CityName;
                var latFrom = leg.airportFrom.PositionLat;
                var lonFrom = leg.airportFrom.PositionLon;
                var latTo = leg.airportTo.PositionLat;
                var lonTo = leg.airportTo.PositionLon;
                if(leg.schedule[j]){
                    var depTime = leg.schedule[j].ScheduledDepartureTime;
                    var arrTime = leg.schedule[j].ScheduledArrivalTime;
                }

                addListItemRoute(airportFrom, latFrom, lonFrom, airportTo, latTo, lonTo, depTime, arrTime);
            }
        }
    }

    if (action == '/airports/all') {
        if (response) {
            var result = {};

            for (var i = 0; i < response.data.length; i++) {
                var obj = response.data[i];
                addListItemAirport(obj.Id, obj.CodeIATA, obj.CityName, obj.PositionLat, obj.PositionLon)
            }
        }
    }
}

//------------------------------------------------------------------------------

/*** General functions ***/
function showOverlay() {
    var params = {
        from: document.getElementById('from').value,
        to: document.getElementById('to').value
    };
    var start = mapAirportCodeToName(params.from);
    var startId = mapAirportCodeToId(params.from);
    var destination = mapAirportCodeToName(params.to);
    var destinationId = mapAirportCodeToId(params.to);
    var startLon = mapAirportCodeToLon(params.from);
    var startLat = mapAirportCodeToLat(params.from);
    var destinationLon = mapAirportCodeToLon(params.to);
    var destinationLat = mapAirportCodeToLat(params.to);
    params.from = startId;
    params.to = destinationId;
    //console.log("startLon"+startLon+"startLat"+startLat+"destinationLon"+destinationLon+"destinationLat"+destinationLat);

    // Get Routes between aiports
    flightSearch.requestAPI('/route/find', params, successCallback);
    return false;

    var element = document.getElementById('waitOverlayWrapper');
    element.style.display = "block";
    return false;
}

function hideOverlay() {
    var element = document.getElementById('waitOverlayWrapper');
    element.style.display = 'none';
}

function addListItemRoute(airportFrom, latFrom, lonFrom, airportTo, latTo, lonTo, departureTime, arrivalTime) {

    var listItem = document.getElementById('listDummyRoute');

    // Listenelement klonen und neu einfügen
    var newListItem = listItem.cloneNode(true);
    newListItem.setAttribute('id', '');
    newListItem.classList.remove('hidden');


    // Kindelement des neuen Knotens bearbeiten
    newListItem.getElementsByClassName('flightFrom')[0].innerText = airportFrom;
    newListItem.getElementsByClassName('latFrom')[0].innerText = latFrom;
    newListItem.getElementsByClassName('lonFrom')[0].innerText = lonFrom;
    newListItem.getElementsByClassName('flightTo')[0].innerText = airportTo;
    newListItem.getElementsByClassName('latTo')[0].innerText = latTo;
    newListItem.getElementsByClassName('lonTo')[0].innerText = lonTo;
    newListItem.getElementsByClassName('timeDeparture')[0].innerText = departureTime.substr(0, 5);
    newListItem.getElementsByClassName('timeArrival')[0].innerText = arrivalTime.substr(0, 5);

    document.getElementById('flightList').appendChild(newListItem);

}

function addListItemAirport(id, code, city, lat, lon) {

    var listItem = document.getElementById('listDummyAirport');

    // Listenelement klonen und neu einfügen
    var newListItem = listItem.cloneNode(true);
    newListItem.setAttribute('id', '');
    newListItem.classList.remove('hidden');

    // Kindelement des neuen Knotens bearbeiten
    newListItem.getElementsByClassName('airportId')[0].innerText = id;
    newListItem.getElementsByClassName('airportCode')[0].innerText = code;
    newListItem.getElementsByClassName('airportName')[0].innerText = city;
    newListItem.getElementsByClassName('airportLat')[0].innerText = lat;
    newListItem.getElementsByClassName('airportLon')[0].innerText = lon;

    document.getElementById('airportList').appendChild(newListItem);

}

function mapAirportCodeToName(code) {
    code = code + "";
    var result = "";

    var airportCodes = document.getElementsByClassName('airportCode');
    var airportNames = document.getElementsByClassName('airportName');

    for (var i = 1; i < airportCodes.length; i++) {
        if (airportCodes[i].innerText == code) {
            result = airportNames[i].innerText;
        }
    }
    return result;
}

function mapAirportCodeToId(code) {
    code = code + "";
    var result = null;

    var airportCodes = document.getElementsByClassName('airportCode');
    var airportId = document.getElementsByClassName('airportId');

    for (var i = 1; i < airportCodes.length; i++) {
        if (airportCodes[i].innerText == code) {
            result = airportId[i].innerText;
        }
    }
    return result;
}

function mapAirportCodeToLon(code) {
    code = code + "";
    var result = null;

    var airportCodes = document.getElementsByClassName('airportCode');
    var airportLon = document.getElementsByClassName('airportLon');

    for (var i = 1; i < airportCodes.length; i++) {
        if (airportCodes[i].innerText == code) {
            result = airportLon[i].innerText;
        }
    }
    return result;
}

function mapAirportCodeToLat(code) {
    code = code + "";
    var result = null;

    var airportCodes = document.getElementsByClassName('airportCode');
    var airportLat = document.getElementsByClassName('airportLat');

    for (var i = 1; i < airportCodes.length; i++) {
        if (airportCodes[i].innerText == code) {
            result = airportLat[i].innerText;
        }
    }
    return result;
}