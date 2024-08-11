import { initializeAuth } from "../JS/Auth/auth.js";

let carData = null;
let filteredCars = [];

document.addEventListener("DOMContentLoaded", function() {
    initializeAuth();

    var carSearch = document.getElementById('car-search-form');
    const searchResults = document.getElementById('search-results');
    const paginationControls = document.getElementById('pagination-controls');
    const filters = document.getElementById('filters');

    filters.style.display = 'none';

    carSearch.addEventListener('submit', async function(event) {
        event.preventDefault();

        var pickupLocation = document.getElementById('pickupLocation').value;
        var pickupDate = document.getElementById('pickupDate').value;
        var pickupTime = document.getElementById('pickupTime').value;
        var dropoffDate = document.getElementById('dropoffDate').value;
        var dropoffTime = document.getElementById('dropoffTime').value;

        const pickupEntityId = await getPickUpEntityId(pickupLocation);

        if (!pickupEntityId) {
            searchResults.innerHTML = '<p>Location not found.</p>';
            return;
        }

        const apiKey = '3040e0768amshdf467137c063a99p1b6efcjsncd929a03fb6d';
        const apiUrl = `https://skyscanner80.p.rapidapi.com/api/v1/cars/search-cars?pickUpEntityId=${pickupEntityId}&pickUpDate=${pickupDate}&pickUpTime=${pickupTime}&dropOffDate=${dropoffDate}&dropOffTime=${dropoffTime}`;

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
                carData = data;
                searchCars(data);
                filters.style.display = 'flex';
                performSearch();
            } else {
                searchResults.innerHTML = `<p>No Cars Found. Error: ${data.error.message}</p>`;
                console.log("Failed to fetch Car data: ", data);
            }
        } catch (error) {
            console.error("Error: ", error);
            searchResults.innerHTML = `<p>Error fetching Car Data: ${error.message}</p>`;
        }
    });

    async function getPickUpEntityId(pickupLocation) {
        const apiKey = '3040e0768amshdf467137c063a99p1b6efcjsncd929a03fb6d';
        const apiUrl = `https://skyscanner80.p.rapidapi.com/api/v1/cars/search-location?query=${pickupLocation}`;

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
                return data.data[0].entity_id;
            } else {
                console.log("No locations found for:", pickupLocation);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
        return null;
    }

    async function searchCars(data) {
        const cars = Object.values(data.data.groups);

        if (cars && cars.length > 0) {
            displayCars(cars, 1);
            addPaginationControls(cars.length, 15, 1, displayCars);
        } else {
            searchResults.innerHTML = '<p>No cars found.</p>';
        }
    }

    function displayCars(cars, pageNumber = 1) {
        const pageSize = 15;
        const paginatedCars = paginate(cars, pageSize, pageNumber);

        searchResults.innerHTML = '';

        if (paginatedCars.length > 0) {
            paginatedCars.forEach(car => {
                const carElement = document.createElement('div');
                carElement.classList.add('car-card');

                carElement.innerHTML = `<h2>${car.car_name}</h2>
                                        <p>Type: ${car.cls}</p>
                                        <p class="price">Total Mean price: $${car.mean_price.toFixed(2)}</p>
                                        <p>Max Seats: ${car.max_seats}</p>
                                        <p>Max-bags: ${car.max_bags}</p>
                                        <p>Pickup-Method: ${car.pickup_method}</p>
                                        <button class="compare-button" data-car='${JSON.stringify(car)}'>Compare</button>
                                        <button class='add-to-cart-button' data-car='${JSON.stringify(car)}'>+</button>`;
                searchResults.appendChild(carElement);
            });

            document.querySelectorAll('.compare-button').forEach(button => {
                button.addEventListener('click', addToCompare);
            });

            document.querySelectorAll('.add-to-cart-button').forEach(button => {
                button.addEventListener('click', addToCart);
            });
        } else {
            searchResults.innerHTML = '<p>No cars found.</p>';
        }
    }

    function paginate(data, pageSize = 15, pageNumber = 1) {
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;
        return data.slice(start, end);
    }

    function addPaginationControls(totalItems, pageSize, currentPage, displayFunction) {
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
                displayFunction(filteredCars, page);
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

    document.getElementById('min-price').addEventListener('input', filterCars);
    document.getElementById('max-price').addEventListener('input', filterCars);
    document.getElementById('car-type').addEventListener('change', filterCars);
    document.getElementById('seats').addEventListener('input', filterCars);
    document.getElementById('transmission').addEventListener('change', filterCars);
    document.getElementById('fuel-type').addEventListener('change', filterCars);
    document.getElementById('pickup-method').addEventListener('change', filterCars);

    function filterCars(event) {
        event.preventDefault();

        if (!carData) {
            searchResults.innerHTML = '<p>Please perform a search first.</p>';
            return;
        }

        const minPrice = document.getElementById('min-price').value;
        const maxPrice = document.getElementById('max-price').value;
        const carType = document.getElementById('car-type').value;
        const seats = document.getElementById('seats').value;
        const transmission = document.getElementById('transmission').value;
        const fuelType = document.getElementById('fuel-type').value;
        const pickupMethod = document.getElementById('pickup-method').value;

        filteredCars = Object.values(carData.data.groups).filter(car => {
            return (!minPrice || car.mean_price >= minPrice) &&
                (!maxPrice || car.mean_price <= maxPrice) &&
                (!carType || car.cls === carType) &&
                (!seats || car.max_seats >= seats) &&
                (!transmission || car.trans === transmission) &&
                (!fuelType || car.fuel_type === fuelType) &&
                (!pickupMethod || car.pickup_method === pickupMethod);
        });

        displayFilteredCars(filteredCars, 1);
        addPaginationControls(filteredCars.length, 15, 1, displayFilteredCars);
    }

    function displayFilteredCars(filteredCars, pageNumber) {
        const pageSize = 15;
        const paginatedCars = paginate(filteredCars, pageSize, pageNumber);

        searchResults.innerHTML = '';

        if (paginatedCars.length > 0) {
            paginatedCars.forEach(car => {
                const carElement = document.createElement('div');
                carElement.classList.add('car-card');

                carElement.innerHTML = `<h2>${car.car_name}</h2>
                                        <p>Type: ${car.cls}</p>
                                        <p class="price">Total Mean price: $${car.mean_price.toFixed(2)}</p>
                                        <p>Max Seats: ${car.max_seats}</p>
                                        <p>Max-bags: ${car.max_bags}</p>
                                        <p>Pickup-Method: ${car.pickup_method}</p>
                                        <button class="compare-button" data-car='${JSON.stringify(car)}'>Compare</button>
                                        <button class='add-to-cart-button' data-car='${JSON.stringify(car)}'>+</button>`;
                searchResults.appendChild(carElement);
            });

            document.querySelectorAll('.compare-button').forEach(button => {
                button.addEventListener('click', addToCompare);
            });

            document.querySelectorAll('.add-to-cart-button').forEach(button => {
                button.addEventListener('click', addToCart);
            });
        } else {
            searchResults.innerHTML = '<p>No cars found.</p>';
        }
    }

    const compareList = [];

    function addToCompare(event) {
        const carData = event.target.getAttribute('data-car');

        if (carData) {
            const car = JSON.parse(carData);
            if (!compareList.some(c => c.car_name === car.car_name)) {
                compareList.push(car);
                updateCompareList();
            } else {
                alert("This car is already in the compare list.");
            }
        } else {
            console.log("Tried to add null car to compareList");
        }
    }

    function removeFromCompare(event) {
        const carIndex = event.target.getAttribute('data-index');
        compareList.splice(carIndex, 1);
        updateCompareList();
    }

    function updateCompareList() {
        const compareContainer = document.getElementById('compare-container');

        if (!compareContainer) {
            const container = document.createElement('div');
            container.id = 'compare-container';
            container.innerHTML = `<h2>Compare Cars</h2>
                                   <div id="compare-list"></div>`;

            document.body.appendChild(container);
        }

        const compareListDiv = document.getElementById('compare-list');
        compareListDiv.innerHTML = '';

        compareList.forEach((car, index) => {
            const carInfo = document.createElement('div');
            carInfo.classList.add('car-card');

            carInfo.innerHTML = `<h2>${car.car_name}</h2>
                                 <p>Type: ${car.cls}</p>
                                 <p class="price">Total Mean price: $${car.mean_price.toFixed(2)}</p>
                                 <p>Max Seats: ${car.max_seats}</p>
                                 <p>Max-bags: ${car.max_bags}</p>
                                 <p>Pickup-Method: ${car.pickup_method}</p>
                                 <button class="remove-button" data-index='${index}'>Remove</button>
                                 <button class='add-to-cart-button' data-car='${JSON.stringify(car)}'>+</button>`;
            compareListDiv.appendChild(carInfo);
        });

        document.querySelectorAll('.remove-button').forEach(button => {
            button.addEventListener('click', removeFromCompare);
        });

        document.querySelectorAll('.add-to-cart-button').forEach(button => {
            button.addEventListener('click', addToCart);
        });
    }

    function addToCart(event) {
        const carData = event.target.getAttribute('data-car');

        if (carData) {
            localStorage.setItem('selectedCar', carData);
            window.location.href = '/HTML/booking-system.html';
        } else {
            console.log("No car data to add to cart");
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