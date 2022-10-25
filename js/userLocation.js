'use strict';

const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-text');
let movingToUserLocation = false;
let userLocation = {
    lat: 0,
    lng: 0,
};
let userMarker;
const userIcon = L.icon({
    iconUrl: 'images/markers/user.png',
    shadowUrl: 'images/markers/userShadow.png',
    iconSize: [48, 48],
    shadowSize: [48, 48],
    iconAnchor: [24, 44],
    shadowAnchor: [18, 44],
    popupAnchor: [0, -48]
});
let showUserGreeting = true;

function setUserLocation(lat, lng) {
    userLocation = {
        lat: lat,
        lng: lng,
    };
    movingToUserLocation = true;
    setLoadingOverlayVisibility(true);
    map.setView(userLocation, 15);
}

// moveend event triggers on all map movement,
// do the actions only after a new user location has been found
map.on('moveend', (e) => {
    if (movingToUserLocation) {
        movingToUserLocation = false;
        parksLayer.clearLayers();
        clearParkInfo();
        shopsLayer.clearLayers();
        clearShopInfo();
        linesLayer.clearLayers();
        userMarker = L.marker(userLocation, { icon: userIcon }).addTo(parksLayer);
        fetchOverpassData();
        searchWeather(userLocation);
    }
});

function userGreeting() {
    if (showUserGreeting) {
        userMarker.bindPopup('<p>Mihinkäs tänään mentäisiin?</p>').openPopup();
        showUserGreeting = false;
    }
}

// USER LOCATION FROM BROWSER LOCATION

getBrowserLocation();
function getBrowserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            browserLocationFound,
            browserLocationError
        );
    } else {
        console.log('Geolocation is not supported by this browser.');
    }
}

function browserLocationFound(position) {
    setUserLocation(position.coords.latitude, position.coords.longitude);
}

function browserLocationError(error) {
    setLoadingOverlayVisibility(false);
    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.error('User denied the request for Geolocation.');
            break;
        case error.POSITION_UNAVAILABLE:
            console.error('Location information is unavailable.');
            break;
        case error.TIMEOUT:
            console.error('The request to get user location timed out.');
            break;
        case error.UNKNOWN_ERROR:
            console.error('An unknown error occurred.');
            break;
    }
}

// USER LOCATION FROM NOMINATIV ADDRESS SEARCH

searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (searchInput.value) {
        fetchUserLocation(searchInput.value);
    }
});

searchInput.addEventListener('onkeypress', (e) => {
    if (e.keycode === 13 && searchInput.value) {
        fetchUserLocation(searchInput.value);
    }
});

async function fetchUserLocation(userInput) {
    searchInput.value = '';

    try {
        setLoadingOverlayVisibility(true);
        const nominativUrl = buildNominativApiUrl(userInput);
        const result = await fetch(nominativUrl);
        const json = await result.json();
        setUserLocation(json[0].lat, json[0].lon);
    } catch (error) {
        setLoadingOverlayVisibility(false);
        console.log(error);
    }
}

function buildNominativApiUrl(userInput) {
    // See: https://nominatim.org/release-docs/develop/api/Search/
    const query = `&q=${userInput}`;
    const options = 'format=json&addressdetails=1&limit=1';
    const baseUrl = 'https://nominatim.openstreetmap.org/search?';
    const resultUrl = baseUrl + options + query;
    return resultUrl;
}

// USER LOCATION FROM MAP CLICK

map.on('click', (e) => {
    setUserLocation(e.latlng.lat, e.latlng.lng);
});
