document.addEventListener("DOMContentLoaded", function() {
    const errorMessage = document.getElementById('error-message');
    const emailInput = document.getElementById('email-input');
    const resetButton = document.getElementById('reset-button');
    const header = document.getElementById('header-title');
    const description = document.getElementById('description-text');

    emailInput.addEventListener('input', function(e) {
        resetButton.disabled = !e.target.value;
    });

    resetButton.addEventListener('click', async function() {
        try {
            const response = await fetch(`http://localhost:8080/api/forgot-password/${emailInput.value}`, {
                method: "PUT",
            });

            if (response.ok) {
                header.textContent = 'Success!';
                description.textContent = 'Check your email for a reset link';
                errorMessage.textContent = '';
            } else {
                throw new Error("Failed to send reset link");
            }
        } catch (error) {
            errorMessage.textContent = error.message;
        }
    });
});  