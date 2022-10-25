'use strict';

const START_COORDINATES = [60.171492, 24.941283];
const START_COORDINATESS = [60.172492, 24.942283];
const TILES_URI = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const map = L.map('map', {
    minZoom: 2,
    maxZoom: 17
}).setView(START_COORDINATES, 13);
L.tileLayer(TILES_URI, { attribution: ATTRIBUTION }).addTo(map);
const parksLayer = L.layerGroup().addTo(map);
const shopsLayer = L.layerGroup().addTo(map);
const linesLayer = L.layerGroup().addTo(map);

function getDistance(a, b) {
    // Convert latitude and longitude from degrees to kilometers
    const deltaLat_km = Math.abs(a.lat - b.lat) * 110.574;
    const deltaLng_km = Math.abs(a.lng - b.lng) * 111.32 * Math.cos((a.lat * Math.PI) / 180);
    return Math.sqrt(deltaLat_km * deltaLat_km + deltaLng_km * deltaLng_km);
}
