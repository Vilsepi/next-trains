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
        header.innerHTML = '<th class="eta">Lähtee</th><th>Raide</th><th>Juna</th><th>Lähtee &#x25BE;</th><th>Perillä</th>';
        this.trainListElement.appendChild(header);
    }

    addTableRow(train) {
        const fromStation = train.timeTableRows[0];
        const toStation = train.timeTableRows[1];
        const row = `
            <td class="eta">${moment(fromStation.bestEstimatedTime).fromNow()}</td>
            <td class="track">${fromStation.commercialTrack}</td>
            <td class="line"><a href="https://www.junat.net/fi/juna/${train.trainNumber}/${train.departureDate}/">${Train.getTrainName(train)}</a></td>
            <td class="deptime ${(fromStation.liveEstimateTime) ? '' : 'maybe'}">${moment(fromStation.bestEstimatedTime).format("HH:mm")}</td>
            <td class="arrtime ${(toStation.liveEstimateTime) ? '' : 'maybe'}">${moment(toStation.bestEstimatedTime).format("HH:mm")}</td>
        `;

        const rowElement = document.createElement('tr');
        rowElement.innerHTML = row;
        this.trainListElement.appendChild(rowElement);
    }

    setTitle(msg) {
        this.stationHeadingElement.innerHTML = msg;
    }

    setMessage(msg) {
        this.messageElement.innerHTML = msg;
    }
}
