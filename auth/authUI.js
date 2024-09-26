import { loginUser, loginWithCode, registerUser, requestPasswordReset, verifyEmail, resetPassword, loginWithGoogle } from './authAPI.js';
import { loadBookingsScreen } from '../booking/bookingUI.js';
import { toggleMenu } from '../utils/uiUtils.js';
import { showMessage } from '../utils/uiUtils.js';
import { handleGoogleLogin } from './authUtils.js';

export function loadLoginForm() {
    // Create a simple login form
    const loginFormHtml = `
        <div class="row justify-content-center">
            <div class="col-md-6">
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
                    <button type="submit" class="btn btn-primary">Login</button>
                </form>
                <div class="mt-3" id="signInDiv">
                </div>
            </div>
        </div>
    `;

    $('#content-container').html(loginFormHtml);

    google.accounts.id.initialize({
        client_id: "108162317225-9ve71sbjurbplu0hmi9g6bvm508esoie.apps.googleusercontent.com",
        callback: handleGoogleLogin
    });
    google.accounts.id.renderButton(
        document.getElementById('signInDiv'), 
        { theme: 'outline', size: 'large' }
    );
    
    // Add event listener for form submission
    $('#login-form').on('submit', function(e) {
        e.preventDefault();
        const email = $('#email').val();
        const password = $('#password').val();
        const rememberMe = $('#remember-me').is(':checked');
        loginUser(email, password, rememberMe)
            .then(response => {
                if (response.status === 'success') {
                    handleLoginResponse(response, rememberMe);
                } else {
                    showMessage('Login failed: ' + response.message, 'error');
                }
            })
            .catch(error => {
                showMessage('Login failed: ' + error.message, 'error');
            });
    });

    // Add links for registration and forgotten password
    $('#content-container').append(`
        <div class="mt-3">
            <a href="#" id="register-link">Register</a> | 
            <a href="#" id="forgot-password-link">Forgot Password</a>
        </div>
    `);

    $('#register-link').on('click', function(e) {
        e.preventDefault();
        loadRegistrationForm();
    });

    $('#forgot-password-link').on('click', function(e) {
        e.preventDefault();
        loadForgotPasswordForm();
    });
}

export function loadRegistrationForm() {
    const registrationFormHtml = `
        <div class="row justify-content-center">
            <div class="col-md-6">
                <h2>Register</h2>
                <form id="registration-form">
                    <div class="mb-3">
                        <label for="email" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="email" required>
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" class="form-control" id="password" required>
                    </div>
                    <div class="mb-3">
                        <label for="confirm-password" class="form-label">Confirm Password</label>
                        <input type="password" class="form-control" id="confirm-password" required>
                    </div>
                    <div class="mb-3 form-check">
                        <input type="checkbox" class="form-check-input" id="existing-customer">
                        <label class="form-check-label" for="existing-customer">Existing Customer</label>
                    </div>
                    <p class="text-muted small">Check this box if you are already a Crowbank customer.</p>
                    <button type="submit" class="btn btn-primary">Register</button>
                </form>
                <div class="mt-3">
                    <button id="google-register" class="btn btn-outline-primary">
                        <i class="fab fa-google"></i> Register with Google
                    </button>
                </div>
                <p class="mt-3">Already have an account? <a href="#" id="login-link">Login here</a></p>
            </div>
        </div>
    `;

    $('#content-container').html(registrationFormHtml);

    $('#registration-form').on('submit', function(e) {
        e.preventDefault();
        const email = $('#email').val();
        const password = $('#password').val();
        const confirmPassword = $('#confirm-password').val();
        const existingCustomer = $('#existing-customer').is(':checked');

        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        registerUser(email, password, existingCustomer)
            .then(response => {
                if (response.status === 'success') {
                    showMessage('Registration successful. Please check your email to verify your account.', 'info');
                    loadLoginForm();
                } else {
                    showMessage('Registration failed: ' + response.message, 'error');
                }
            })
            .catch(error => {
                showMessage('Registration failed: ' + error.message, 'error');
            });
    });

    $('#login-link').on('click', function(e) {
        e.preventDefault();
        loadLoginForm();
    });

    // Add Google register button event listener
    $('#google-register').on('click', function(e) {
        e.preventDefault();
        handleGoogleLogin(true);
    });
}

export function loadForgotPasswordForm() {
    const forgotPasswordFormHtml = `
        <div class="row justify-content-center">
            <div class="col-md-6">
                <h2>Forgot Password</h2>
                <form id="forgot-password-form">
                    <div class="mb-3">
                        <label for="email" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="email" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Request Password Reset</button>
                </form>
                <p class="mt-3"><a href="#" id="login-link">Back to Login</a></p>
            </div>
        </div>
    `;

    $('#content-container').html(forgotPasswordFormHtml);

    $('#forgot-password-form').on('submit', function(e) {
        e.preventDefault();
        const email = $('#email').val();

        requestPasswordReset(email)
            .then(response => {
                if (response.status === 'success') {
                    showMessage('Password reset instructions have been sent to your email.', 'info');
                    loadLoginForm();
                } else {
                    showMessage('Password reset request failed: ' + response.message, 'error');
                }
            })
            .catch(error => {
                showMessage('Password reset request failed: ' + error.message, 'error');
            });
    });

    $('#login-link').on('click', function(e) {
        e.preventDefault();
        loadLoginForm();
    });
}

export function handleEmailVerification(token) {
    verifyEmail(token)
        .then(response => {
            if (response.status === 'success') {
                showMessage('Email verified successfully. You can now log in.', 'info');
            } else {
                showMessage('Email verification failed: ' + response.message, 'error');
            }
            loadLoginForm();
        })
        .catch(error => {
            showMessage('Email verification failed: ' + error.message, 'error');
            loadLoginForm();
        });
}

export function handleLoginResponse(response, rememberMe) {
    if (response.status === 'success') {
        const token = response.token;
        if (rememberMe) {
            localStorage.setItem('token', token);
        } else {
            sessionStorage.setItem('token', token);
        }
        toggleMenu(true);
        loadBookingsScreen();
    } else {
        const msg = response.message || 'Login failed';
        $('#error-message').html(`<div class="alert alert-danger" role="alert">${msg}</div>`);
    }
}

// Add this new function
export function loadResetPasswordForm(token) {
    const resetPasswordFormHtml = `
        <div class="row justify-content-center">
            <div class="col-md-6">
                <h2>Reset Password</h2>
                <form id="reset-password-form">
                    <input type="hidden" id="reset-token" value="${token}">
                    <div class="mb-3">
                        <label for="new-password" class="form-label">New Password</label>
                        <input type="password" class="form-control" id="new-password" required>
                    </div>
                    <div class="mb-3">
                        <label for="confirm-password" class="form-label">Confirm New Password</label>
                        <input type="password" class="form-control" id="confirm-password" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Reset Password</button>
                </form>
            </div>
        </div>
    `;

    $('#content-container').html(resetPasswordFormHtml);

    $('#reset-password-form').on('submit', function(e) {
        e.preventDefault();
        const token = $('#reset-token').val();
        const newPassword = $('#new-password').val();
        const confirmPassword = $('#confirm-password').val();

        if (newPassword !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        resetPassword(token, newPassword)
            .then(response => {
                if (response.status === 'success') {
                    showMessage('Password reset successfully. You can now log in with your new password.', 'info');
                    loadLoginForm();
                } else {
                    showMessage('Password reset failed: ' + response.message, 'error');
                }
            })
            .catch(error => {
                showMessage('Password reset failed: ' + error.message, 'error');
            });
    });
}