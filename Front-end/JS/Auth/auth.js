import JWTHandler from "./jwtHandler.js";

let isAuthInitialized = false;

export const initializeAuth = () => {
    if (!isAuthInitialized) {
        JWTHandler.setupTokenRefreshTimer();
        isAuthInitialized = true;
    }
}