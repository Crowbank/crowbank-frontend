import { checkLogoutParam, getTokenAndCode, setToken, removeToken, handleSuccessfulLogin } from './auth/authUtils.js';
import { loadLoginForm, handleEmailVerification, loadResetPasswordForm } from './auth/authUI.js';
import { loginWithCode } from './auth/authAPI.js';
import { bindMenuActions, showMessage, toggleMenu } from './utils/uiUtils.js';

$(document).ready(function () {
    checkLogoutParam();
    const { token, code } = getTokenAndCode();

    // Get the current path
    const currentPath = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);

    // Check for email verification
    if (currentPath === '/frontend/verify-email') {
        const verificationToken = urlParams.get('token');
        if (verificationToken) {
            handleEmailVerification(verificationToken);
            return;
        }
    }

    // Check for password reset
    if (currentPath === '/frontend/reset-password') {
        const resetToken = urlParams.get('token');
        if (resetToken) {
            loadResetPasswordForm(resetToken);
            return;
        }
    }

    // Check for forgot password
    if (currentPath === '/frontend/forgot-password') {
        loadForgotPasswordForm();
        return;
    }

    if (token) {
        handleSuccessfulLogin(token);
    } else if (code) {
        // If code is present, validate it and exchange for a token
        loginWithCode(code)
            .then(response => {
                if (response.status === 'success') {
                    setToken(response.token, false);  // Store in session storage
                    handleSuccessfulLogin(response.token);
                } else {
                    handleCredentialError();
                }
            })
            .catch(() => {
                handleCredentialError();
            });
    } else {
        toggleMenu(false);
        loadLoginForm();
    }

    bindMenuActions();
});

function handleCredentialError(message) {
    removeToken();
    toggleMenu(false);
    loadLoginForm();
    showMessage(message || 'Session expired. Please log in again.', 'warning');
}
