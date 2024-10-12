import { config } from '../config.js';

export function loginUser(email, password, rememberMe) {
    return $.ajax({
        url: `${config.backend_url}/login`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password, rememberMe })
    }).then(response => {
        if (response.token) {
            // Store the token based on the rememberMe option
            if (rememberMe) {
                localStorage.setItem('token', response.token);
            } else {
                sessionStorage.setItem('token', response.token);
            }
        }
        return response;
    }).catch(error => {
        // Throw a new error with the server's error message
        throw new Error(error.responseJSON?.message || 'An unknown error occurred');
    });
}

export function loginWithCode(code) {
    return $.post(config.backend_url + '/login_with_code', { code: code });
}

export function registerUser(email, password, firstName, lastName, existingCustomer, googleId = null) {
    const frontend_base_url = `${window.location.protocol}//${window.location.host}${window.location.pathname.split('/').slice(0, -1).join('/')}`;

    return $.ajax({
        url: config.backend_url + '/register',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ 
            email, 
            password, 
            first_name: firstName,
            last_name: lastName,
            existing_customer: existingCustomer,
            google_id: googleId,
            frontend_base_url
        })
    });
}

export function requestPasswordReset(email) {
    const frontend_base_url = `${window.location.protocol}//${window.location.host}${window.location.pathname.split('/').slice(0, -1).join('/')}`;

    return $.ajax({
        url: config.backend_url + '/forgot-password',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ 
            email,
            frontend_base_url: frontend_base_url
        })
    });
}

export function verifyEmail(token) {
    return $.ajax({
        url: config.backend_url + '/verify-email',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ token })
    });
}

export function resetPassword(token, newPassword) {
    return $.ajax({
        url: `${config.backend_url}/reset-password`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ token, new_password: newPassword })
    });
}

// Add this new function to fetch the Google Auth ID
export function getGoogleAuthId() {
    return $.ajax({
        url: `${config.backend_url}/google-auth-id`,
        type: 'GET',
        contentType: 'application/json'
    }).then(response => response.google_auth_id);
}

// Update the loginWithGoogle function to use the fetched Google Auth ID
export async function loginWithGoogle(token) {
    const googleAuthId = await getGoogleAuthId();
    return $.ajax({
        url: `${config.backend_url}/google-login`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ token, google_auth_id: googleAuthId })
    });
}