const apiKey = 'AIzaSyDJr8pK1DDoOPSiFf9P2leCvQwdmFr2iiw';

document.addEventListener("DOMContentLoaded", function() {
    var weatherResults = document.getElementById("weatherResults");
    var weatherBackground = document.getElementById("weather");

    function getWeather(city) {
        var apiKey = '3c98967286d967f3f67649ec7defdf19';
        var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                weatherResults.style.display = 'block';
                weatherResults.innerHTML = `<h2>Weather in ${city}</h2>
                                        <p><strong>Temperature:</strong> ${(data.main.temp - 273.15).toFixed(2)}°C or ${(((data.main.temp - 273.15) * 9 / 5) + 32).toFixed(2)}°F</p>
                                        <p><strong>Max Temperature:</strong> ${(data.main.temp_max - 273.15).toFixed(2)}°C or ${(((data.main.temp - 273.15) * 9 / 5) + 32).toFixed(2)}°F</p>
                                        <p><strong>Min Temperature:</strong> ${(data.main.temp_min - 273.15).toFixed(2)}°C or ${(((data.main.temp - 273.15) * 9 / 5) + 32).toFixed(2)}°F</p>
                                        <p><strong>Feels Like:</strong> ${(data.main.feels_like - 273.15).toFixed(2)}°C or ${(((data.main.temp - 273.15) * 9 / 5) + 32).toFixed(2)}°F</p>
                                        <p><strong>Condition:</strong> ${data.weather[0].description}</p>
                                        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
                                        <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s or ${(data.wind.speed * 2.23694).toFixed(2)} mph</p>
                                        <p><strong>Longitude:</strong> ${data.coord.lon}, Latitude:</strong> ${data.coord.lat}</p>
                                        `;
                setBackground(`${city}`);
            })
            .catch(error => {
                console.log(error);
            });
    }

    document.getElementById("weatherForm").addEventListener("submit", function(event) {
        event.preventDefault();
        var city = document.getElementById("cityInput").value;
        getWeather(city);
    });

    function setBackground(city) {
        var apiKey = 'm3nCn7Lc8dKQHP32U_tOpGawXKnhS5wICnt8RMjAjag';
        var url = `https://api.unsplash.com/search/photos?page=1&query=${encodeURIComponent(city)}&client_id=${apiKey}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.results.length > 0) {
                    var randomIndex = Math.floor(Math.random() * data.results.length);
                    var imageUrl = data.results[randomIndex].urls.regular;
                    weatherBackground.style.backgroundImage = `url('${imageUrl}')`;
                    weatherBackground.style.backgroundRepeat = 'no-repeat';
                    weatherBackground.style.backgroundSize = 'cover';
                    weatherBackground.style.backgroundPosition = 'center';
                }
            })
            .catch(error => {
                console.error('Error fetching image from Unsplash:', error);
            });
    }

    getWeather("Miami");

    const apiKey = 'AIzaSyDJr8pK1DDoOPSiFf9P2leCvQwdmFr2iiw';

    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        element.value = preferredLanguage;
    });
    translatePage(preferredLanguage);

    async function translatePage(language) {
        const elements = document.querySelectorAll('[data-translate]');

        for (const element of elements) {
            const text = element.getAttribute('data-original-text') || element.textContent;
            const translatedText = await translateText(text, language);
            element.textContent = translatedText;
            element.setAttribute('data-original-text', text);
        }
    }

    async function translateText(text, targetLanguage) {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: text,
                    target: targetLanguage
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return data.data.translations[0].translatedText;
        } catch (error) {
            console.error(error);
        }
    }
});