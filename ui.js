import { loginUser, loginWithCode, registerUser, fetchBookings } from './api.js';

export function loadLoginForm() {
    const loginForm = `
        <h2>Login</h2>
        <form id="login-form">
            <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="email" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" required>
            </div>
            <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="remember-me">
                <label class="form-check-label" for="remember-me">Remember me</label>
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
        </form>
        <p class="mt-3">Don't have an account? <a href="#" id="register-link">Register here</a></p>
        <p>Forgot your password? <a href="#" id="forgot-password-link">Reset it here</a></p>
    `;

    $('#content-container').html(loginForm);

    $('#login-form').on('submit', function(e) {
        e.preventDefault();
        const email = $('#email').val();
        const password = $('#password').val();
        const rememberMe = $('#remember-me').is(':checked');

        loginUser({ email, password }, rememberMe)
            .then(response => {
                if (response.status === 'success') {
                    const token = response.token;
                    if (rememberMe) {
                        localStorage.setItem('token', token);
                    } else {
                        sessionStorage.setItem('token', token);
                    }
                    loadBookingsScreen();
                } else {
                    $('#content-container').prepend('<div class="alert alert-danger" role="alert">Login failed. Please try again.</div>');
                }
            })
            .catch(() => {
                $('#content-container').prepend('<div class="alert alert-danger" role="alert">An error occurred. Please try again.</div>');
            });
    });

    $('#register-link').on('click', function(e) {
        e.preventDefault();
        loadRegistrationForm();
    });

    $('#forgot-password-link').on('click', function(e) {
        e.preventDefault();
        // Implement forgot password functionality
        alert('Forgot password functionality not implemented yet.');
    });
}

export function loadRegistrationForm() {
    const registrationForm = `
        <h2>Register</h2>
        <form id="registration-form">
            <div class="mb-3">
                <label for="reg-email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="reg-email" required>
            </div>
            <div class="mb-3">
                <label for="reg-password" class="form-label">Password</label>
                <input type="password" class="form-control" id="reg-password" required>
            </div>
            <div class="mb-3">
                <label for="reg-confirm-password" class="form-label">Confirm Password</label>
                <input type="password" class="form-control" id="reg-confirm-password" required>
            </div>
            <button type="submit" class="btn btn-primary">Register</button>
        </form>
        <p class="mt-3">Already have an account? <a href="#" id="login-link">Login here</a></p>
    `;

    $('#content-container').html(registrationForm);

    $('#registration-form').on('submit', function(e) {
        e.preventDefault();
        const email = $('#reg-email').val();
        const password = $('#reg-password').val();
        const confirmPassword = $('#reg-confirm-password').val();

        if (password !== confirmPassword) {
            $('#content-container').prepend('<div class="alert alert-danger" role="alert">Passwords do not match.</div>');
            return;
        }

        registerUser({ email, password })
            .then(response => {
                if (response.status === 'success') {
                    $('#content-container').html('<div class="alert alert-success" role="alert">Registration successful. Please check your email to verify your account.</div>');
                } else {
                    $('#content-container').prepend('<div class="alert alert-danger" role="alert">Registration failed. Please try again.</div>');
                }
            })
            .catch(() => {
                $('#content-container').prepend('<div class="alert alert-danger" role="alert">An error occurred. Please try again.</div>');
            });
    });

    $('#login-link').on('click', function(e) {
        e.preventDefault();
        loadLoginForm();
    });
}

export function loadBookingsScreen() {
    fetchBookings()
        .then(data => {
            if (data.status === 'success') {
                const customer = data.customer;
                const bookings = data.bookings;
                $('#content-container').html(`
                    <h2>Welcome, ${customer.forename} ${customer.surname}</h2>
                    <p>You have ${bookings.length} bookings.</p>
                `);
            } else {
                $('#content-container').html('<div class="alert alert-danger" role="alert">Failed to load data. Please try again.</div>');
            }
        })
        .catch(() => {
            $('#content-container').html('<div class="alert alert-danger" role="alert">Failed to load data. Please try again.</div>');
        });
}

export function bindMenuActions() {
    $('#menu-bookings').on('click', function(e) {
        e.preventDefault();
        loadBookingsScreen();
    });

    $('#menu-pets').on('click', function(e) {
        e.preventDefault();
        loadPetsScreen();
    });

    $('#menu-profile').on('click', function(e) {
        e.preventDefault();
        loadProfileScreen();
    });

    $('#menu-logout').on('click', function(e) {
        e.preventDefault();
        logout();
    });
}