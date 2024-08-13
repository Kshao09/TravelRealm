import { signUpRoute } from './signUpRoute.js';
import { loginRoute } from './loginRoute.js';
import { sendEmailRoute } from './sendEmailRoute.js';
import { refreshTokenRoute } from './refreshTokenRoute.js';
import { logoutRoute } from './logoutRoute.js';
import { updateUserInfoRoute } from './updateUserInfoRoute.js';
import { getUserInfoRoute } from './getUserInfoRoute.js';
import { verifyEmailRoute } from './verifyEmailRoute.js';
import { forgotPasswordRoute } from './forgotPasswordRoute.js';
import { resetPasswordRoute } from './resetPasswordRoute.js';
import { getGoogleOAuthUrlRoute } from './getGoogleOAuthUrlRoute.js';
import { googleOAuthCallbackRoute } from './googleOAuthCallbackRoute.js';
import { processPaymentRoute } from './processPaymentRoute.js';
import { saveConversationRoute } from './saveConversationRoute.js';
import { deleteConversationRoute } from './deleteConversationRoute.js';
import { loadConversationRoute } from './loadConversationRoute.js';
import { updateConversationRoute } from './updateConversationRoute.js';
import { checkConverationExistsRoute } from './checkConversationExistsRoute.js';
import { signUpDateRoute } from './signUpDateRoute.js';

export const routes = [
    loginRoute,
    signUpRoute,
    updateUserInfoRoute,
    getUserInfoRoute,
    refreshTokenRoute,
    logoutRoute,
    sendEmailRoute,
    verifyEmailRoute,
    saveConversationRoute,
    checkConverationExistsRoute,
    loadConversationRoute,
    updateConversationRoute,
    deleteConversationRoute,
    forgotPasswordRoute,
    resetPasswordRoute,
    getGoogleOAuthUrlRoute,
    googleOAuthCallbackRoute,
    processPaymentRoute,
    signUpDateRoute,
];