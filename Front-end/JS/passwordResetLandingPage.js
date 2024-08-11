document.addEventListener("DOMContentLoaded", function() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const resetButton = document.getElementById('reset-button');
    const resetContainer = document.getElementById('password-reset-container');
    const resetFail = document.getElementById('password-reset-fail');
    const resetSuccess = document.getElementById('password-reset-success');
    const backLoginFail = document.getElementById('back-login-fail');
    const backLoginSuccess = document.getElementById('back-login-success');

    passwordInput.addEventListener('input', updateButtonState);
    confirmPasswordInput.addEventListener('input', updateButtonState);

    resetButton.addEventListener('click', onResetClicked);
    backLoginFail.addEventListener('click', function() {
        window.location.href = "/HTML/login_register.html";
    });

    backLoginSuccess.addEventListener('click', function() {
        window.location.href = "/HTML/login_register.html";
    });

    function updateButtonState() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        resetButton.disabled = !password || !confirmPassword || password !== confirmPassword;
    }

    function getPasswordResetCodeFromURL() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const passwordResetCode = urlParams.get('passwordResetCode');
        return passwordResetCode;
    }

    async function onResetClicked() {
        const password = passwordInput.value;
        const passwordResetCode = getPasswordResetCodeFromURL();

        try {
            const response = await fetch(`http://localhost:8080/api/users/${passwordResetCode}/reset-password`, {
                method: "PUT",
                headers: {
                    'Content-type': "application/json",
                },
                body: JSON.stringify({ newPassword: password }),
            });

            if (response.ok) {
                resetContainer.classList.add("hidden");
                resetSuccess.classList.remove("hidden");
            } else {
                throw new Error('Failed to reset password');
            }
        } catch (error) {
            resetContainer.classList.add("hidden");
            resetFail.classList.remove("hidden");
        }
    }
});