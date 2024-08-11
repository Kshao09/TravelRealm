import { initializeAuth } from "../JS/Auth/auth.js";

document.addEventListener("DOMContentLoaded", function() {
    initializeAuth();

    function createListItem(data, type) {
        const li = document.createElement('li');
        li.className = 'travel-item';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'travel-info';
        infoDiv.textContent = `${type} - ${data.name}, ${data.date}`;

        const removeBtn = doucment.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = function() {
            let items = JSON.parse(localStorage.getItem(type)) || [];
            items = items.filter(item => item.id !== data.id);
            localStorage.setItem(type, JSON.stringify(items));
            li.remove();
        };

        li.appendChild(infoDiv);
        li.appendChild(deleteBtn);

        return li;
    }

    function loadTravelHistory() {
        const flightList = document.getElementById('flightList');
        const hotelList = document.getElementById('hotelList');
        const carList = document.getElementById('carList');

        const bookedFlights = JSON.parse(localStorage.getItem('bookedFlights')) || [];
        const bookedHotels = JSON.parse(localStorage.getItem('bookedHotels')) || [];
        const bookedCars = JSON.parse(localStorage.getItem('bookedCars')) || [];

        if (bookedFlights.length === 0 && bookedHotels.length === 0 && bookedCars.length === 0) {
            document.querySelector(".container").style.display = 'none';
        }

        if (bookedFlights.length > 0) {
            bookedFlights.forEach(flight => {
                flightList.appendChild(createListItem(flight, 'bookedFlights'));
            });
        } else {
            document.querySelector('h1').style.display = 'none';
            flightList.style.display = 'none';
        }

        if (bookedHotels.length > 0) {
            bookedHotels.forEach(hotel => {
                hotelList.appendChild(createListItem(hotel, 'bookedHotels'));
            });
        } else {
            document.querySelectorAll('h1')[1].style.display = 'none';
            hotelList.style.display = 'none';
        }

        if (bookedCars.length > 0) {
            bookedCars.forEach(car => {
                carList.appendChild(createListItem(car, 'bookedCars'));
            });
        } else {
            document.querySelectorAll('h1')[2].style.display = 'none';
            carList.style.display = 'none';
        }
    }

    loadTravelHistory();

    var scrollBtn = document.getElementById('scroll-top-button');

    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    window.addEventListener('scroll', () => {
        const scrollTopButton = document.getElementById('scroll-top-button');
        if (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) {
            scrollTopButton.style.display = 'block';
        } else {
            scrollTopButton.style.display = 'none';
        }
    });

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
})