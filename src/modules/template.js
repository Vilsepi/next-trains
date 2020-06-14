import * as Train from './train.js';
const moment = window.moment;

function addTableHeader(trainListElement) {
    const header = document.createElement('tr');
    header.innerHTML = '<th class="eta">Lähtee</th><th>Raide</th><th>Juna</th><th>Lähtee</th><th>Perillä &#x25BE;</th>';
    trainListElement.appendChild(header);
}

function addTableRow(train, trainListElement) {
    const fromStation = train.timeTableRows[0];
    const toStation = train.timeTableRows[1];
    const row = `
        <td class="eta">${moment(fromStation.bestEstimatedTime).fromNow()}</td>
        <td class="track">${fromStation.commercialTrack}</td>
        <td class="line"><a href="https://www.junat.net/fi/juna/${train.trainNumber}/${train.departureDate}/">${Train.getTrainName(train)}</a></td>
        <td class="deptime">${moment(fromStation.bestEstimatedTime).format("HH:mm")}</td>
        <td class="arrtime">${moment(toStation.bestEstimatedTime).format("HH:mm")}</td>
    `;

    const rowElement = document.createElement('tr');
    rowElement.innerHTML = row;
    trainListElement.appendChild(rowElement);
}

export {addTableHeader, addTableRow};
