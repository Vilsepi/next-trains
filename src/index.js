import {Template} from './modules/template.js';
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

const stationShortcuts = {
    "helsinki": "HKI",
    "pasila": "PSL",
    "tampere": "TPE",
    "tikkurila": "TKL",
}

function getStationCodeFromQueryParameter(param) {
    return stationShortcuts[param] ? stationShortcuts[param] : param;
}

async function main() {
    modifyMomentLocale();
    const t = new Template();

    const urlParams = new URLSearchParams(window.location.search);
    const fromStationCode = getStationCodeFromQueryParameter(urlParams.get('from'));
    const toStationCode = getStationCodeFromQueryParameter(urlParams.get('to'));

    if (!fromStationCode || !toStationCode) {
        window.location.replace("/?from=tikkurila&to=helsinki");
    }

    t.setTitleStationNames(fromStationCode, toStationCode);

    const response = await Train.getTrainsForStation(fromStationCode, toStationCode);
    if (response.code) {
        t.setMessage(`${response.code}<br><br>${response.errorMessage}`);
        throw response.errorMessage;
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

    // console.debug(JSON.stringify(trains, null, 1));

    // Sort trains by destination arrival time
    trains.sort(function(a, b) {
        return moment(a.timeTableRows[1].bestEstimatedTime) - moment(b.timeTableRows[1].bestEstimatedTime);
    });

    t.addTableHeader();

    const MAX_NUMBER_OF_TRAINS = 10;
    var trainsListed = 0;
    trains.forEach(train => {
        // After filtering in previous stage, each train should have exactly 2 stops, the from and to stations the user is interested in.
        // If it has more than 2, it's probably on the Ring Rail Line.
        if (train.timeTableRows.length != 2) {
            if (["I", "P"].includes(train.commuterLineID)) {
                console.info(`Train ${Train.getTrainName(train)} (${train.trainNumber}) has ${train.timeTableRows.length} interesting stops probably due to being on circular track: https://www.junat.net/fi/juna/${train.trainNumber}/${train.departureDate}/\n${JSON.stringify(train, null, 1)}`);
                if (train.timeTableRows[0].stationShortCode == fromStationCode && train.timeTableRows[1].stationShortCode == toStationCode) {
                    console.info("We should probably add this train as viable!");
                }
            }
            else {
                console.warn(`Train ${Train.getTrainName(train)} (${train.trainNumber}) has ${train.timeTableRows.length} interesting stops: https://www.junat.net/fi/juna/${train.trainNumber}/${train.departureDate}/\n${JSON.stringify(train, null, 1)}`);
            }
        }
        // From and to stations should be in travel order, according to API specification.
        else if (train.timeTableRows[0].stationShortCode == toStationCode && train.timeTableRows[1].stationShortCode == fromStationCode) {
            console.debug(`Train ${Train.getTrainName(train)} (${train.trainNumber}) is coming the opposite direction: https://www.junat.net/fi/juna/${train.trainNumber}/${train.departureDate}`);
        }
        else if (train.timeTableRows[0].stationShortCode != fromStationCode || train.timeTableRows[1].stationShortCode != toStationCode) {
            console.warn(`Train ${Train.getTrainName(train)} (${train.trainNumber}) has interesting stops in unexpected order:\n${JSON.stringify(train, null, 1)}`);
        }
        else if (trainsListed < MAX_NUMBER_OF_TRAINS) {
            if (moment(train.timeTableRows[0].bestEstimatedTime).isAfter(moment().subtract(120, 'seconds'))) {
                t.addTableRow(train);
                trainsListed++;
            }
        }
    });
}

main();
