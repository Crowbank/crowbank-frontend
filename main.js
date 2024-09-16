import { checkLogoutParam, getToken, setToken } from './auth/authUtils.js';
import { loadLoginForm, handleEmailVerification } from './auth/authUI.js';
import { loadBookingsScreen } from './booking/bookingUI.js';
import { bindMenuActions } from './utils/uiUtils.js';
import { loginWithToken } from './auth/authAPI.js';

$(document).ready(function () {
    checkLogoutParam();
    const token = getToken();

    // Check for email verification token
    const urlParams = new URLSearchParams(window.location.search);
    const verificationToken = urlParams.get('verify');
    if (verificationToken) {
        handleEmailVerification(verificationToken);
        return;
    }

    if (token) {
        // If token is from URL (customer mimicking), validate it first
        if (urlParams.has('token')) {
            loginWithToken(token)
                .then(response => {
                    if (response.status === 'success') {
                        setToken(token, false);  // Store in session storage
                        loadBookingsScreen();
                    } else {
                        loadLoginForm();
                    }
                })
                .catch(() => loadLoginForm());
        } else {
            // Normal flow for stored tokens
            loadBookingsScreen();
        }
    } else {
        loadLoginForm();
    }

    bindMenuActions();
});