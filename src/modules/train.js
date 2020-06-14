import * as Api from './xhr.js';

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

async function getTrainsForStation(from) {
    const params = new URLSearchParams({
        minutes_before_departure: 120,
        minutes_after_departure: 1,
        minutes_before_arrival: 120,
        minutes_after_arrival: 1,
        train_categories: "Commuter,Long-distance",
        include_nonstopping: false
    });

    const url = `live-trains/station/${from}?${params.toString()}`;
    console.log(url);
    return Api.getJson(url);
}

export {getTrainName, getTrainsForStation, setBestEstimate};
