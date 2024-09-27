import { loginWithGoogle } from './authAPI.js';
import { loadBookingsScreen } from '../booking/bookingUI.js';
import { showMessage, toggleMenu } from '../utils/uiUtils.js';

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
        // If token is provided in URL, use it but don't store it
        return token;
    } else {
        // Otherwise, get from storage as before
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    }
}

export function handleLoginResponse(response, rememberMe) {
    if (response.status === 'success') {
        const token = response.token;
        if (rememberMe) {
            localStorage.setItem('token', token);
        } else {
            sessionStorage.setItem('token', token);
        }
        toggleMenu(true);
        loadBookingsScreen();
    } else {
        const msg = response.message || 'Login failed';
        showMessage(msg, 'error');
    }
}

export function setToken(token, rememberMe) {
    if (rememberMe) {
        localStorage.setItem('token', token);
    } else {
        sessionStorage.setItem('token', token);
    }
}

export function removeToken() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
}

export function handleGoogleLogin(token, isRegistration = false) {
    return loginWithGoogle(token)
        .then(response => {
            if (response.status === 'success') {
                if (isRegistration) {
                    showMessage('Registration with Google successful!', 'info');
                }
                handleLoginResponse(response, true); // Always remember Google logins
                return { success: true };
            } else {
                return { success: false, error: response };
            }
        })
        .catch(error => {
            return { success: false, error: error.responseJSON || error };
        });
}

// Remove the import of loadRegistrationForm from './authUI.js'
