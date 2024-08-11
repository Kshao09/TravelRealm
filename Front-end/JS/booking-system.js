import { initializeAuth } from "../JS/Auth/auth.js";

window.nextPage = nextPage;

document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    initializeEventListeners();
    populateFlightDetails();
    populateHotelDetails();
    populateCarDetails();
});

function initializeEventListeners() {
    const checkOutFlight = document.getElementById('check-out-flight');
    const checkOutHotel = document.getElementById('check-out-hotel');
    const checkOutCar = document.getElementById('check-out-car');
    const returnBtnFlight = document.getElementById('return-flight');
    const returnBtnHotel = document.getElementById('return-hotel');
    const returnBtnCar = document.getElementById('return-car');
    const bookingForm = document.getElementById('booking-form');
    const scrollBtn = document.getElementById('scroll-top-button');

    checkOutFlight.addEventListener('click', showBookingForm);
    checkOutHotel.addEventListener('click', showBookingForm);
    checkOutCar.addEventListener('click', showBookingForm);

    returnBtnFlight.addEventListener('click', () => {
        localStorage.removeItem('selectedFlight');
        window.location.href = '../HTML/flight-search.html';
    });

    returnBtnHotel.addEventListener('click', () => {
        localStorage.removeItem('selectedHotel');
        localStorage.removeItem('nights');
        localStorage.removeItem('exchangeRate');
        window.location.href = '../HTML/hotel-search.html';
    });

    returnBtnCar.addEventListener('click', () => {
        localStorage.removeItem('selectedCar');
        window.location.href = '../HTML/car-search.html';
    });

    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    window.addEventListener('scroll', () => {
        if (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) {
            scrollBtn.style.display = 'block';
        } else {
            scrollBtn.style.display = 'none';
        }
    });
}

function populateFlightDetails() {
    const flightData = JSON.parse(localStorage.getItem('selectedFlight'));
    if (flightData) {
        const flightDetails = document.querySelector('.flight');
        flightDetails.querySelector('h3').textContent = `Flight Number: ${flightData.legs[0].segments[0].flightNumber}`;
        flightDetails.querySelector('p:nth-of-type(1)').innerHTML = `<strong>Airline:</strong> ${flightData.legs[0].carriers.marketing[0].name}`;
        flightDetails.querySelector('p:nth-of-type(2)').innerHTML = `<strong>From:</strong> ${flightData.legs[0].origin.displayCode}`;
        flightDetails.querySelector('p:nth-of-type(3)').innerHTML = `<strong>To:</strong> ${flightData.legs[0].destination.displayCode}`;
        flightDetails.querySelector('p:nth-of-type(4)').innerHTML = `<strong>Departure:</strong> ${new Date(flightData.legs[0].departure).toLocaleTimeString()}`;
        flightDetails.querySelector('p:nth-of-type(5)').innerHTML = `<strong>Arrival:</strong> ${new Date(flightData.legs[0].arrival).toLocaleTimeString()}`;
        flightDetails.querySelector('p:nth-of-type(6)').innerHTML = `<strong>Duration:</strong> ${Math.floor(flightData.legs[0].durationInMinutes / 60)} hours ${flightData.legs[0].durationInMinutes % 60} minutes`;
        flightDetails.querySelector('p:nth-of-type(7)').innerHTML = `<strong>Price:</strong> ${flightData.price.formatted}`;
    } else {
        const flightSection = document.getElementById('flight-details');
        flightSection.style.display = 'none';
    }
}

function populateHotelDetails() {
    const hotelData = JSON.parse(localStorage.getItem("selectedHotel"));
    const exchangeRate = JSON.parse(localStorage.getItem('exchangeRate'));
    const nights = JSON.parse(localStorage.getItem('nights'));

    if (hotelData) {
        const hotelDetails = document.querySelector('.hotel');
        const rawPrice = hotelData.rawPrice;
        const convertedPrice = (rawPrice * exchangeRate).toFixed(2);
        const totalPrice = convertedPrice * nights;
        hotelDetails.querySelector('h3').textContent = `Hotel: ${hotelData.name}`;
        hotelDetails.querySelector('p:nth-of-type(1)').innerHTML = `<strong>Distance:</strong> ${hotelData.distance}`;
        hotelDetails.querySelector('p:nth-of-type(2)').innerHTML = `<strong>Stars:</strong> ${hotelData.stars}`;
        hotelDetails.querySelector('p:nth-of-type(3)').innerHTML = `<strong>Price: $</strong>${totalPrice} for ${nights} nights`;
        hotelDetails.querySelector('p:nth-of-type(4)').innerHTML = `<strong>Cheapest Offer Partner:</strong> ${hotelData.cheapestOfferPartnerName}`;
    } else {
        const hotelSection = document.getElementById('hotel-details');
        hotelSection.style.display = 'none';
    }
}

function populateCarDetails() {
    const carData = JSON.parse(localStorage.getItem("selectedCar"));
    if (carData) {
        const carDetails = document.querySelector(".car");
        carDetails.querySelector('h3').textContent = `Car: ${carData.car_name}`;
        carDetails.querySelector('p:nth-of-type(1)').innerHTML = `<strong>Class:</strong> ${carData.cls}`;
        carDetails.querySelector('p:nth-of-type(2)').innerHTML = `<strong>Doors:</strong> ${carData.doors}`;
        carDetails.querySelector('p:nth-of-type(3)').innerHTML = `<strong>Seats:</strong> ${carData.max_seats}`;
        carDetails.querySelector('p:nth-of-type(4)').innerHTML = `<strong>Transmission:</strong> ${carData.trans}`;
        carDetails.querySelector('p:nth-of-type(5)').innerHTML = `<strong>Fuel Type:</strong> ${carData.fuel_type}`;
        carDetails.querySelector('p:nth-of-type(6)').innerHTML = `<strong>Price:</strong> $${carData.mean_price.toFixed(2)}`;
    } else {
        const carSection = document.getElementById('car-details');
        carSection.style.display = 'none';
    }
}

function showBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    bookingForm.style.display = 'block';
}

let currentPage = 1;

function nextPage() {
    const currentPageElement = document.getElementById(`page-${currentPage}`);
    const inputs = currentPageElement.querySelectorAll('input');
    let allValid = true;

    inputs.forEach(input => {
        if (!input.checkValidity()) {
            allValid = false;
            input.reportValidity();
        }
    });

    if (allValid) {
        currentPageElement.style.display = 'none';
        currentPage++;
        const nextPageElement = document.getElementById(`page-${currentPage}`);
        if (nextPageElement) {
            nextPageElement.style.display = 'block';
        }
    }

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

    bookingForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        const bookingData = {
            firstName: formData.get('first-name'),
            middleName: formData.get('middle-name'),
            lastName: formData.get('last-name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            zip: formData.get('zip'),
            apartment: formData.get('apartment'),
            cardName: formData.get('cardname'),
            cardNumber: formData.get('cardnumber'),
            cardExpiry: formData.get('expiry'),
            cardCVV: formData.get('cvv'),
            additionalInfo: formData.get('additionalinfo')
        };

        try {
            const paymentResponse = await fetch('http://localhost:8080/api/process-payment', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cardNumber: bookingData.cardNumber,
                    cardExpiry: bookingData.cardExpiry,
                    cardCVV: bookingData.cardCVV,
                    amount: 1
                })
            });

            if (!paymentResponse.ok) {
                throw new Error("Payment processing failed");
            }

            const emailResponse = await fetch('http://localhost:8080/api/send-email', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: bookingData.email,
                    from: "Kshao001@fiu.edu",
                    subject: "Booking Confirmation",
                    text: `Dear ${bookingData.firstName},\n\nYour booking has been confirmed.\n\nThank you!`
                })
            });

            if (!emailResponse.ok) {
                throw new Error('Email sending failed');
            }

            alert('Booking confirmed and email sent!');

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    })
}