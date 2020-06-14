import * as Template from './modules/template.js';
import * as Train from './modules/train.js';
const moment = window.moment;

function modifyMomentLocale() {
    moment.updateLocale('en', {
        relativeTime: {
            future : '%s',
            past   : '<span class="smaller">lähti</span>',
            s  : '<span class="smaller">nyt</span>',
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

async function main() {
    modifyMomentLocale();
    const stationHeadingElement = document.getElementById("stationHeading");
    const messageElement = document.getElementById("messageBox");

    const urlParams = new URLSearchParams(window.location.search);
    const fromStationCode = urlParams.get('from');
    const toStationCode = urlParams.get('to');

    if (!fromStationCode || !toStationCode) {
        console.error("From and to query parameters not given");
        messageElement.innerHTML = `Syötä lähde- ja kohdeasema queryparametreina<br>Esimerkiksi: <a href="/?from=TKL&to=HKI">${window.location.hostname}/?from=TKL&to=HKI</a><br><a href="https://rata.digitraffic.fi/api/v1/metadata/stations">Katso asemien tunnisteet täältä.</a>`;
        return;
    }

    stationHeadingElement.innerHTML = `${fromStationCode} &#8680; ${toStationCode}`;

    const response = await Train.getTrainsForStation(fromStationCode, toStationCode);
    if (response.code) {
        messageElement.innerHTML = `${response.code}<br><br>${response.errorMessage}`;
        return;
    }

    // Only show commuter trains that are traveling from fromStationCode to toStationCode
    const trains = response.filter(train =>
        ["Commuter", "Long-distance"].includes(train.trainCategory) && (
            train.timeTableRows = train.timeTableRows.filter(
                station =>
                    (station.stationShortCode == fromStationCode && station.type == "DEPARTURE" && Train.setBestEstimate(station) && !station.cancelled) ||
                    (station.stationShortCode == toStationCode && station.type == "ARRIVAL" && Train.setBestEstimate(station) && !station.cancelled)
            )
        ).length > 1);

    console.debug(JSON.stringify(trains, null, 2));

    // Sort trains by destination arrival time
    trains.sort(function(a, b) {
        return moment(a.timeTableRows[1].bestEstimatedTime) - moment(b.timeTableRows[1].bestEstimatedTime);
    });

    const trainListElement = document.getElementById("trainList");
    Template.addTableHeader(trainListElement);

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
            Template.addTableRow(train, trainListElement);
        }
    });
}

main();
