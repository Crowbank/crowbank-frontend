import { isAuthenticated, logout, routeBasedOnUserState, exchangeCodeForToken } from './auth/authUtils.js';
import { showLoginForm, showRegistrationForm, showChangePasswordForm, showVerifyEmailForm, 
    showResetPasswordForm, showForgotPasswordForm, handleEmailVerification } from './auth/authUI.js';
import { showBookingsScreen, showBookingForm, openBookingForm } from './booking/bookingUI.js';
import { showProfileScreen } from './profile/profileUI.js';
import { showPetsScreen, showPetUI } from './pet/petUI.js';
import { showMessage, updateMenuState } from './utils/uiUtils.js';
// import page from './page.js';

// Add these lines at the beginning of the file
console.log('main.js is running');
console.log('URL search params:', window.location.search);

function initializeRoutes() {
    page.base('/frontend');

    page('*', parseToken);
    page('/', checkAuth, routeBasedOnUserState);
    page('/booking', checkAuth, showBookingsScreen); // Ensure this calls showBookingsScreen
    page('/booking/new', checkAuth, () => openBookingForm()); // New route for creating a new booking
    page('/booking/:bookingId', checkAuth, showBookingForm);
    page('/profile', checkAuth, showProfileScreen);
    page('/pets', checkAuth, showPetsScreen);
    page('/pet/:petNo', checkAuth, showPetUI);
    page('/login', showLoginForm);
    page('/register', showRegistrationForm);
    page('/change-password', checkAuth, showChangePasswordForm);
    page('/verify-email', handleEmailVerificationRoute);
    page('/reset-password', showResetPasswordForm);
    page('/forgot-password', showForgotPasswordForm);
    page('*', notFound);

    page();
}

function parseToken(ctx, next) {
    const urlParams = new URLSearchParams(window.location.search);
    ctx.code = urlParams.get('code'); // Capture the code from URL

    if (ctx.code) {
        console.log('Code detected in URL:', ctx.code);
        exchangeCodeForToken(ctx.code) // Exchange the code for a token
            .then(result => {
                if (result.success) {
                    next(); // Proceed to the next middleware if successful
                } else {
                    console.error('Error exchanging code for token:', result.error);
                    page.redirect('/login'); // Redirect to login on failure
                }
            });
    } else {
        next(); // Proceed if no code is present
    }
}

function checkAuth(ctx, next) {
    if (isAuthenticated()) {
        next();
    } else {
        page.redirect('/login');
    }
}

function notFound() {
    $('#content-container').html('<h1>404 - Page Not Found</h1>');
}

function handleEmailVerificationRoute(ctx) {
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get('verify');
    if (verifyToken) {
        handleEmailVerification(verifyToken);
    } else {
        showVerifyEmailForm();
    }
}

$(function() {
    initializeRoutes();
    updateMenuState();

    $('#menu-bookings').on('click', (e) => {
        e.preventDefault();
        page('/booking');
    });

    $('#menu-pets').on('click', (e) => {
        e.preventDefault();
        page('/pets');
    });

    $('#menu-profile').on('click', (e) => {
        e.preventDefault();
        page('/profile');
    });

    $('#menu-logout').on('click', (e) => {
        e.preventDefault();
        logout();
    });

    $('#refresh-data').on('click', (e) => {
        e.preventDefault();
        // Implement refresh data functionality
        showMessage('Data refreshed successfully', 'info');
    });

    // Remove or comment out this log as it's no longer needed
    // console.log('Verify token:', new URLSearchParams(window.location.search).get('verify'));
});

export { initializeRoutes };
