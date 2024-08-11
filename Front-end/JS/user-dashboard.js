import JWTHandler from "../JS/Auth/jwtHandler.js";
import { initializeAuth } from "../JS/Auth/auth.js";
import errorHandler from "../JS/Auth/errorHandler.js"

const apiKey = 'AIzaSyDJr8pK1DDoOPSiFf9P2leCvQwdmFr2iiw';
const geocodeApiKey = "AIzaSyD7dq9OanySEpe6RiGTOc_eFaX1biHFmAc";

document.addEventListener("DOMContentLoaded", async function() {
    initializeAuth();

    const profilePic = document.getElementById('profilePic');

    const storedProfilePicture = localStorage.getItem('profilePicture');

    if (storedProfilePicture) {
        profilePic.src = storedProfilePicture;
    }

    initMap();

    var form = document.getElementById("issue-complaint");
    var header = document.getElementById('header');   

    try {
        const token = await JWTHandler.getRefreshTokenIfNeeded();
        const userId = JWTHandler.getUserIdFromToken(token);

        let response = await fetch(`http://localhost:8080/api/users/${userId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to refresh token");
        }

        const userInfo = await response.json();
        var name = userInfo.info.name;

        header.innerHTML = `Hello, ${name}! 👋`;
    } catch(error) {
        errorHandler.displayError(error);
        errorHandler.showErrorToUser(error.message);
    }

    async function initMap() {
        var map = new google.maps.Map(document.getElementById('world-map-kpi'), {
            center: { lat: 0, lng: 0 },
            zoom: 2
        });

        try {
            async function getCoordinates(address) {
                const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${geocodeApiKey}`);

                const data = await response.json();
                const location = data.results[0].geometry.location;

                return { lat: location.lat, lng: location.lng };
            }

            function getCurrentLocation() {
                return new Promise((resolve, reject) => {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
                            },
                            (error) => {
                                reject(error);
                            }
                        );
                    } else {
                        reject(new Error('Geolocation is not supported by this browser.'));
                    }
                });
            }

            const destination = 'Los Angeles, CA';
            const additionalEndpoints = ['Chicago, IL', 'Houston, TX'];

            const currLocation = await getCurrentLocation();

            const addresses = [...additionalEndpoints, destination];

            const coordinates = await Promise.all([
                currLocation,
                ...addresses.map(getCoordinates)
            ]);

            var flightPath = new google.maps.Polyline({
                path: coordinates,
                geodesic: true,
                strokeColor: 'red',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });

            flightPath.setMap(map);
        } catch (error) {
            console.error('Error fetching coordinates:', error);
        }
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        const issueSelect = document.getElementById('issue');
        const issue = issueSelect.options[issueSelect.selectedIndex].text;

        const issueData = {
            issue: issue,
            name: formData.get('name'),
            email: formData.get('email'),
            details: formData.get('details')
        };

        try {
            const emailResponse = await fetch('http://localhost:8080/api/send-email', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: issueData.email,
                    from: "Kshao001@fiu.edu",
                    subject: "Support Inquiry Confirmation",
                    text: `Dear ${issueData.name},
                    \n\nThank you for reaching out to us regarding your ${issueData.issue}. 
                    \nWe have received your inquiry and will get back to you shortly.
                    \n\nDetails: ${issueData.details}
                    \n\nBest regards,
                    \nCustomer Support Team`
                })
            });

            if (!emailResponse.ok) {
                throw new Error('Email sending failed');
            }

            alert('Your inquiry has been submitted and a confirmation email has been sent!');
            event.target.reset();
        } catch(error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });

    profilePic.addEventListener('click', function() {
        this.src = '../HTML/user-profile.html'; 
    });

    document.getElementById('searchLink').addEventListener('click', function(event) {
        event.preventDefault();
        var dropdownContent = document.getElementById('dropdownContent');
        if (dropdownContent.style.display === 'block') {
            dropdownContent.style.display = 'none';
        } else {
            dropdownContent.style.display = 'block';
        }
    });

    document.addEventListener('click', function(e) {
        var isClick = document.getElementById('searchLink').contains(e.target) || 
            document.getElementById('dropdownContent').contains(e.target);

        if (!isClick) {
            document.getElementById('dropdownContent').style.display = 'none';
        }
    });

    document.getElementById('exploreLink').addEventListener('click', function(event) {
        event.preventDefault();
        var exploreDropdownContent = document.getElementById('exploreDropdownContent');
        if (exploreDropdownContent.style.display === 'block') {
            exploreDropdownContent.style.display = 'none';
        } else {
            exploreDropdownContent.style.display = 'block';
        }
    });

    document.addEventListener('click', function(e) {
        var isClick = document.getElementById('exploreLink').contains(e.target) || 
            document.getElementById('exploreDropdownContent').contains(e.target);

        if (!isClick) {
            document.getElementById('exploreDropdownContent').style.display = 'none';
        }
    });

    var dropdownLinks = document.querySelectorAll('.dropdown-content a');

    dropdownLinks.forEach(function(link) {
        link.addEventListener('click', function(event) {
            if (this.getAttribute('data-target')) {
                event.preventDefault();
                var targetId = this.getAttribute('data-target');
                toggleSection(targetId);
            }
        });
    });    

    function toggleSection(sectionId) {
        var section = document.getElementById(sectionId);
        if (section.style.display === 'none') {
            hideAllSections();
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    }

    function hideAllSections() {
        document.querySelectorAll('.content-section').forEach(function(section) {
            section.style.display = 'none';
        });
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

    const logoutBtn = document.getElementById('logoutButton');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            await JWTHandler.logoutUser();
        });
    }

    const monthNames = ["January", "February", "March", 
        "April", "May", "June", "July", "August", 
        "September", "October", "November", "December"];

    const daysContainer = document.getElementById('days');
    const monthName = document.getElementById('month-name');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    let currDate = new Date();

    function calendarDisplay(date) {
        daysContainer.innerHTML = '';
        monthName.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const today = new Date();

        for (let i = 0; i < firstDay; i++) {
            daysContainer.innerHTML += `<div class="empty"></div>`;
        }

        for (let i = 1; i <= lastDate; i++) {
            if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && i === today.getDate()) {
                daysContainer.innerHTML += `<div class="today">${i}</div>`;
            } else {
                daysContainer.innerHTML += `<div>${i}</div>`;
            }
        }

        const totalDays = firstDay + lastDate;
        const remainingDays = 7 - (totalDays % 7);
        if (remainingDays < 7) {
            for (let i = 0; i < remainingDays; i++) {
                daysContainer.innerHTML += `<div class="empty"></div>`;
            }
        }
    }    

    prevBtn.addEventListener('click', () => {
        currDate.setMonth(currDate.getMonth() - 1);
        calendarDisplay(currDate);
    });

    nextBtn.addEventListener('click', () => {
        currDate.setMonth(currDate.getMonth() + 1);
        calendarDisplay(currDate);
    });

    calendarDisplay(currDate);


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

