import JWTHandler from "../JS/Auth/jwtHandler.js";
import OAuthHandler from "../JS/Auth/OAuthHandler.js";
import errorHandler from "../JS/Auth/errorHandler.js";

document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    });

    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error("Login Failed");
            }

            const data = await response.json();

            localStorage.setItem('name', data.info.name);
            localStorage.setItem('birthday', data.info.birthday);
            localStorage.setItem('ethnicity', data.info.ethnicity);

            JWTHandler.setToken(data.accessToken);
            JWTHandler.setRefreshToken(data.refreshToken);
            window.location.href = '/HTML/user-dashboard.html';

        } catch (error) {
            errorHandler.displayError(error);
            errorHandler.showErrorToUser(error.message);
        }
    });

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        var name = document.getElementById('register-name').value;
        var email = document.getElementById('register-email').value;
        var password = document.getElementById('register-password').value
        var confirmPassword = document.getElementById('confirm-password').value;
        var birthday = document.getElementById('register-birthday').value;
        var ethnicity = document.getElementById('register-ethnicity').value;

        if (password !== confirmPassword) {
            alert("Passwords don't match! Please try again!");
            return;
        }

        localStorage.setItem('name', name);
        localStorage.setItem('birthday', birthday);
        localStorage.setItem('ethnicity', ethnicity);

        try {
            const response = await fetch('http://localhost:8080/api/signup', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, birthday, ethnicity })
            });

            if (!response.ok) {
                throw new Error("Register Failed");
            }

            const data = await response.json();
            JWTHandler.setToken(data.accessToken);
            JWTHandler.setRefreshToken(data.refreshToken);
            window.location.href = '/HTML/verifyEmail.html';

        } catch (error) {
            errorHandler.displayError(error);
            errorHandler.showErrorToUser(error.message);
        }
    });

    const googleLoginButton = document.getElementById('googleLoginButton');

    googleLoginButton.addEventListener('click', async function() {
        try {
            const response = await fetch('http://localhost:8080/auth/google/url');

            if (!response.ok) {
                throw new Error('Failed to get Google OAuth URL');
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.log("Error", error);
            res.status(500).json({ message: error.message });
        }
    });
});