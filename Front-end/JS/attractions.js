import { initializeAuth } from "../JS/Auth/auth.js";

const geocodeApiKey = 'AIzaSyD7dq9OanySEpe6RiGTOc_eFaX1biHFmAc';
let service;

document.addEventListener('DOMContentLoaded', async function() {
    const searchBtn = document.getElementById('searchBtn');
    const paginationControls = document.getElementById('pagination-controls');
    const resultsList = document.getElementById('resultsList');

    initializeAuth();
    initMap();

    async function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 0, lng: 0 },
            zoom: 2
        });

        searchBtn.addEventListener('click', async function() {
            const city = document.getElementById('city').value;
            const state = document.getElementById('state').value;
            const typeSelect = document.getElementById('typeSelect').value;
            const radius = document.getElementById('radius').value;

            const location = `${city}, ${state}`;

            try {
                const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${geocodeApiKey}`;
                const geocodeResponse = await fetch(geocodeUrl);

                if (!geocodeResponse.ok) {
                    throw new Error("Search Location failed");
                }

                const geocodeData = await geocodeResponse.json();

                if (!geocodeData.results || geocodeData.results.length === 0) {
                    throw new Error("No location data found");
                }

                const lat = geocodeData.results[0].geometry.location.lat;
                const lng = geocodeData.results[0].geometry.location.lng;

                map.setCenter({ lat, lng });
                map.setZoom(12);

                service = new google.maps.places.PlacesService(map);
                const request = {
                    location: new google.maps.LatLng(lat, lng),
                    radius: radius,
                    type: [typeSelect]
                };

                service.nearbySearch(request, function(results, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        displayAttractions(results, 1);
                        addPaginationControls(results, results.length, 10, 1, displayAttractions);
                    } else {
                        console.error('Places search failed:', status);
                    }
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        });

        function displayAttractions(attractions, pageNumber = 1) {
            const pageSize = 10;
            const paginatedAttractions = paginate(attractions, pageSize, pageNumber);

            resultsList.innerHTML = '';

            if (paginatedAttractions.length > 0) {
                paginatedAttractions.forEach(place => {
                    const attractionElement = document.createElement('div');
                    attractionElement.classList.add('result-container');

                    const name = document.createElement('h2');
                    name.textContent = place.name;
                    attractionElement.appendChild(name);

                    const address = document.createElement('p');
                    address.textContent = place.vicinity;
                    attractionElement.appendChild(address);

                    if (place.photos && place.photos.length > 0) {
                        const img = document.createElement('img');
                        img.src = place.photos[0].getUrl({ maxWidth: 500, maxHeight: 500 });
                        img.alt = place.name;
                        attractionElement.appendChild(img);
                    }

                    if (place.rating) {
                        const rating = document.createElement('p');
                        rating.textContent = `Rating: ${place.rating}`;
                        attractionElement.appendChild(rating);
                    }

                    if (place.user_ratings_total) {
                        const reviews = document.createElement('p');
                        reviews.textContent = `Reviews: ${place.user_ratings_total}`;
                        attractionElement.appendChild(reviews);
                    }

                    service.getDetails({ placeId: place.place_id }, function(details, status) {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            if (details.reviews && details.reviews.length > 0) {
                                const review = document.createElement('p');
                                review.textContent = `Review: ${details.reviews[0].text}`;
                                attractionElement.appendChild(review);
                            }

                            if (details.website) {
                                const website = document.createElement('a');
                                website.href = details.website;
                                website.textContent = "Website";
                                website.target = "_blank";
                                attractionElement.appendChild(website);
                            }
                        }
                    });

                    const star = document.createElement('span');
                    star.classList.add('star');
                    star.setAttribute('data-name', place.name);
                    star.innerHTML = '☆';

                    attractionElement.appendChild(star);
                    resultsList.appendChild(attractionElement);
                });

                addStars();
            } else {
                resultsList.innerHTML = '<p>No attractions found.</p>';
            }

            addPaginationControls(attractions, attractions.length, pageSize, pageNumber, displayAttractions);
        }

        function paginate(data, pageSize = 10, pageNumber = 1) {
            const start = (pageNumber - 1) * pageSize;
            const end = start + pageSize;
            return data.slice(start, end);
        }

        function addPaginationControls(attractions, totalItems, pageSize, currentPage, displayFunction) {
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
                    if (typeof displayFunction === 'function') {
                        displayFunction(attractions, page);
                        addPaginationControls(attractions, totalItems, pageSize, page, displayFunction);
                    } else {
                        console.error('displayFunction is not a function');
                    }
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

        function addStars() {
            const stars = document.querySelectorAll('.star');

            stars.forEach(star => {
                star.addEventListener('click', function() {
                    const attractionName = this.getAttribute('data-name');
                    toggleFavorite(attractionName, this);
                });
            });
        }

        function toggleFavorite(attractionName, starElement) {
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

            if (favorites.includes(attractionName)) {
                favorites = favorites.filter(item => item !== attractionName);
                starElement.style.color = '';
            } else {
                favorites.push(attractionName);
                starElement.style.color = 'blue';
            }

            localStorage.setItem('favorites', JSON.stringify(favorites));
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

        const apiKeyLanguage = 'AIzaSyDJr8pK1DDoOPSiFf9P2leCvQwdmFr2iiw';

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
            const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKeyLanguage}`;

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
    }
});