import { initializeAuth } from "../JS/Auth/auth.js";

let hotelData = null;
let exchangeRate = null;
let filteredHotels = [];

document.addEventListener("DOMContentLoaded", function() {
    initializeAuth();

    var hotelSearch = document.getElementById('hotel-search-form');
    const searchResults = document.getElementById('search-results');
    const paginationControls = document.getElementById('pagination-controls');
    const filters = document.querySelector('.filters');

    filters.style.display = 'none';

    hotelSearch.addEventListener('submit', async function(event) {
        event.preventDefault();

        var destination = document.getElementById('destination').value;
        var checkIn = document.getElementById('checkIn').value;
        var checkOut = document.getElementById('checkOut').value;
        var guests = document.getElementById('guests').value;
        var rooms = document.getElementById('rooms').value;

        const entityId = await getEntityId(destination);

        if (!entityId) {
            searchResults.innerHTML = `<p>Destination not found.</p>`;
            return;
        }

        const apiKey = '3040e0768amshdf467137c063a99p1b6efcjsncd929a03fb6d';
        const apiUrl = `https://skyscanner80.p.rapidapi.com/api/v1/hotels/search?entityId=${entityId}&checkin=${checkIn}&checkout=${checkOut}&rooms=${rooms}&adults=${guests}`;

        try {
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    'x-rapidapi-key': apiKey,
                    'x-rapidapi-host': 'skyscanner80.p.rapidapi.com'
                }
            });

            const data = await response.json();

            if (response.ok) {
                hotelData = data;
                searchHotels(data);
                filters.style.display = 'flex';
                performSearch();
            } else {
                searchResults.innerHTML = `<p>No Hotels found. Error: ${data.error.message}</p>`;
                console.log("Failed to fetch Hotel data:", data);
            }
        } catch (error) {
            console.error("Error: ", error);
            searchResults.innerHTML = `<p>Error fetching Hotel Data: ${error.message} </p>`;
        }
    });

    async function getEntityId(destination) {
        const apiKey = '3040e0768amshdf467137c063a99p1b6efcjsncd929a03fb6d';
        const apiUrl = `https://skyscanner80.p.rapidapi.com/api/v1/hotels/auto-complete?query=${destination}`;

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
                return data.data[0].entityId;
            }
        } catch (error) {
            console.error("Error: ", error);
        }
        return null;
    }

    async function getExchangeRate() {
        const apiKey = '5739d0b0954a8c35d8622803';
        const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/INR`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            return data.conversion_rates.USD;
        } catch (error) {
            console.error("Error fetching exchange rate: ", error);
            return null;
        }
    }

    function calculateNights(checkIn, checkOut) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const timeDifference = checkOutDate - checkInDate;
        const nights = timeDifference / (1000 * 3600 * 24);
        localStorage.setItem('nights', nights);
        return nights;
    }

    async function searchHotels(data) {
        const hotels = data.data.hotels;

        exchangeRate = await getExchangeRate();

        if (!exchangeRate) {
            searchResults.innerHTML = '<p>Error fetching exchange rate.</p>';
            return;
        }

        localStorage.setItem('exchangeRate', exchangeRate);

        if (hotels && hotels.length > 0) {
            const nights = calculateNights(document.getElementById('checkIn').value, document.getElementById('checkOut').value);
            displayHotels(hotels, nights, exchangeRate, 1);
            addPaginationControls(hotels.length, 10, 1, displayHotels, nights, exchangeRate);
        } else {
            searchResults.innerHTML = '<p>No hotels found.</p>';
        }
    }

    async function displayHotels(hotels, nights, exchangeRate, pageNumber = 1) {
        const pageSize = 10;
        const paginatedHotels = paginate(hotels, pageSize, pageNumber);

        searchResults.innerHTML = '';

        if (paginatedHotels.length > 0) {
            paginatedHotels.forEach(hotel => {
                const hotelElement = document.createElement('div');
                hotelElement.classList.add('hotel-card');

                const hotelName = hotel.name;
                const hotelImages = hotel.images;

                const hotelPriceInINR = parseInt(hotel.price.replace(/[^\d]/g, ''));
                const hotelPriceInUSD = (hotelPriceInINR * exchangeRate).toFixed(2);
                const totalPriceInINR = hotelPriceInINR * nights;
                const totalPriceInUSD = (totalPriceInINR * exchangeRate).toFixed(2);

                let carouselInnerHtml = '<div class="carousel">';
                hotelImages.forEach((image, index) => {
                    carouselInnerHtml += `
                        <div class="${index === 0 ? 'carousel-item active' : 'carousel-item'}">
                            <img src="${image}" alt="Image ${index + 1}">
                        </div>
                    `;
                });

                carouselInnerHtml += '</div>';

                hotelElement.innerHTML = `
                    <h2>${hotelName}</h2>
                    <p>Rating: ${hotel.stars}</p>
                    <p>Price per night: $${hotelPriceInUSD}</p>
                    <p>Total price for ${nights} nights: $${totalPriceInUSD}</p>
                    ${carouselInnerHtml}
                    <button class="compare-button" data-hotel='${JSON.stringify(hotel)}'>Compare</button>
                    <button class='add-to-cart-button' data-hotel='${JSON.stringify(hotel)}'>+</button>`
                    ;

                searchResults.appendChild(hotelElement);
            });

            document.querySelectorAll('.compare-button').forEach(button => {
                button.addEventListener('click', addToCompare);
            });

            document.querySelectorAll('.add-to-cart-button').forEach(button => {
                button.addEventListener('click', addToCart);
            });
        } else {
            searchResults.innerHTML = '<p>No hotels found.</p>';
        }
    }

    function paginate(data, pageSize = 10, pageNumber = 1) {
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;
        return data.slice(start, end);
    }

    function addPaginationControls(totalItems, pageSize, currentPage, displayFunction, nights, exchangeRate) {
        const totalPages = Math.ceil(totalItems / pageSize);
        paginationControls.innerHTML = '';

        function createPageButton(page) {
            const pageButton = document.createElement('button');
            pageButton.textContent = page;
            pageButton.classList.add('page-button');

            if (page === currentPage) {
                pageButton.classList.add('active');
            }

            pageButton.addEventListener('click', () => {
                displayFunction(filteredHotels, page, nights, exchangeRate);
                addPaginationControls(totalItems, pageSize, page, displayFunction, nights, exchangeRate);
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

    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const starRating = document.getElementById('star-rating');
    const wifiCheckbox = document.getElementById('wifi');
    const breakfastCheckbox = document.getElementById('breakfast');

    minPriceInput.addEventListener('input', filterHotels);
    maxPriceInput.addEventListener('input', filterHotels);
    starRating.addEventListener('change', filterHotels);
    wifiCheckbox.addEventListener('change', filterHotels);
    breakfastCheckbox.addEventListener('change', filterHotels);

    function filterHotels(e) {
        e.preventDefault();

        const minPrice = parseInt(minPriceInput.value) || 0;
        const maxPrice = parseInt(maxPriceInput.value) || Infinity;
        const selectedStarRating = parseInt(starRating.value) || 0;
        const wifiSelected = wifiCheckbox.checked;
        const breakfastSelected = breakfastCheckbox.checked;

        const nights = calculateNights(document.getElementById('checkIn').value, document.getElementById('checkOut').value);

        filteredHotels = hotelData.data.hotels.filter(hotel => {
            const hotelPriceInINR = parseInt(hotel.price.replace(/[^\d]/g, ''));
            const hotelPriceInUSD = hotelPriceInINR * exchangeRate;
            const hotelStars = hotel.stars;
            const hotelAmenities = hotel.amenities || [];

            const matchesPrice = hotelPriceInUSD >= minPrice && hotelPriceInUSD <= maxPrice;
            const matchesStars = hotelStars >= selectedStarRating;
            const matchesWifi = !wifiSelected || hotelAmenities.includes('wifi');
            const matchesBreakfast = !breakfastSelected || hotelAmenities.includes('breakfast');

            return matchesPrice && matchesStars && matchesWifi && matchesBreakfast;
        });

        displayFilteredHotels(filteredHotels, 1, nights, exchangeRate);
        addPaginationControls(filteredHotels.length, 10, 1, displayFilteredHotels, nights, exchangeRate);
    }

    function displayFilteredHotels(filteredHotels, pageNumber, nights, exchangeRate) {
        const pageSize = 10;
        const paginatedHotels = paginate(filteredHotels, pageSize, pageNumber);

        searchResults.innerHTML = '';

        if (paginatedHotels.length > 0) {
            paginatedHotels.forEach(hotel => {
                const hotelElement = document.createElement('div');
                hotelElement.classList.add('hotel-card');

                const hotelName = hotel.name;
                const hotelImages = hotel.images;

                const hotelPriceInINR = parseInt(hotel.price.replace(/[^\d]/g, ''));
                const hotelPriceInUSD = (hotelPriceInINR * exchangeRate).toFixed(2);
                const totalPriceInINR = hotelPriceInINR * nights;
                const totalPriceInUSD = (totalPriceInINR * exchangeRate).toFixed(2);

                let carouselInnerHtml = '<div class="carousel">';
                hotelImages.forEach((image, index) => {
                    carouselInnerHtml += `
                        <div class="${index === 0 ? 'carousel-item active' : 'carousel-item'}">
                            <img src="${image}" alt="Image ${index + 1}">
                        </div>
                    `;
                });

                carouselInnerHtml += '</div>';
                hotelElement.innerHTML = `
                    <h2>${hotelName}</h2>
                    <p>Rating: ${hotel.stars}</p>
                    <p>Price per night: $${hotelPriceInUSD}</p>
                    <p>Total price for ${nights} nights: $${totalPriceInUSD}</p>
                    ${carouselInnerHtml}
                    <button class="compare-button" data-hotel='${JSON.stringify(hotel)}'>Compare</button>
                    <button class="add-to-cart-button" data-hotel='${JSON.stringify(hotel)}'>+</button>`
                    ;

                searchResults.appendChild(hotelElement);
            });

            document.querySelectorAll('.compare-button').forEach(button => {
                button.addEventListener('click', addToCompare);
            });

            document.querySelectorAll('.add-to-cart-button').forEach(button => {
                button.addEventListener('click', addToCart);
            });
        } else {
            searchResults.innerHTML = '<p>No hotels found.</p>';
        }
    }

    const compareList = [];

    function addToCompare(event) {
        const hotelData = event.target.getAttribute('data-hotel');

        if (hotelData) {
            try {
                const hotel = JSON.parse(hotelData);
                if (!compareList.some(h => h.name === hotel.name)) {
                    compareList.push(hotel);
                    updateCompareList();
                } else {
                    alert("This hotel is already in the compare list.");
                }
            } catch (error) {
                console.error("Error parsing JSON:", error);
                console.log("Invalid JSON string:", hotelData);
            }
        } else {
            console.log("Tried to add null hotel to compareList");
        }
    }

    function removeFromCompare(event) {
        const hotelIndex = event.target.getAttribute('data-index');
        compareList.splice(hotelIndex, 1);
        updateCompareList();
    }

    function updateCompareList() {
        const compareContainer = document.getElementById('compare-container');

        if (!compareContainer) {
            const container = document.createElement('div');
            container.id = 'compare-container';
            container.innerHTML = `<h2>Compare Hotels</h2>
                                   <div id="compare-list"></div>`;

            document.body.appendChild(container);
        }

        const compareListDiv = document.getElementById('compare-list');
        compareListDiv.innerHTML = '';

        compareList.forEach((hotel, index) => {
            const hotelInfo = document.createElement('div');
            hotelInfo.classList.add('hotel-card');

            hotelInfo.innerHTML = `
                <h2>${hotel.name}</h2>
                <p>Rating: ${hotel.stars}</p>
                <p>Price per night: $${(parseInt(hotel.price.replace(/[^\d]/g, '')) * exchangeRate).toFixed(2)}</p>
                <button class="remove-button" data-index='${index}'>Remove</button>
                <button class="add-to-cart-button" data-hotel='${JSON.stringify(hotel)}'>+</button>`
                ;

            compareListDiv.appendChild(hotelInfo);
        });

        document.querySelectorAll('.remove-button').forEach(button => {
            button.addEventListener('click', removeFromCompare);
        });

        document.querySelectorAll('.add-to-cart-button').forEach(button => {
            button.addEventListener('click', addToCart);
        });
    }

    function addToCart(event) {
        const hotelData = event.target.getAttribute('data-hotel');

        if (hotelData) {
            localStorage.setItem('selectedHotel', hotelData);
            window.location.href = '/HTML/booking-system.html';
        } else {
            console.log("No hotel data to add to cart");
        }
    }

    function performSearch() {
        var compareContainer = document.getElementById('compare-container');
        var paginationControls = document.getElementById('pagination-controls');

        if (compareContainer) {
            compareContainer.style.display = 'block';
        }
        paginationControls.style.display = 'flex';
    }

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