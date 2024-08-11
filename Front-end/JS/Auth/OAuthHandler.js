export default class OAuthHandler {
    static loginWithProvider(provider) {
        if (provider === 'google') {
            window.location.href = '/auth/google';
        }
    }

    static logout() {
        localStorage.removeItem('authToken');
        window.location.href = '/login'
    }
}