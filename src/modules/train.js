import * as Api from './xhr.js';

function getTrainName(train) {
    if (train.commuterLineID) {
        return train.commuterLineID;
    }
    else {
        return train.trainType + train.trainNumber;
    }
}

async function getTrainsForStation(station) {
    const maxDepartingTrains = "30";
    const url = `live-trains/station/${station}?arrived_trains=0&arriving_trains=0&departed_trains=0&departing_trains=${maxDepartingTrains}&include_nonstopping=false`;
    return Api.getJson(url);
}

export {getTrainName, getTrainsForStation};
