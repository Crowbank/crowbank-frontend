import { checkLogoutParam, getToken, setToken, removeToken } from './auth/authUtils.js';
import { loadLoginForm, handleEmailVerification, loadResetPasswordForm } from './auth/authUI.js';
import { loadBookingsScreen, refreshBookings } from './booking/bookingUI.js';
import { bindMenuActions, toggleMenu } from './utils/uiUtils.js';
import { loginWithToken } from './auth/authAPI.js';
import { loadPetsScreen, refreshPets } from './pet/petUI.js';
import { loadProfileScreen, refreshProfile } from './profile/profileUI.js';
import { showMessage } from './utils/uiUtils.js';

$(document).ready(function () {
    checkLogoutParam();
    const token = getToken();

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
        // If token is from URL (customer mimicking), validate it first
        if (urlParams.has('token')) {
            loginWithToken(token)
                .then(response => {
                    if (response.status === 'success') {
                        setToken(token, false);  // Store in session storage
                        toggleMenu(true);
                        loadBookingsScreen();
                    } else {
                        handleCredentialError();
                    }
                })
                .catch(() => {
                    handleCredentialError();
                });
        } else {
            // Normal flow for stored tokens
            toggleMenu(true);
            loadBookingsScreen();
        }
    } else {
        toggleMenu(false);
        loadLoginForm();
    }

    bindMenuActions();

    function setupNavigation() {
        // ... existing navigation setup ...

        $('#refresh-data').on('click', function() {
            Promise.all([
                refreshBookings().catch(handleApiError),
                refreshPets().catch(handleApiError),
                refreshProfile().catch(handleApiError)
            ]).then(() => {
                showMessage('Data refreshed successfully!', 'info');
            }).catch(() => {
                // Error already handled by handleApiError
            });
        });
    }

    setupNavigation();
});

function handleCredentialError(message) {
    removeToken();
    toggleMenu(false);
    loadLoginForm();
    showMessage(message || 'Session expired. Please log in again.', 'warning');
}

function handleApiError(error) {
    if (error.response) {
        const data = error.response.data;
        if (data.status === 'error' && (data.code === 'token_expired' || data.code === 'invalid_token' || data.code === 'authorization_required')) {
            handleCredentialError(data.message);
        } else {
            console.error('API Error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        }
    } else {
        console.error('Network Error:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
    }
}

function refreshData() {
    Promise.all([
        refreshBookings().catch(handleApiError),
        refreshPets().catch(handleApiError),
        refreshProfile().catch(handleApiError)
    ]).then(() => {
        showMessage('Data refreshed successfully!', 'info');
    }).catch(() => {
        // Error already handled by handleApiError
    });
}

// Export the handleApiError function so it can be used in other modules
export { handleApiError };