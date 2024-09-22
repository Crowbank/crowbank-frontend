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
    return $.ajax({
        url: backend_url + '/register',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password, existing_customer })
    });
}

export function requestPasswordReset(email) {
    return $.ajax({
        url: backend_url + '/forgot-password',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email })
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