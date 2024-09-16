import { loadLoginForm, loadRegistrationForm, loadBookingsScreen } from './ui.js';
import { loginUser, loginWithCode, registerUser } from './api.js';

export function checkLogoutParam() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'true') {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        urlParams.delete('logout');
        history.replaceState(null, '', `${location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`);
    }
}

export function getToken() {
    const urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get('token');
    if (token) {
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
    } else {
        token = localStorage.getItem('token') || sessionStorage.getItem('token');
    }
    return token;
}

export function handleLoginResponse(response, rememberMe) {
    if (response.status === 'success') {
        const token = response.token;
        if (rememberMe) {
            localStorage.setItem('token', token);
        } else {
            sessionStorage.setItem('token', token);
        }
        loadBookingsScreen();
    } else {
        const msg = response.message || 'Login failed';
        $('#error-message').html(`<div class="alert alert-danger" role="alert">${msg}</div>`);
    }
}

// ... (keep the rest of the auth-related functions here)