'use strict';

let shops = [];
const shopIcon = L.icon({
    iconUrl: 'images/markers/shop.png',
    shadowUrl: 'images/markers/shopShadow.png',
    iconSize: [32, 32],
    shadowSize: [32, 32],
    iconAnchor: [16, 16],
    shadowAnchor: [6, 16],
    popupAnchor: [0, -16]
});
const MAX_CLOSEST_SHOPS = 3;

function addShop(feature) {
    const coordinates = feature.geometry.coordinates;
    const tags = feature.properties.tags;
    let address = '';
    if (tags['addr:street'] && tags['addr:housenumber']) {
        address = tags['addr:street'] + ' ' + tags['addr:housenumber'];
    }
    const shop = {
        coordinates: coordinates,
        name: tags.name,
        distance: getDistance(userLocation, coordinates),
        combinedDist: 0,
        openingHours: parseOpeningHours(tags.opening_hours),
        address: address,
    };

    shops.push(shop);
}

function parseOpeningHours(input) {
    if (!input) return 'Ei aukiolotietoja';

    let output = input;
    output = output.replace('Mo', 'Ma');
    output = output.replace('Fr', 'Pe');
    output = output.replace('Sa', 'La');
    output = output.replace('24/7', 'Auki 24/7');
    output = output.replace(/:00/g, '');
    output = output.replace(/;/g, ',');
    return output;
}

function calculateShopCombinedDist() {
    for (const shop of shops) {
        const combinedDist = getDistance(shop.coordinates, userLocation) +
            getDistance(shop.coordinates, parks[selectedParkIndex].coordinates);
        shop.combinedDist = combinedDist;
    }

    // Sort by combined distance
    // -> shops that are close to both the user and the selected park are prefered
    shops.sort((a, b) => a.combinedDist - b.combinedDist);
}

function addShopMarkers() {
    clearShopInfo();
    for (let i = 0; i < shops.length; i++) {
        if (i >= MAX_CLOSEST_SHOPS) break;

        const shop = shops[i];
        const marker = L.marker([
            shop.coordinates.lat,
            shop.coordinates.lng,
        ], { icon: shopIcon }).addTo(shopsLayer);

        const distance_m = (shop.distance * 1000).toFixed(0);
        const address = shop.address ? `<p>${shop.address}</p>` : '';
        let markerHTML = `<b>${shop.name}</b>`;
        markerHTML += `${address}`;
        markerHTML += `<p>${distance_m} m</p>`;
        markerHTML += `<p>${shop.openingHours}</p>`;
        marker.bindPopup(markerHTML);

        showShopInfo(shop);
    }
}

function clearShopInfo() {
    document.getElementById('shop-list').innerHTML = '';
}

function showShopInfo(shop) {
    const parentUl = document.getElementById('shop-list');
    const li = document.createElement('li');
    const address = shop.address ? `<p class="shop-addr">${shop.address}</p>` : '';
    li.innerHTML = `
    <div class="shop-address">
        <h3 class="shop-name">${shop.name}</h3>
        ${address}
    </div>
    <div class="shop-timetable">
        <h4>Aukioloajat:</h4>
        <p class="shop-time">${shop.openingHours}</p>
    </div>
    `;

    parentUl.appendChild(li);
}