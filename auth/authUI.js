import { loginUser, loginWithCode, registerUser, requestPasswordReset, verifyEmail } from './authAPI.js';
import { loadBookingsScreen } from '../booking/bookingUI.js';

export function loadLoginForm() {
    // ... (keep existing code)
    
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
                    <button type="submit" class="btn btn-primary">Register</button>
                </form>
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

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        registerUser(email, password)
            .then(response => {
                if (response.status === 'success') {
                    alert('Registration successful. Please check your email to verify your account.');
                    loadLoginForm();
                } else {
                    alert('Registration failed: ' + response.message);
                }
            })
            .catch(error => {
                alert('Registration failed: ' + error.message);
            });
    });

    $('#login-link').on('click', function(e) {
        e.preventDefault();
        loadLoginForm();
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
                    <button type="submit" class="btn btn-primary">Reset Password</button>
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
                    alert('Password reset instructions have been sent to your email.');
                    loadLoginForm();
                } else {
                    alert('Password reset request failed: ' + response.message);
                }
            })
            .catch(error => {
                alert('Password reset request failed: ' + error.message);
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
                alert('Email verified successfully. You can now log in.');
            } else {
                alert('Email verification failed: ' + response.message);
            }
            loadLoginForm();
        })
        .catch(error => {
            alert('Email verification failed: ' + error.message);
            loadLoginForm();
        });
}