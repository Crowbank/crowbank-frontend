import { loginWithGoogle, loginWithCode } from './authAPI.js';
import { showMessage, toggleMenu, updateMenuState } from '../utils/uiUtils.js';
// import page from 'page';

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
        // If token is provided in URL, use it and store it
        setToken(token, true);
        return token;
    } else {
        // Otherwise, get from storage
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
    const code = urlParams.get('code'); // Ensure we get the code from URL
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    return { token, code }; // Return both token and code
}

export function handleSuccessfulLogin(token) {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const has_registration = decodedToken.has_registration;
    const has_pets = decodedToken.has_pets;

    sessionStorage.setItem('hasRegistration', has_registration);
    sessionStorage.setItem('hasPets', has_pets);

    toggleMenu(true);
    updateMenuState();

    routeBasedOnUserState();
}

export function routeBasedOnUserState() {
    const hasRegistration = sessionStorage.getItem('hasRegistration') === 'true';
    const hasPets = sessionStorage.getItem('hasPets') === 'true';

    if (!hasRegistration) {
        page('/profile');
    } else if (!hasPets) {
        page('/pets');
    } else {
        page('/booking');
    }
}

export function logout() {
    removeToken();
    sessionStorage.removeItem('hasRegistration');
    sessionStorage.removeItem('hasPets');
    toggleMenu(false);
    updateMenuState();
    page('/login');
}

export function isAuthenticated() {
    const token = getToken();
    if (!token) {
        return false;
    }
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000; // Convert to milliseconds
        if (Date.now() >= expiry) {
            removeToken(); // Token is expired, so remove it
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error parsing token:', error);
        removeToken(); // Invalid token, so remove it
        return false;
    }
}

export function exchangeCodeForToken(code) {
    return loginWithCode(code) // Call the API to exchange the code for a token
        .then(response => {
            if (response.status === 'success') {
                setToken(response.token, true); // Store the token
                handleSuccessfulLogin(response.token); // Handle successful login
                return { success: true, token: response.token };
            } else {
                return { success: false, error: response };
            }
        })
        .catch(error => {
            return { success: false, error: error.responseJSON || error };
        });
}
