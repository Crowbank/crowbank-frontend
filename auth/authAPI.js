const backend_url = 'http://localhost:5000/api';

export function loginUser(credentials, rememberMe) {
    return $.ajax({
        url: backend_url + '/login',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(credentials)
    });
}

export function loginWithCode(code) {
    return $.post(backend_url + '/login_with_code', { code: code });
}

export function registerUser(email, password) {
    return $.ajax({
        url: backend_url + '/register',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password })
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
        url: backend_url + '/validate_token',
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        contentType: 'application/json'
    });
}