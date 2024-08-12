export const verifyEmail = () => {
    console.log('verifyEmail function called');
    setTimeout(function() {
        console.log('Redirecting to emailVerificationLandingPage.html');
        window.location.href = '/HTML/emailVerificationLandingPage.html';
    }, 3000);
}