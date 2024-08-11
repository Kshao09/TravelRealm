import { initializeAuth } from "../JS/Auth/auth.js";

let flightData = null;
let filteredFlights = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    const flightSearchFormOneWay = document.getElementById('flight-search-form-one-way');
    const flightSearchFormRoundTrip = document.getElementById('flight-search-form-round-trip');
    const searchResults = document.getElementById('search-results');
    const filters = document.getElementById('filters');

    filters.style.display = 'none';

    async function getEntityId(location) {
        const apiKey = '3040e0768amshdf467137c063a99p1b6efcjsncd929a03fb6d';
        const apiUrl = `https://skyscanner80.p.rapidapi.com/api/v1/flights/auto-complete?query=${location}`;

        try {
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    'x-rapidapi-key': apiKey,
                    'x-rapidapi-host': 'skyscanner80.p.rapidapi.com'
                }
            });

            const data = await response.json();

            if (data && data.data && data.data.length > 0) {
                const id = data.data[0].id;
                return id;
            } else {
                console.log("No ID found for location:", location);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
        return null;
    }

    flightSearchFormOneWay.addEventListener('submit', async function(e) {
        e.preventDefault();

        const from = document.getElementById('from-one-way').value;
        const to = document.getElementById('to-one-way').value;
        const departureDate = document.getElementById('departure-date-one-way').value;

        const fromId = await getEntityId(from);
        const toId = await getEntityId(to);

        if (!fromId || !toId) {
            searchResults.innerHTML = '<p>Invalid location. Please check your input.</p>';
            return;
        }

        const apiKey = '3040e0768amshdf467137c063a99p1b6efcjsncd929a03fb6d';
        const apiUrl = `https://skyscanner80.p.rapidapi.com/api/v1/flights/search-one-way?fromId=${fromId}&toId=${toId}&departDate=${departureDate}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': apiKey,
                    'x-rapidapi-host': 'skyscanner80.p.rapidapi.com'
                }
            });

            const data = await response.json();

            if (response.ok) {
                flightData = data;
                searchFlightsOneWay(data);
                filters.style.display = 'flex';
                performSearch();
            } else {
                searchResults.innerHTML = `<p>No flights found. Error: ${data.error.message}</p>`;
                console.error('Failed to fetch flight data:', data);
            }
        } catch (error) {
            console.error('Error:', error);
            searchResults.innerHTML = `<p>Error fetching flight data: ${error.message}</p>`;
        }
    });

    flightSearchFormRoundTrip.addEventListener('submit', async function(e) {
        e.preventDefault();

        const from = document.getElementById('from-round-trip').value;
        const to = document.getElementById('to-round-trip').value;
        const departureDate = document.getElementById('departure-date-round-trip').value;
        const returnDate = document.getElementById('return-date').value;

        const fromId = await getEntityId(from);
        const toId = await getEntityId(to);

        if (!fromId || !toId) {
            searchResults.innerHTML = '<p>Invalid location. Please check your input.</p>';
            return;
        }

        const apiKey = '3040e0768amshdf467137c063a99p1b6efcjsncd929a03fb6d';
        const apiUrl = `https://skyscanner80.p.rapidapi.com/api/v1/flights/search-roundtrip?fromId=${fromId}&toId=${toId}&departDate=${departureDate}&returnDate=${returnDate}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': apiKey,
                    'x-rapidapi-host': 'skyscanner80.p.rapidapi.com'
                }
            });

            const data = await response.json();

            if (response.ok) {
                flightData = data;
                searchFlightsRoundTrip(data);
                filters.style.display = 'flex';
                performSearch();
            } else {
                searchResults.innerHTML = `<p>No flights found. Error: ${data.error.message}</p>`;
                console.error('Failed to fetch flight data:', data);
            }
        } catch (error) {
            console.error('Error:', error);
            searchResults.innerHTML = `<p>Error fetching flight data: ${error.message}</p>`;
        }
    });

    function searchFlightsOneWay(data) {
        const flights = data.data.itineraries;

        if (flights && flights.length > 0) {
            filteredFlights = flights;
            displayFlightResultsOneWay(flights, 1);
            addPaginationControls(flights.length, 15, 1, displayFlightResultsOneWay);
        } else {
            searchResults.innerHTML = '<p>No flights found.</p>';
        }
    }

    function searchFlightsRoundTrip(data) {
        const flights = data.data.itineraries;

        if (flights && flights.length > 0) {
            filteredFlights = flights;
            displayFlightResultsRoundTrip(flights, 1);
            addPaginationControls(flights.length, 15, 1, displayFlightResultsRoundTrip);
        } else {
            searchResults.innerHTML = '<p>No flights found.</p>';
        }
    }

    function displayFlightResultsOneWay(flights, pageNumber = 1) {
        const pageSize = 15;
        const paginatedFlights = paginate(flights, pageSize, pageNumber);
        searchResults.innerHTML = '';

        if (paginatedFlights.length > 0) {
            paginatedFlights.forEach(itinerary => {
                const flightCard = document.createElement('div');
                flightCard.classList.add('flight-card');

                const leg = itinerary.legs[0];
                const segment = leg.segments[0];
                const flightNumber = segment.flightNumber;
                const airline = segment.marketingCarrier.name;
                const departureTime = new Date(leg.departure).toLocaleTimeString();
                const arrivalTime = new Date(leg.arrival).toLocaleTimeString();
                const price = itinerary.price.formatted;

                flightCard.innerHTML = `<p><strong>Flight: ${flightNumber}<strong></p>
                                        <p>Airline: ${airline}</p>
                                        <p>Departure: ${departureTime}</p>
                                        <p>Arrival: ${arrivalTime}</p>
                                        <p>Price: ${price}</p>
                                        <div class="userBtnContainer">
                                            <button class='compare-button' data-flight='${JSON.stringify(itinerary)}'>Compare</button>
                                            <button class='add-to-cart-button' data-flight='${JSON.stringify(itinerary)}'>+</button>
                                        </div>`;
                searchResults.appendChild(flightCard);
            });

            document.querySelectorAll('.compare-button').forEach(button => {
                button.addEventListener('click', addToCompare);
            });

            document.querySelectorAll('.add-to-cart-button').forEach(button => {
                button.addEventListener('click', addToCart);
            });
        } else {
            searchResults.innerHTML = '<p>No flights found.</p>';
        }
    }

    function displayFlightResultsRoundTrip(flights, pageNumber = 1) {
        const pageSize = 15;
        const paginatedFlights = paginate(flights, pageSize, pageNumber);
        searchResults.innerHTML = '';

        if (paginatedFlights.length > 0) {
            paginatedFlights.forEach(itinerary => {
                const flightCard = document.createElement('div');
                flightCard.classList.add('flight-card');

                const leg = itinerary.legs[0];
                const segment = leg.segments[0];
                const flightNumber = segment.flightNumber;
                const airline = segment.marketingCarrier.name;
                const departureTime = new Date(leg.departure).toLocaleTimeString();
                const arrivalTime = new Date(leg.arrival).toLocaleTimeString();
                const price = itinerary.price.formatted;

                flightCard.innerHTML = `<p><strong>Flight: ${flightNumber}<strong></p>
                                        <p>Airline: ${airline}</p>
                                        <p>Departure: ${departureTime}</p>
                                        <p>Arrival: ${arrivalTime}</p>
                                        <p>Price: ${price}</p>
                                        <div class="userBtnContainer">
                                            <button class='compare-button' data-flight='${JSON.stringify(itinerary)}'>Compare</button>
                                            <button class='add-to-cart-button' data-flight='${JSON.stringify(itinerary)}'>+</button>
                                        </div>`;
                searchResults.appendChild(flightCard);
            });

            document.querySelectorAll('.compare-button').forEach(button => {
                button.addEventListener('click', addToCompare);
            });

            document.querySelectorAll('.add-to-cart-button').forEach(button => {
                button.addEventListener('click', addToCart);
            });
        } else {
            searchResults.innerHTML = '<p>No flights found.</p>';
        }
    }

    function paginate(data, pageSize = 15, pageNumber = 1) {
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;
        return data.slice(start, end);
    }

    function addPaginationControls(totalItems, pageSize, currentPage, displayFunction) {
        const totalPages = Math.ceil(totalItems / pageSize);
        const paginationControls = document.getElementById('pagination-controls');
        paginationControls.innerHTML = '';

        function createPageButton(page) {
            const pageButton = document.createElement('button');
            pageButton.textContent = page;
            pageButton.classList.add('page-button');

            if (page == currentPage) {
                pageButton.classList.add('active');
            }

            pageButton.addEventListener('click', () => {
                displayFunction(filteredFlights, page);
                addPaginationControls(totalItems, pageSize, page, displayFunction);
            });

            paginationControls.appendChild(pageButton);
        }

        if (totalPages == 1) { }
        else if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                createPageButton(i);
            }
        } else {
            createPageButton(1);

            if (currentPage > 4) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                paginationControls.appendChild(ellipsis);
            }

            for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
                createPageButton(i);
            }

            if (currentPage < totalPages - 3) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                paginationControls.appendChild(ellipsis);
            }

            createPageButton(totalPages);
        }
    }

    const compareList = [];

    function addToCompare(event) {
        const flightData = event.target.getAttribute('data-flight');

        if (flightData) {
            const flight = JSON.parse(flightData);
            if (!compareList.some(f => f.legs[0].segments[0].flightNumber === flight.legs[0].segments[0].flightNumber)) {
                compareList.push(flight);
                updateCompareList();
            } else {
                alert("This flight is already in the compare list.");
            }
        } else {
            console.log("Tried to add null flight to compareList");
        }
    }

    function removeFromCompare(event) {
        const flightIndex = event.target.getAttribute('data-index');
        compareList.splice(flightIndex, 1);
        updateCompareList();
    }

    function updateCompareList() {
        const compareContainer = document.getElementById('compare-container');

        if (!compareContainer) {
            const container = document.createElement('div');
            container.id = 'compare-container';
            container.innerHTML = `<h2>Compare Flights</h2>
                                   <div id="compare-list"></div>`;

            document.body.appendChild(container);
        }

        const compareListDiv = document.getElementById('compare-list');
        compareListDiv.innerHTML = '';

        compareList.forEach((flight, index) => {
            const flightInfo = document.createElement('div');
            flightInfo.classList.add('flight-card');

            flightInfo.innerHTML = `<h2>${flight.legs[0].segments[0].marketingCarrier.name}</h2>
                                    <p>Flight Number: ${flight.legs[0].segments[0].flightNumber}</p>
                                    <p>Departure: ${new Date(flight.legs[0].departure).toLocaleTimeString()}</p>
                                    <p>Arrival: ${new Date(flight.legs[0].arrival).toLocaleTimeString()}</p>
                                    <p>Price: ${flight.price.formatted}</p>
                                    <div class="userBtnContainer">
                                        <button class="remove-button" data-index='${index}'>Remove</button>
                                        <button class='add-to-cart-button' data-flight='${JSON.stringify(flight)}'>+</button>
                                    </div>`;

            compareListDiv.appendChild(flightInfo);
        });

        document.querySelectorAll('.remove-button').forEach(button => {
            button.addEventListener('click', removeFromCompare);
        });

        document.querySelectorAll('.add-to-cart-button').forEach(button => {
            button.addEventListener('click', addToCart);
        });
    }

    function addToCart(event) {
        const flightData = event.target.getAttribute('data-flight');

        if (flightData) {
            localStorage.setItem('selectedFlight', flightData);
            window.location.href = '/HTML/booking-system.html';
        } else {
            console.log("No flight data to add to cart");
        }
    }

    document.getElementById('min-price').addEventListener('input', filterFlights);
    document.getElementById('max-price').addEventListener('input', filterFlights);
    document.getElementById('airline').addEventListener('change', filterFlights);
    document.getElementById('stops').addEventListener('change', filterFlights);
    document.getElementById('departure-time').addEventListener('input', filterFlights);

    function filterFlights(event) {
        event.preventDefault();

        if (!flightData) {
            searchResults.innerHTML = '<p>Please perform a search first</p>';
            return;
        }

        const minPrice = document.getElementById('min-price').value;
        const maxPrice = document.getElementById('max-price').value;
        const airline = document.getElementById('airline').value;
        const stops = document.getElementById('stops').value;
        const departureTime = document.getElementById('departure-time').value;

        filteredFlights = flightData.data.itineraries.filter(itinerary => {
            const leg = itinerary.legs[0];
            const segment = leg.segments[0];
            const flightPrice = itinerary.price.formatted;
            const flightAirline = segment.marketingCarrier.name;
            const flightStops = leg.segments.length - 1;
            const flightDepartureTime = new Date(leg.departure).toLocaleTimeString();

            return (!minPrice || flightPrice >= minPrice) &&
                (!maxPrice || flightPrice <= maxPrice) &&
                (!airline || flightAirline === airline) &&
                (!stops || flightStops == stops) &&
                (!departureTime || flightDepartureTime === departureTime);
        });

        displayFilteredFlights(filteredFlights);
    }

    function displayFilteredFlights(filteredFlights) {
        searchResults.innerHTML = '';

        if (filteredFlights.length > 0) {
            filteredFlights.forEach(itinerary => {
                const flightCard = document.createElement('div');
                flightCard.classList.add('flight-card');

                const leg = itinerary.legs[0];
                const segment = leg.segments[0];
                const flightNumber = segment.flightNumber;
                const airline = segment.marketingCarrier.name;
                const departureTime = new Date(leg.departure).toLocaleTimeString();
                const arrivalTime = new Date(leg.arrival).toLocaleTimeString();
                const price = itinerary.price.formatted;

                flightCard.innerHTML = `<p><strong>Flight: ${flightNumber}</strong></p>
                                        <p>Airline: ${airline}</p>
                                        <p>Departure: ${departureTime}</p>
                                        <p>Arrival: ${arrivalTime}</p>
                                        <p>Price: ${price}</p>
                                        <button class='compare-button' data-flight='${JSON.stringify(itinerary)}'>Compare</button>
                                        <button class='add-to-cart-button' data-flight='${JSON.stringify(itinerary)}'>+</button>
                                        `;

                searchResults.appendChild(flightCard);
            });

            document.querySelectorAll('.compare-button').forEach(button => {
                button.addEventListener('click', addToCompare);
            });

            document.querySelectorAll('.add-to-cart-button').forEach(button => {
                button.addEventListener('click', addToCart);
            });
        } else {
            searchResults.innerHTML = '<p>No flights found.</p>';
        }
    }

    function toggleForms() {
        var oneWayForm = document.getElementById('flight-search-form-one-way');
        var roundTripForm = document.getElementById('flight-search-form-round-trip');
        var tripType = document.querySelector('input[name="tripType"]:checked').value;
        var compareContainer = document.getElementById('compare-container');
        var paginationControls = document.getElementById('pagination-controls');

        if (tripType === 'one-way') {
            oneWayForm.style.display = 'flex';
            roundTripForm.style.display = 'none';
        } else {
            oneWayForm.style.display = 'none';
            roundTripForm.style.display = 'flex';
        }

        if (compareContainer) {
            compareContainer.style.display = 'none';
            compareContainer.innerHTML = '';
        }

        paginationControls.style.display = 'none';
        paginationControls.innerHTML = '';

        searchResults.innerHTML = '';
        filters.style.display = 'none';
    }

    function performSearch() {
        var compareContainer = document.getElementById('compare-container');
        var paginationControls = document.getElementById('pagination-controls');

        if (compareContainer) {
            compareContainer.style.display = 'block';
        }
        paginationControls.style.display = 'flex';
    }

    document.querySelectorAll('input[name="tripType"]').forEach(function(radio) {
        radio.addEventListener('change', toggleForms);
    });

    toggleForms();

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
});