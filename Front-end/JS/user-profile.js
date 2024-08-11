import JWTHandler from "../JS/Auth/jwtHandler.js";
import { initializeAuth } from "../JS/Auth/auth.js";
import errorHandler from "../JS/Auth/errorHandler.js"

document.addEventListener('DOMContentLoaded', async function() {
    const profileForm = document.getElementById('profile-form');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileBirthday = document.getElementById('profile-birthday');
    const profileNationality = document.getElementById('profile-nationality');
    const profileTier = document.getElementById('profile-tier');
    const profilePicture = document.getElementById('profile-picture');
    const profilePicturePreview = document.getElementById('profile-picture-preview');
    const notifications = document.getElementById('notifications');
    const languageSelect = document.getElementById('language-select');

    async function displayUserInfo() {
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

            profileName.value = userInfo.info.name || '';
            profileEmail.value = userInfo.email || '';
            profileBirthday.value = userInfo.birthday || '';
            profileNationality.value = userInfo.nationality || '';
            profileTier.value = userInfo.tier || 'Basic';
            notifications.value = userInfo.notifications || 'disabled';

            const storedProfilePicture = localStorage.getItem('profilePicture');
            if (storedProfilePicture) {
                profilePicturePreview.src = storedProfilePicture;
                profilePicturePreview.style.display = 'block';
            }
        } catch (error) {
            errorHandler.displayError(error);
            errorHandler.showErrorToUser(error.message);
        }
    }

    try {
        await displayUserInfo();
        initializeAuth();
    } catch (error) {
        console.error('Error during DOMContentLoaded:', error);
    }

    profilePicture.addEventListener('change', function() {
        const file = profilePicture.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePicturePreview.src = e.target.result;
                profilePicturePreview.style.display = 'block';
                localStorage.setItem('profilePicture', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const updates = {
            name: profileName.value,
            email: profileEmail.value,
            birthday: profileBirthday.value,
            nationality: profileNationality.value,
            notifications: notifications.value
        };

        if (profilePicture.files[0]) {
            const reader = new FileReader();
            reader.onloadend = async function() {
                updates.profilePicture = reader.result;

                await updateUserProfile(updates);
            };

            reader.readAsDataURL(profilePicture.files[0]);
        } else {
            await updateUserProfile(updates);
        }
    });

    async function updateUserProfile(updates) {
        try {
            const token = await JWTHandler.getRefreshTokenIfNeeded();
            const userId = JWTHandler.getUserIdFromToken(token);

            let response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            const responseData = await response.json();
            const newAccessToken = responseData.newAccessToken;

            if (newAccessToken) {
                JWTHandler.setToken(newAccessToken);
                JWTHandler.setupTokenRefreshTimer();
                alert("Profile updated successfully");
            } else {
                throw new Error("No token received from server");
            }
        } catch (error) {
            errorHandler.displayError(error);
            errorHandler.showErrorToUser(error.message);
        }
    }

    notifications.addEventListener('change', async function() {
        const selectedValue = notifications.value;
        const email = profileEmail.value;
        const name = profileName.value;

        let subject, text;

        if (selectedValue === "enabled") {
            subject = "Subscription to Notifications";
            text = `Dear ${name},\n\nThank you for subscribing to TravelRealm. 
            \nWe appreciate the subscription and our support team looks forward to giving you the best experience possible!
            \n\nBest regards,
            \nCustomer Support Team`;
        } else if (selectedValue === "disabled") {
            subject = "Unsubscription from Notifications";
            text = `Dear ${name},\n\nYou have successfully unsubscribed from notifications.
            \n\nBest regards,
            \nCustomer Support Team`;
        }

        try {
            const response = await fetch("http://localhost:8080/api/send-email", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({
                    to: email,
                    from: "Kshao001@fiu.edu",
                    subject: subject,
                    text: text
                })
            });

            if (!response.ok) {
                throw new Error("Email sending failed");
            }

            alert('Notification email sent successfully!');
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while sending the email. Please try again.');
        }
    });

    const deleteAccountBtn = document.getElementById('deleteAccount');

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async function() {
            if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                try {
                    const token = JWTHandler.getToken();
                    const userId = JWTHandler.getUserIdFromToken(token);

                    const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                    })

                    if (!response.ok) {
                        throw new Error("Failed to delete account");
                    }

                    JWTHandler.clearToken();
                } catch (error) {
                    errorHandler.displayError(error);
                    errorHandler.showErrorToUser(error.message);
                }
            }
        });
    }

    const apiKey = 'AIzaSyDJr8pK1DDoOPSiFf9P2leCvQwdmFr2iiw';

    const preferredLanguage = localStorage.getItem('preferredLanguage');
    if (preferredLanguage) {
        languageSelect.value = preferredLanguage;
        translatePage(preferredLanguage);
    } else {
        languageSelect.value = 'en';
        translatePage('en');
    }

    languageSelect.addEventListener('change', function() {
        const selectedLanguage = this.value;
        localStorage.setItem('preferredLanguage', selectedLanguage);
        translatePage(selectedLanguage);
    });

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