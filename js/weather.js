'use strict';

// Näyttää lämpötilan annetussa sijainnissa
function searchWeather(location) {
    const apiKey = 'f3da161aa0d58befd942b85eb09e2d48';
    const uri = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${apiKey}`;

    fetch(uri)
        .then((answer) => answer.json())
        .then((json) => displayWeather(json))
        .catch((error) => console.log(error));
}

function displayWeather(json) {
    if (json.cod === 200) {
        const weatherParent = document.getElementById('weather');
        weatherParent.innerHTML = '';
        const weatherImgID = json.weather[0].icon; //hakee weather arraysta icon tekstin

        const kelvin = json.main.temp;
        const kelvinToCelsius = (temp) => (temp - 273.155).toFixed(1);
        const celsius = kelvinToCelsius(kelvin);
        
        weatherParent.innerHTML = `
        <img id="weather-icon" src="https://openweathermap.org/img/wn/${weatherImgID}@2x.png" alt="Säätilan ikoni" />
        <p id="temp">${celsius} °C</p>
        `;
    } else {
        document.getElementById('temp').innerText =
            'Säätietojen haku epäonnistui';
    }
}
