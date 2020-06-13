
function modifyMomentLocale() {
    moment.updateLocale('en', {
        relativeTime: {
            future : '%s',
            past   : '<span class="smaller">lähti</span>',
            s: function (number, withoutSuffix) {
            return '<span class="smaller">nyt</span>';
            },
            m  : '1<span class="smaller"> min</span>',
            mm : '%d<span class="smaller"> min</span>',
            h  : '1<span class="smaller"> h</span>',
            hh : '%d<span class="smaller"> h</span>',
            d  : '1 pv',
            dd : '%d pv',
            M  : '1 kk',
            MM : '%d kk',
            y  : '1 v',
            yy : '%d v'
        }
    });
}

function getJson(url, callback) {
    const Http = new XMLHttpRequest();
    Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
            const jsonData = JSON.parse(Http.responseText);
            callback(jsonData);
        }
    }
    Http.open("GET", url);
    Http.send();
}

function renderTableHeader(trainListElement) {
    const header = document.createElement('tr');
    header.innerHTML = '<th class="eta">Lähtee</th><th>Raide</th><th>Juna</th><th>Lähtee</th><th>Perillä &#x25BE;</th>';
    trainListElement.appendChild(header);
}

function getTrainName(train) {
    if (train.commuterLineID) {
        return train.commuterLineID;
    }
    else {
        return train.trainType + train.trainNumber;
    }
}

function renderTableRow(train, trainListElement) {
    const fromStation = train.timeTableRows[0];
    const toStation = train.timeTableRows[1];
    const row = `
        <td class="eta">${moment(fromStation.liveEstimateTime).fromNow()}</td>
        <td class="track">${fromStation.commercialTrack}</td>
        <td class="line"><a href="https://www.junat.net/fi/juna/${train.trainNumber}/${train.departureDate}/">${getTrainName(train)}</a></td>
        <td class="deptime">${moment(fromStation.liveEstimateTime).format("HH:mm")}</td>
        <td class="arrtime">${moment(toStation.liveEstimateTime).format("HH:mm")}</td>
    `;

    const rowElement = document.createElement('tr');
    rowElement.innerHTML = row;
    trainListElement.appendChild(rowElement);
}

function main() {
    modifyMomentLocale();
    const stationHeadingElement = document.getElementById("stationHeading");

    const urlParams = new URLSearchParams(window.location.search);
    const fromStationCode = urlParams.get('from');
    const toStationCode = urlParams.get('to');

    if (!fromStationCode || !toStationCode) {
        console.error("From and to query parameters not given");
        stationHeadingElement.innerHTML = `Syötä queryparametrit oikein!`;
        return;
    }

    stationHeadingElement.innerHTML = `${fromStationCode} &#129030; ${toStationCode}`;

    //const fromStationCode = "TKL";
    //const toStationCode = "HKI";
    const maxDepartingTrains = "30";
    const url = `https://rata.digitraffic.fi/api/v1/live-trains/station/${fromStationCode}?arrived_trains=0&arriving_trains=0&departed_trains=0&departing_trains=${maxDepartingTrains}&include_nonstopping=false`;

    getJson(url, (response) => {
        //console.debug(JSON.stringify(response, null, 2));

        // Only show commuter trains that are traveling from fromStationCode to toStationCode
        // TODO To show only upcoming trains, we filter by liveEstimateTime. This has a side-effect that trains that do not have liveEstimate are not shown at all.
        // We should instead compare timestamps against now time (or check that actualTime must not be present), and show either liveEstimateTime or scheduledTime.
        // TODO When showing scheduledTimes, you must then filter out cancelled trains
        // FYI train waiting for depart => non-running train
        const trains = response.filter(train =>
            ["Commuter", "Long-distance"].includes(train.trainCategory) && (
                train.timeTableRows = train.timeTableRows.filter(
                    station =>
                        (station.stationShortCode == fromStationCode && station.type == "DEPARTURE" && station.liveEstimateTime) ||
                        (station.stationShortCode == toStationCode && station.type == "ARRIVAL" && station.liveEstimateTime)
                )
            ).length > 1);


        // Sort trains by destination arrival time
        trains.sort(function(a, b) {
            return moment(a.timeTableRows[1].liveEstimateTime) - moment(b.timeTableRows[1].liveEstimateTime);
        });

        const trainListElement = document.getElementById("trainList");
        renderTableHeader(trainListElement);

        trains.forEach(train => {
            // After filtering in previous stage, each train should have exactly 2 stops, the from and to stations the user is interested in.
            if (train.timeTableRows.length != 2) {
                console.error(`Train ${train.trainNumber} has ${train.timeTableRows.length} interesting stops.`);
                console.log(JSON.stringify(train));
            }
            // From and to stations should be in travel order, according to API specification.
            else if (train.timeTableRows[0].stationShortCode != fromStationCode || train.timeTableRows[1].stationShortCode != toStationCode) {
                console.error(`Train ${train.trainNumber} has interesting stops in unexpected order.`);
                console.log(JSON.stringify(train));
            }
            else {
                renderTableRow(train, trainListElement);
            }
        });
    });
}

main();
