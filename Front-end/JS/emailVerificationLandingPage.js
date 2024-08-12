import { verifyEmail as importedVerifyEmail } from "..JS/verifyEmail.js";

document.addEventListener('DOMContentLoaded', function() {
    const URLParts = window.location.pathname.split("/");
    const verificationString = URLParts[URLParts.length - 1];

    const signUpButton = document.getElementById('signup');
    const dashboardButton = document.getElementById('dashboard');

    if (!verificationString || verificationString === 'emailVerificationLandingPage.html') {
        displayFail();
        return;
    }

    verifyEmail(verificationString);

    signUpButton.addEventListener('click', function() {
        window.location.href = '../HTML/login_register.html';
    });
    
    dashboardButton.addEventListener('click', function() {
        window.location.href = '../HTML/user-dashboard.html';
    });

    importedVerifyEmail();
});

async function verifyEmail(verificationString) {
    try {
        const response = await fetch(`http://localhost:8080/api/verify-email/${verificationString}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Verification failed');
        }

        const data = await response.json();

        if (data.token) {
            localStorage.setItem('token', data.token);
            displaySuccess();
        } else {
            displayFail();
        }
    } catch (error) {
        console.error('Error:', error);
        displayFail();
    }
}

function displayFail() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('verification-fail').style.display = 'block';
}

function displaySuccess() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('verification-success').style.display = 'block';

    setTimeout(() => {
        window.location.href = '/HTML/user-dashboard.html';
    }, 3000);
}