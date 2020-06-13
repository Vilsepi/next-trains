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

    const urlParams = new URLSearchParams(window.location.search);
    const fromStationCode = urlParams.get('from');
    const toStationCode = urlParams.get('to');

    if (!fromStationCode || !toStationCode) {
        console.error("From and to query parameters not given");
        stationHeadingElement.innerHTML = `Syötä queryparametrit oikein! <a href="/?from=TKL&to=HKI">Kokeile tätä</a>`;
        return;
    }

    stationHeadingElement.innerHTML = `${fromStationCode} &#8680; ${toStationCode}`;

    const response = await Train.getTrainsForStation(fromStationCode);

    console.debug(JSON.stringify(response, null, 2));

    // Only show commuter trains that are traveling from fromStationCode to toStationCode
    // TODO To show only upcoming trains, we filter by liveEstimateTime. This has a side-effect that trains that do not have liveEstimate are not shown at all.
    // We should instead compare timestamps against now time (or check that actualTime must not be present), and show either liveEstimateTime or scheduledTime.
    // TODO When showing scheduledTimes, you must then filter out cancelled trains
    // FYI train waiting for depart => non-running train
    const trains = response.filter(train =>
        ["Commuter", "Long-distance"].includes(train.trainCategory) && (
            train.timeTableRows = train.timeTableRows.filter(
                station =>
                    (station.stationShortCode == fromStationCode && station.type == "DEPARTURE" /*&& station.liveEstimateTime*/) ||
                    (station.stationShortCode == toStationCode && station.type == "ARRIVAL" /*&& station.liveEstimateTime*/)
            )
        ).length > 1);


    // Sort trains by destination arrival time
    trains.sort(function(a, b) {
        return moment(a.timeTableRows[1].liveEstimateTime) - moment(b.timeTableRows[1].liveEstimateTime);
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
