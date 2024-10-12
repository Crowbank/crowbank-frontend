import { loginWithGoogle } from './authAPI.js';
import { loadBookingsScreen } from '../booking/bookingUI.js';
import { loadProfileScreen } from '../profile/profileUI.js';
import { loadPetsScreen } from '../pet/petUI.js';
import { showMessage, toggleMenu, updateMenuState } from '../utils/uiUtils.js';

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
                setToken(response.token, true); // Always remember Google logins
                handleSuccessfulLogin(response.token);
                return { success: true, token: response.token };
            } else {
                return { success: false, error: response };
            }
        })
        .catch(error => {
            return { success: false, error: error.responseJSON || error };
        });
}

export function getTokenAndCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    return { token, code };
}

export function handleSuccessfulLogin(token) {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const has_registration = decodedToken.has_registration;
    const has_pets = decodedToken.has_pets;

    // Store has_registration and hasPets in sessionStorage for use by other parts of the application
    sessionStorage.setItem('hasRegistration', has_registration);
    sessionStorage.setItem('hasPets', has_pets);

    toggleMenu(true);
    updateMenuState();
    if (!has_registration) {
        loadProfileScreen();
    } else if (!has_pets) {
        loadPetsScreen();
    } else {
        loadBookingsScreen();
    }
}
