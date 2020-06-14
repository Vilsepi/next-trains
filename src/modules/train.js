import * as Api from './xhr.js';
const moment = window.moment;

function getTrainName(train) {
    if (train.commuterLineID) {
        return train.commuterLineID;
    }
    else {
        return train.trainType + train.trainNumber;
    }
}

function setBestEstimate(station) {
    if (station.liveEstimateTime) {
        station.bestEstimatedTime = station.liveEstimateTime;
        return true;
    }
    else if (station.scheduledTime) {
        station.bestEstimatedTime = station.scheduledTime;
        return true;
    }
    else {
        console.warn("Failed to set bestEstimatedTime for station" + station)
        return false;
    }
}

async function getTrainsForStation(from, to) {
    const now = moment().toISOString();
    const later = moment().add(60, 'minutes').toISOString();
    const params = new URLSearchParams({
        startDate: now,
        endDate: later,
        include_nonstopping: false,
    });

    const url = `live-trains/station/${from}/${to}?${params.toString()}`;
    console.log(url);
    return Api.getJson(url);
}

export {getTrainName, getTrainsForStation, setBestEstimate};
