import { initializeAuth } from "../JS/Auth/auth.js";

document.addEventListener("DOMContentLoaded", function() {
    initializeAuth();

    var header = document.getElementById('header');
    var title = document.getElementById('title');
    var name = localStorage.getItem('name');

    title.innerHTML = `${name}'s Favorites`;
    header.innerHTML = `${name}'s Favorites List`;

    function updateFavoritesList() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const favoritesList = document.getElementById('favoritesList');

        favoritesList.innerHTML = '';

        favorites.forEach(favorite => {
            const li = document.createElement('li');
            li.textContent = favorite;
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = 'Remove';
            removeBtn.onclick = () => removeFavorite(favorite);

            li.appendChild(removeBtn);
            favoritesList.appendChild(li);
        });
    }

    function removeFavorite(favorite) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites = favorites.filter(item => item !== favorite);

        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesList();
    }

    updateFavoritesList();

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