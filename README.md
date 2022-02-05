# Next trains

[![Build Status](https://github.com/Vilsepi/next-trains/actions/workflows/main.yml/badge.svg)](https://github.com/Vilsepi/next-trains/actions)

Displays the next departing trains in Finland that get you fastest to your destination.

## Usage

Enter `from` and `to` stations as query parameters:

- Tikkurila - Helsinki: http://train.heap.fi/?from=TKL&to=HKI
- Tikkurila - Tampere: http://train.heap.fi/?from=TKL&to=TPE

The value for the query parameter is the `stationShortCode` of the station you want. For a complete list of station identifiers, see [list of stations](https://rata.digitraffic.fi/api/v1/metadata/stations).

You can also enter an easier name for the following stations: [helsinki, pasila, tampere, tikkurila](https://github.com/Vilsepi/next-trains/blob/8e8a411a227a31320720add1f17db7d768c25382/src/index.js#L25-L30).

## Attribution

Inspired by [Junat.net](https://www.junat.net/). Uses [Digitraffic API](https://www.digitraffic.fi/rautatieliikenne/).
