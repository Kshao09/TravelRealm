document.addEventListener('DOMContentLoaded', function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const verificationString = urlParams.get('verificationString');

    if (!verificationString) {
        displayFail();
        return;
    }

    verifyEmail(verificationString);
});

function verifyEmail(verificationString) {
    fetch('http://localhost:8080/api/verify-email', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verificationString }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem('token', data.token);
                displaySuccess();
            } else {
                displayFail();
            }
        })
        .catch(() => {
            displayFail();
        });
}

function displayFail() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('verification-fail').style.display = 'block';
}

function displaySuccess() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('verification-success').style.display = 'block';
}

function goToSignUp() {
    window.location.href = '/HTML/login_register.html';
}

function goToDashboard() {
    window.location.href = '/HTML/user-dashboard.html';
}