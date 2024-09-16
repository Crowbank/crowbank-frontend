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
        loadBookingsScreen();
    } else {
        const msg = response.message || 'Login failed';
        $('#error-message').html(`<div class="alert alert-danger" role="alert">${msg}</div>`);
    }
}

export function setToken(token, rememberMe) {
    if (rememberMe) {
        localStorage.setItem('token', token);
    } else {
        sessionStorage.setItem('token', token);
    }
}