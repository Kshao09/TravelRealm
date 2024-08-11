export default class JWTHandler {
    static setToken(token) {
        try {
            if (!token) throw new Error('No token provided.');
            if (typeof token !== 'string') throw new Error('Token must be a string.');
            localStorage.setItem('token', token);
        } catch (error) {
            console.error('Error setting token:', error);
        }
    }

    static getToken() {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found.');
            if (typeof token !== 'string') throw new Error('Token must be a string.');
            return token;
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    }

    static setRefreshToken(refreshToken) {
        try {
            if (!refreshToken) throw new Error('No refresh token provided.');
            if (typeof refreshToken !== 'string') throw new Error('Refresh token must be a string.');
            localStorage.setItem('refreshToken', refreshToken);
        } catch (error) {
            console.error('Error setting refresh token:', error);
        }
    }

    static getRefreshToken() {
        try {
            const token = localStorage.getItem('refreshToken');
            if (!token) throw new Error('No token found.');
            if (typeof token !== 'string') throw new Error('Token must be a string.');
            return token;
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    }

    static decodeJWT(token) {
        //console.log('Token to decode:', token);

        try {
            if (!token) throw new Error('No token provided.');
            const parts = token.split('.');

            if (parts.length !== 3) throw new Error('Invalid token format.');

            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    }

    static setupTokenRefreshTimer() {
        const accessToken = this.getToken();
        if (!accessToken) {
            console.error('No access token available for refresh.');
            return;
        }

        //console.log('Access Token:', accessToken);

        const payload = this.decodeJWT(accessToken);
        if (!payload) {
            console.error('Invalid JWT token');
            return;
        }

        //console.log('Decoded Payload:', payload);

        const expiresIn = (payload.exp * 1000) - Date.now() - (60 * 1000);

        setTimeout(async () => {
            console.log('Attempting to refresh token...');
            await this.getRefreshTokenIfNeeded();
            this.setupTokenRefreshTimer();
        }, expiresIn);
    }

    static async getRefreshTokenIfNeeded() {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            console.error('No refresh token available.');
            window.location.href = '/HTML/login_register.html';
            return null;
        }

        try {
            const refreshResponse = await fetch(`http://localhost:8080/api/refresh-token`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.status === 403) {
                console.error('Refresh token is invalid or expired.');
                window.location.href = '/HTML/login_register.html';
                return null;
            }

            if (!refreshResponse.ok) {
                throw new Error("Failed to refresh token");
            }

            const { accessToken, refreshToken: newRefreshToken } = await refreshResponse.json();
            this.setToken(accessToken);
            this.setRefreshToken(newRefreshToken);
            return accessToken;
        } catch (error) {
            console.error('Error refreshing token:', error);
            window.location.href = '/HTML/login_register.html';
            throw error;
        }
    }

    static clearToken() {
        try {
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace('../HTML/login_register.html');
        } catch (error) {
            console.error('Error clearing token:', error);
        }
    }

    static getUserIdFromToken(token) {
        if (typeof token !== 'string') {
            console.error('Token must be a string:', token);
            throw new Error('Token must be a string');
        }

        try {
            const encodedPayload = token.split('.')[1];
            const decodedPayload = JSON.parse(window.atob(encodedPayload));
            return decodedPayload.id;
        } catch (error) {
            console.error("Error decoding token: ", error);
            return null;
        }
    }

    static async logoutUser() {
        try {
            const refreshToken = this.getRefreshToken();

            const response = await fetch('http://localhost:8080/api/logout', {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                throw new Error('Failed to logout');
            }

            this.clearToken();


        } catch (error) {
            console.error('Error logging out:', error);
        }
    }
}