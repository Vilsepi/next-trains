import * as Train from './train.js';
const moment = window.moment;

export class Template {
    constructor() {
        this.stationHeadingElement = document.getElementById("stationHeading");
        this.messageElement = document.getElementById("messageBox");
        this.trainListElement = document.getElementById("trainList");
    }

    addTableHeader() {
        const header = document.createElement('tr');
        header.innerHTML = '<th class="ralign">Lähtee</th><th class="calign">Raide</th><th>Juna</th><th class="calign">Lähtee</th><th class="lalign">Perillä &#x25BE;</th>';
        this.trainListElement.appendChild(header);
    }

    addTableRow(train) {
        const fromStation = train.timeTableRows[0];
        const toStation = train.timeTableRows[1];
        const row = `
            <td class="ralign ${(fromStation.liveEstimateTime) ? '' : 'maybe'}">${moment(fromStation.bestEstimatedTime).fromNow()}</td>
            <td class="track">${fromStation.commercialTrack}</td>
            <td class="line"><a href="https://www.junat.net/fi/juna/${train.trainNumber}/${train.departureDate}/">${Train.getTrainName(train)}</a></td>
            <td class="calign deptime">${moment(fromStation.bestEstimatedTime).format("HH:mm")}</td>
            <td class="lalign arrtime">${moment(toStation.bestEstimatedTime).format("HH:mm")}</td>
        `;

        const rowElement = document.createElement('tr');
        rowElement.innerHTML = row;
        this.trainListElement.appendChild(rowElement);
    }

    async setTitleStationNames(fromStationCode, toStationCode) {
        const names = await Train.getStationFriendlyNames(fromStationCode, toStationCode)
        this.stationHeadingElement.innerHTML = names.from + " - " + names.to;
    }

    setMessage(msg) {
        this.messageElement.innerHTML = msg;
    }
}
