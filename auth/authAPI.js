import { backend_url } from '../config.js';

export function loginUser(email, password, rememberMe) {
    return $.ajax({
        url: `${backend_url}/login`,
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
    });
}

export function loginWithCode(code) {
    return $.post(backend_url + '/login_with_code', { code: code });
}

export function registerUser(email, password, existing_customer) {
    const frontend_base_url = `${window.location.protocol}//${window.location.host}${window.location.pathname.split('/').slice(0, -1).join('/')}`;

    return $.ajax({
        url: backend_url + '/register',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ 
            email, 
            password, 
            existing_customer,
            frontend_base_url
        })
    });
}

export function requestPasswordReset(email) {
    const frontend_base_url = `${window.location.protocol}//${window.location.host}${window.location.pathname.split('/').slice(0, -1).join('/')}`;

    return $.ajax({
        url: backend_url + '/forgot-password',
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
        url: backend_url + '/verify-email',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ token })
    });
}

export function loginWithToken(token) {
    return $.ajax({
        url: `${backend_url}/validate_token`,
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        contentType: 'application/json'
    });
}

export function resetPassword(token, newPassword) {
    return $.ajax({
        url: `${backend_url}/reset-password`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ token, new_password: newPassword })
    });
}

// Add this new function
export function loginWithGoogle(token) {
    return $.ajax({
        url: `${backend_url}/google-login`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ token })
    });
}