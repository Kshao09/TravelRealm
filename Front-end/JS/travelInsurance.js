import { initializeAuth } from "../JS/Auth/auth.js";

const apiKey = 'AIzaSyDJr8pK1DDoOPSiFf9P2leCvQwdmFr2iiw';
const insuranceApiKey = '';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('insurance-form');

    initializeAuth();

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const destination = document.getElementById('destination').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const travelerAge = document.getElementById('traveler-age').value;

        const insuranceApiURL = `https://api.visitorscoverage.com/travel-insurance?
        destination=${destination}&start_date=${startDate}&end_date=${endDate}&traveler_age=${travelerAge}`;

        try {
            const response = await fetch(insuranceApiURL, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${insuranceApiKey}`,
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const optionsDiv = document.getElementById("insurance-options");

            optionsDiv.innerHTML = '';

            data.forEach(option => {
                const optionDiv = document.createElement('div');
                optionDiv.innerHTML = `<h3>${option.plan_name}</h3><p>Price: ${option.price}</p>`;
                optionsDiv.appendChild(optionDiv);
            });
        } catch (error) {
            console.error('Error:', error);
        }
    })

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