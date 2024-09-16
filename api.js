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

export function registerUser(userData) {
    // Implement the registration API call
}

export function fetchBookings() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return $.ajax({
        url: backend_url + '/booking',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: {}
    });
}