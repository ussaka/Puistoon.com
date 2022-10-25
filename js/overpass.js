'use strict';

async function fetchOverpassData() {
    try {
        const overpassUrl = buildOverpassApiUrl();
        const result = await fetch(overpassUrl);
        const json = await result.json();
        const resultAsGeojson = osmtogeojson(json);

        processFeatures(resultAsGeojson.features);
        userGreeting();
    } catch (error) {
        console.log(error);
    }
    setLoadingOverlayVisibility(false);
}

function buildOverpassApiUrl() {
    // See: https://overpass-turbo.eu/
    const bounds = (map.getBounds().getSouth() - 0.005).toString() + ',' +
        (map.getBounds().getWest() - 0.01).toString() + ',' +
        (map.getBounds().getNorth() + 0.01).toString() + ',' +
        (map.getBounds().getEast() + 0.005).toString();

    // Parks
    let nodeQuery = `node[leisure=park](${bounds});`;
    let wayQuery = `way[leisure=park](${bounds});`;
    let relationQuery = `relation[leisure=park](${bounds});`;
    const parksQuery = nodeQuery + wayQuery + relationQuery;

    // Beaches (treated as parks)
    nodeQuery = `node[natural=beach](${bounds});`;
    wayQuery = `way[natural=beach](${bounds});`;
    relationQuery = `relation[natural=beach](${bounds});`;
    const beachesQuery = nodeQuery + wayQuery + relationQuery;

    // Shops
    const shopTypes = ['convenience', 'supermarket', 'department_store', 'mall'/*, 'alcohol'*/];
    nodeQuery = wayQuery = relationQuery = '';
    for (const shopType of shopTypes) {
        nodeQuery += `node[shop=${shopType}](${bounds});`;
        wayQuery += `way[shop=${shopType}](${bounds});`;
        relationQuery += `relation[shop=${shopType}](${bounds});`;
    }
    const shopsQuery = nodeQuery + wayQuery + relationQuery;

    const query = `?data=[out:json][timeout:10];(${parksQuery}${beachesQuery}${shopsQuery});out body geom;`;
    const baseUrl = 'https://overpass-api.de/api/interpreter';
    const resultUrl = baseUrl + query;
    return resultUrl;
}

function processFeatures(features) {
    parks = [];
    shops = [];

    // Gather relevant data out of the geojson features: name and its coordinates as a point
    for (const feature of features) {
        const tags = feature.properties.tags;

        // Filter entries that have no name or name:fi tag set
        tags.name = tags['name:fi'] || tags.name; // Use name:fi whenever available
        if (!tags.name) continue;

        // geometry.coordinates has [0] = lng and [0] = lat!
        const featureCoordinates = feature.geometry.coordinates;
        const geometryType = feature.geometry.type;
        switch (geometryType) {
            case 'MultiPolygon':
                feature.geometry.coordinates = multipolygonToPoint(featureCoordinates);
                break;
            case 'Polygon':
                feature.geometry.coordinates = polygonToPoint(featureCoordinates);
                break;
            case 'Point':
                feature.geometry.coordinates = {
                    lat: featureCoordinates[1],
                    lng: featureCoordinates[0],
                };
                break;
            default:
                console.error(`Unknown geometry type: ${geometryType}`);
        }

        if (tags['leisure'] || tags['natural']) {
            addPark(feature);
        } else if (tags['shop']) {
            // if (!tags['opening_hours']) continue;
            addShop(feature);
        }
    }

    // Sort by distance to user
    parks.sort((a, b) => a.distance - b.distance);

    addParkMarkers();
    // addShopMarkers();
}

function multipolygonToPoint(multipolygon) {
    // Find the center of each polygon in the multipolygon
    // Then return the center of all those polygons' centers
    const polygonCenters = [];
    for (let pol = 0; pol < multipolygon.length; pol++) {
        polygonCenters.push(L.latLngBounds(multipolygon[pol]).getCenter());
    }
    const multipolygonCenter = L.latLngBounds(polygonCenters).getCenter();
    return { lat: multipolygonCenter.lng, lng: multipolygonCenter.lat };
}

function polygonToPoint(polygon) {
    const polygonCenter = L.latLngBounds(polygon[0]).getCenter();
    return {
        lat: polygonCenter.lng,
        lng: polygonCenter.lat,
    };
}