document.addEventListener('DOMContentLoaded', async function() {
    let points = 0;
    const pointsBtn = document.getElementById('pointsBtn');
    const pointsDisplay = document.getElementById('points');
    const statusDisplay = document.getElementById('membership-status');
    const userId = '';

    let membershipStartDate = '';
    // let membershipStartDate = await fetchSignUpDate(userId);

    if (!membershipStartDate) {
        membershipStartDate = new Date();
        localStorage.setItem('membershipStartDate', membershipStartDate);
    } else {
        membershipStartDate = new Date(Date.parse(membershipStartDate));
    }

    pointsBtn.addEventListener('click', function() {
        points += 10;
        pointsDisplay.innerText = points;
        updateMembershipStatus(points);
    });

    function updateMembershipDuration() {
        const now = new Date();
        const duration = Math.floor((now - membershipStartDate) / (1000 * 60 * 60 * 24));
        document.getElementById('membershipDuration').innerText = `${duration} days`;
    }

    updateMembershipDuration();
    setInterval(updateMembershipDuration, 86400000);

    async function fetchSignUpDate(userId) {
        try {
            const response = await fetch(`http://localhost:8080/api/sign-up-date/${userId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return new Date(data.signupdate);
        } catch (error) {
            console.error("Error fetching sign-up date:", error);
        }
    }

    function updateMembershipStatus(points) {
        let status = "Basic";

        if (points >= 100000) {
            status = "Platinum";
        } else if (points >= 10000) {
            status = "Gold";
        } else if (points >= 1000) {
            status = "Silver";
        } else if (points >= 100) {
            status = "Bronze";
        }
        statusDisplay.innerText = status;
    }

    const dailyCtx = document.getElementById('dailyChart').getContext('2d');
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    const yearlyCtx = document.getElementById('yearlyChart').getContext('2d');

    const dailyChart = new Chart(dailyCtx, {
        type: "line",
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Points',
                data: [12, 19, 3, 5, 2, 3, 7],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        }
    });

    const monthlyChart = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Points',
                data: [120, 190, 300, 500, 200, 300, 700, 800, 900, 1000, 1100, 1200],
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        }
    });

    const yearlyChart = new Chart(yearlyCtx, {
        type: 'line',
        data: {
            labels: ['2020', '2021', '2022', '2023', '2024'],
            datasets: [{
                label: 'Points',
                data: [1200, 1900, 3000, 5000, 7000],
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        }
    });

    document.getElementById('dailyChart').style.display = 'none';
    document.getElementById('monthlyChart').style.display = 'none';
    document.getElementById('yearlyChart').style.display = 'none';

    const chartTypeSelect = document.getElementById('chartType');
    chartTypeSelect.addEventListener('click', function() {
        const selectedChart = chartTypeSelect.value;
        document.getElementById('dailyChart').style.display = selectedChart === "daily" ? "block" : "none";
        document.getElementById('monthlyChart').style.display = selectedChart === 'monthly' ? 'block' : 'none';
        document.getElementById('yearlyChart').style.display = selectedChart === 'yearly' ? 'block' : 'none';
    });

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