$(document).ready(function () {
    // Check for 'logout' parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'true') {
        // Clear the token from both localStorage and sessionStorage
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        // Remove the 'logout' parameter from the URL
        urlParams.delete('logout');
        history.replaceState(null, '', `${location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`);
    }
    var token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const backend_url = 'http://localhost:5000/api';

    if (!token) {
        // No token, show login form
        loadLoginForm();
    } else {
        // Token exists, load the bookings screen
        loadBookingsScreen();
    }

    function loadLoginForm() {
        // Check for a code in the URL first
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            loginWithCode(code);
            return; // Exit the function early if a code is present
        }

        // If no code, proceed with loading the login form
        var loginFormHtml = `
            <div class="row justify-content-center">
                <div class="col-md-4">
                    <h2>Login</h2>
                    <div id="error-message"></div> <!-- Added this div for error messages -->
                    <form id="login-form">
                        <div class="form-group">
                            <label for="email">Email address</label>
                            <input type="email" class="form-control" id="email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" class="form-control" id="password" required>
                        </div>
                        <div class="form-group form-check">
                            <input type="checkbox" class="form-check-input" id="rememberMe">
                            <label class="form-check-label" for="rememberMe">Remember Me</label>
                        </div>
                        <button type="submit" class="btn btn-primary">Login</button>
                    </form>
                </div>
            </div>
        `;
        $('#content-container').html(loginFormHtml);
    
        $('#login-form').on('submit', function (e) {
            e.preventDefault();
            const email = $('#email').val();
            const password = $('#password').val();
            const rememberMe = $('#rememberMe').is(':checked');
    
            loginUser({ email, password }, rememberMe);
        });

        // Remove this duplicate check
        // if (code) {
        //     loginWithCode(code);
        // }
    }

    function loginUser(credentials, rememberMe) {
        $.ajax({
            url: backend_url + '/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(credentials),
            success: function(response) {
                handleLoginResponse(response, rememberMe);
            },
            error: function(jqXHR) {
                const msg = jqXHR.responseJSON.message || 'Login failed';
                $('#error-message').html(`<div class="alert alert-danger" role="alert">${msg}</div>`);
            }
        });
    }

    function loginWithCode(code) {
        $.post(backend_url + '/login_with_code', { code: code })
        .done(function (response) {
            handleLoginResponse(response, true);  // Always remember login for code-based logins
        })
        .fail(function (jqXHR) {
            const msg = jqXHR.responseJSON.message || 'Login failed';
            $('#error-message').html(`<div class="alert alert-danger" role="alert">${msg}</div>`);
        });
    }

    function handleLoginResponse(response, rememberMe) {
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

    function loadBookingsScreen() {
        var token = localStorage.getItem('token') || sessionStorage.getItem('token');


        $.ajax({
            url: backend_url + '/booking',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token  // Add the token to the Authorization header
            },
            data: { },  // This data will be sent as query parameters
            success: function (data) {
                if (data.status === 'success') {
                    const customer = data.customer;
                    const bookings = data.bookings;
                    $('#content-container').html(`
                        <h2>Welcome, ${customer.forename} ${customer.surname}</h2>
                        <p>You have ${bookings.length} bookings.</p>
                    `);
                    bindMenuActions();
                } else {
                    $('#content-container').html('<div class="alert alert-danger" role="alert">Failed to load data. Please try again.</div>');
                }
            },
            error: function () {
                $('#content-container').html('<div class="alert alert-danger" role="alert">Failed to load data. Please try again.</div>');
            }
        });    }

    function bindMenuActions() {
        $('#menu-bookings').on('click', function (e) {
            e.preventDefault();
            loadBookingsScreen();
        });

        $('#menu-pets').on('click', function (e) {
            e.preventDefault();
            $('#content-container').html('<h2>Pets</h2><p>This is the pets screen. Content will be dynamically loaded here.</p>');
        });

        $('#menu-profile').on('click', function (e) {
            e.preventDefault();
            $('#content-container').html('<h2>Profile</h2><p>This is the profile screen. Content will be dynamically loaded here.</p>');
        });

        $('#menu-logout').on('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            loadLoginForm();
        });
    }
});
