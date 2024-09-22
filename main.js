import { checkLogoutParam, getToken, setToken, removeToken } from './auth/authUtils.js';
import { loadLoginForm, handleEmailVerification } from './auth/authUI.js';
import { loadBookingsScreen, refreshBookings } from './booking/bookingUI.js';
import { bindMenuActions, toggleMenu } from './utils/uiUtils.js';
import { loginWithToken } from './auth/authAPI.js';
import { loadPetsScreen, refreshPets } from './pet/petUI.js';
import { loadProfileScreen, refreshProfile } from './profile/profileUI.js';

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
                alert('Data refreshed successfully!');
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
    // Display the error message to the user
    alert(message || 'Session expired. Please log in again.');
}

function handleApiError(error) {
    if (error.response) {
        const data = error.response.data;
        if (data.status === 'error' && (data.code === 'token_expired' || data.code === 'invalid_token' || data.code === 'authorization_required')) {
            handleCredentialError(data.message);
        } else {
            console.error('API Error:', error);
            // Handle other types of errors as needed
        }
    } else {
        console.error('Network Error:', error);
        // Handle network errors
    }
}

// Update the existing functions to use the new error handling
function refreshData() {
    Promise.all([
        refreshBookings().catch(handleApiError),
        refreshPets().catch(handleApiError),
        refreshProfile().catch(handleApiError)
    ]).then(() => {
        alert('Data refreshed successfully!');
    }).catch(() => {
        // Error already handled by handleApiError
    });
}

// Export the handleApiError function so it can be used in other modules
export { handleApiError };