'use strict';

async function fetchRoute() {
    const osrmUrl = buildOSRMApiUrl();
    const response = await fetch(osrmUrl);
    const json = await response.json();

    let latlngs = json.routes[0].geometry.coordinates;
    drawRoute(latlngs.map(coord => [coord[1], coord[0]]));
    
    // Simple straight line between user and park:
    // drawRoute([userLocation, parks[selectedParkIndex].coordinates]);
}

function buildOSRMApiUrl() {
    // See: http://project-osrm.org/
    const parkLocation = parks[selectedParkIndex].coordinates;
    const coordinates = `${userLocation.lng},${userLocation.lat};${parkLocation.lng},${parkLocation.lat}`;
    const options = '?geometries=geojson';
    const baseUrl = 'https://router.project-osrm.org/route/v1/foot/';
    return baseUrl + coordinates + options;
}

function drawRoute(coordinates) {
    linesLayer.clearLayers();
    L.polyline(coordinates, { color: 'red' }).addTo(linesLayer);
}