'use strict';

let parks = [];
const parkIcon = L.icon({
    iconUrl: 'images/markers/park.png',
    shadowUrl: 'images/markers/parkShadow.png',
    iconSize: [48, 48],
    shadowSize: [48, 48],
    iconAnchor: [24, 44],
    shadowAnchor: [10, 42],
    popupAnchor: [0, -48]
});
const MAX_CLOSEST_PARKS = 5;
let selectedParkIndex = 0;

function addPark(feature) {
    const coordinates = feature.geometry.coordinates;
    const park = {
        coordinates: coordinates,
        name: feature.properties.tags.name,
        distance: getDistance(userLocation, coordinates),
    };

    parks.push(park);
}

function addParkMarkers() {
    clearParkInfo();
    for (let i = 0; i < parks.length; i++) {
        const park = parks[i];
        const marker = L.marker([
            park.coordinates.lat,
            park.coordinates.lng,
        ], { icon: parkIcon }).addTo(parksLayer).on('click', parkMarkerClicked);
        const distance_m = (park.distance * 1000).toFixed(0);
        const markerHTML = `<b>${park.name}</b><p>${distance_m} m</p>`;
        marker.bindPopup(markerHTML);

        if (i < MAX_CLOSEST_PARKS) showParkInfo(park);
    }
}

function parkMarkerClicked(e) {
    const markerCoordinates = e.latlng;
    for (let i = 0; i < parks.length; i++) {
        const park = parks[i];
        if (park.coordinates.lat === markerCoordinates.lat && park.coordinates.lng === markerCoordinates.lng) {
            selectPark(i);
        }
    }
}

function clearParkInfo() {
    document.getElementById('closest-parks').innerHTML = '';
}

function showParkInfo(park) {
    const parentUl = document.getElementById('closest-parks');
    const li = document.createElement('li');
    li.innerHTML = `<h3>${park.name}</h3><p>${(park.distance * 1000).toFixed(0)} m</p>`;
    li.addEventListener('click', parkListItemClicked);
    parentUl.appendChild(li);
}

function parkListItemClicked(e) {
    let clickedLi;
    if (e.target.nodeName != 'LI') {
        clickedLi = e.target.parentNode;
    } else {
        clickedLi = e.target;
    }

    const parentUl = clickedLi.parentNode;
    const selectedParkIndex = Array.prototype.indexOf.call(
        parentUl.children,
        clickedLi
    );

    selectPark(selectedParkIndex);
}

function selectPark(index) {
    selectedParkIndex = index;

    map.closePopup();
    shopsLayer.clearLayers();
    calculateShopCombinedDist();
    addShopMarkers();

    // Highlight the selected park on the list
    if (index < MAX_CLOSEST_PARKS) {
        const listItems = document.getElementById('closest-parks').getElementsByTagName('li');
        for (const listItem of listItems) {
            listItem.classList.remove('selected-park');
        }
        listItems[index].classList.add('selected-park');
    }

    fetchRoute();
}