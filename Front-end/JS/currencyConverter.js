const apiKey = 'AIzaSyDJr8pK1DDoOPSiFf9P2leCvQwdmFr2iiw';

document.addEventListener("DOMContentLoaded", function() {
    var convertBtn = document.getElementById('convertBtn');
    var swaptBtn = document.getElementById('swapBtn');
    const resultDiv = document.getElementById('result');

    convertBtn.addEventListener('click', async function() {
        const amount = document.getElementById('amount').value;
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;

        const apiKey = "5739d0b0954a8c35d8622803";
        const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            const rate = data.conversion_rates[toCurrency];
            const result = amount * rate;
            document.getElementById('result').innerText = `${amount} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`;
            resultDiv.style.display = 'block';
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
            document.getElementById('result').innerText = 'Error fetching exchange rate';
        }
    });

    swaptBtn.addEventListener('click', function() {
        const fromCurrency = document.getElementById('fromCurrency');
        const toCurrency = document.getElementById('toCurrency');
        const temp = fromCurrency.value;

        fromCurrency.value = toCurrency.value;
        toCurrency.value = temp;
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
})