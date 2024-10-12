import { loginUser, registerUser, requestPasswordReset, verifyEmail, resetPassword, getGoogleAuthId } from './authAPI.js';
import { showMessage } from '../utils/uiUtils.js';
import { handleGoogleLogin, handleSuccessfulLogin, setToken } from './authUtils.js';

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

    getGoogleAuthId().then(clientId => {
        google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
                handleGoogleLogin(response.credential, false)
                    .then(result => {
                        if (!result.success) {
                            handleGoogleLoginError(result.error, false);
                        }
                    });
            }
        });
        google.accounts.id.renderButton(
            document.getElementById('signInDiv'), 
            { theme: 'outline', size: 'large', text: 'signin_with' }
        );
    }).catch(error => {
        console.error('Error fetching Google client ID:', error);
        showMessage('Error setting up Google Sign-In', 'error');
    });
    
    // Add event listener for form submission
    $('#login-form').on('submit', function(e) {
        e.preventDefault();
        const email = $('#email').val();
        const password = $('#password').val();
        const rememberMe = $('#remember-me').is(':checked');
        loginUser(email, password, rememberMe)
            .then(response => {
                if (response.status === 'success') {
                    setToken(response.token, rememberMe);
                    handleSuccessfulLogin(response.token);
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
    const registrationChoiceHtml = `
        <div class="row justify-content-center">
            <div class="col-md-8 text-center">
                <h2 class="mb-4">Register</h2>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <button id="email-register-btn" class="btn btn-primary btn-lg w-100">
                            <i class="fas fa-envelope me-2"></i>Register with Email
                        </button>
                    </div>
                    <div class="col-md-6 mb-3">
                        <button id="google-register-btn" class="btn btn-outline-primary btn-lg w-100">
                            <i class="fab fa-google me-2"></i>Register with Google
                        </button>
                    </div>
                </div>
                <p class="mt-3">Already have an account? <a href="#" id="login-link">Login here</a></p>
            </div>
        </div>
    `;

    $('#content-container').html(registrationChoiceHtml);

    $('#email-register-btn').on('click', loadEmailRegistrationForm);
    $('#google-register-btn').on('click', loadGoogleRegistrationForm);
    $('#login-link').on('click', function(e) {
        e.preventDefault();
        loadLoginForm();
    });
}

function loadEmailRegistrationForm() {
    const emailRegistrationFormHtml = `
        <div class="row justify-content-center">
            <div class="col-md-6">
                <h2>Register with Email</h2>
                <form id="email-registration-form">
                    <div class="mb-3">
                        <label for="email" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="email" required>
                    </div>
                    <div class="mb-3">
                        <label for="firstName" class="form-label">First Name</label>
                        <input type="text" class="form-control" id="firstName" required>
                    </div>
                    <div class="mb-3">
                        <label for="lastName" class="form-label">Last Name</label>
                        <input type="text" class="form-control" id="lastName" required>
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" class="form-control" id="password" required>
                    </div>
                    <div class="mb-3">
                        <label for="confirm-password" class="form-label">Confirm Password</label>
                        <input type="password" class="form-control" id="confirm-password" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Customer Type</label>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="customerType" id="new-customer" value="new" checked>
                            <label class="form-check-label" for="new-customer">New Customer</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="customerType" id="existing-customer" value="existing">
                            <label class="form-check-label" for="existing-customer">Existing Crowbank Customer</label>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary">Register</button>
                </form>
                <p class="mt-3"><a href="#" id="back-to-choice">Back to registration options</a></p>
            </div>
        </div>
    `;

    $('#content-container').html(emailRegistrationFormHtml);

    $('#email-registration-form').on('submit', handleEmailRegistration);
    $('#back-to-choice').on('click', function(e) {
        e.preventDefault();
        loadRegistrationForm();
    });
}

function loadGoogleRegistrationForm() {
    const googleRegistrationFormHtml = `
        <div class="row justify-content-center">
            <div class="col-md-6">
                <h2>Register with Google</h2>
                <p>Please select your customer type before signing up with Google.</p>
                <div class="mb-3">
                    <label class="form-label">Customer Type</label>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="googleCustomerType" id="new-customer-google" value="new" checked>
                        <label class="form-check-label" for="new-customer-google">New Customer</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="googleCustomerType" id="existing-customer-google" value="existing">
                        <label class="form-check-label" for="existing-customer-google">Existing Crowbank Customer</label>
                    </div>
                </div>
                <div id="googleRegisterDiv" class="mb-3"></div>
                <p class="mt-3"><a href="#" id="back-to-choice">Back to registration options</a></p>
            </div>
        </div>
    `;

    $('#content-container').html(googleRegistrationFormHtml);

    getGoogleAuthId().then(clientId => {
        google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleSignIn
        });
        google.accounts.id.renderButton(
            document.getElementById('googleRegisterDiv'), 
            { theme: 'outline', size: 'large', text: 'signup_with' }
        );
    }).catch(error => {
        console.error('Error fetching Google client ID:', error);
        showMessage('Error setting up Google Sign-Up', 'error');
    });

    $('#back-to-choice').on('click', function(e) {
        e.preventDefault();
        loadRegistrationForm();
    });
}

function handleEmailRegistration(e) {
    e.preventDefault();
    const email = $('#email').val();
    const firstName = $('#firstName').val();
    const lastName = $('#lastName').val();
    const password = $('#password').val();
    const confirmPassword = $('#confirm-password').val();
    const existingCustomer = $('input[name="customerType"]:checked').val() === 'existing';

    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    registerUser(email, password, firstName, lastName, existingCustomer)
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
}

function handleGoogleSignIn(response) {
    const existingCustomer = $('input[name="googleCustomerType"]:checked').val() === 'existing';
    handleGoogleLogin(response.credential, existingCustomer)
        .then(result => {
            if (result.success) {
                handleSuccessfulLogin(result.token);
            } else {
                handleGoogleLoginError(result.error, true);
            }
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
                    showMessage('Password reset successful. You can now log in with your new password.', 'info');
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

export function loadStreamlinedRegistrationForm(userData) {
    const streamlinedRegistrationFormHtml = `
        <div class="row justify-content-center">
            <div class="col-md-6">
                <h2>Complete Registration</h2>
                <p>We couldn't find an account associated with your Google email (${userData.email}). Please choose an option below:</p>
                <form id="streamlined-registration-form">
                    <input type="hidden" id="email" value="${userData.email}">
                    <input type="hidden" id="firstName" value="${userData.name ? userData.name.split(' ')[0] : ''}">
                    <input type="hidden" id="lastName" value="${userData.name ? userData.name.split(' ').slice(1).join(' ') : ''}">
                    <input type="hidden" id="googleId" value="${userData.google_id}">
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="customerType" id="new-customer" value="new" checked>
                            <label class="form-check-label" for="new-customer">
                                I am a new customer
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="customerType" id="existing-customer" value="existing">
                            <label class="form-check-label" for="existing-customer">
                                I am an existing Crowbank customer
                            </label>
                        </div>
                    </div>
                    <div id="existing-customer-email" style="display: none;">
                        <div class="mb-3">
                            <label for="previous-email" class="form-label">Previous Email Address</label>
                            <input type="email" class="form-control" id="previous-email">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary">Complete Registration</button>
                </form>
            </div>
        </div>
    `;

    $('#content-container').html(streamlinedRegistrationFormHtml);

    $('input[name="customerType"]').on('change', function() {
        $('#existing-customer-email').toggle($(this).val() === 'existing');
    });

    $('#streamlined-registration-form').on('submit', function(e) {
        e.preventDefault();
        const email = $('#email').val();
        const firstName = $('#firstName').val();
        const lastName = $('#lastName').val();
        const googleId = $('#googleId').val();
        const existingCustomer = $('input[name="customerType"]:checked').val() === 'existing';
        const previousEmail = existingCustomer ? $('#previous-email').val() : '';

        registerUser(email, null, firstName, lastName, existingCustomer, googleId, previousEmail)
            .then(response => {
                if (response.status === 'success') {
                    showMessage('Registration successful. You are now logged in.', 'info');
                    setToken(response.token, true); // Always remember Google logins
                    handleSuccessfulLogin(response.token);
                } else {
                    showMessage('Registration failed: ' + response.message, 'error');
                }
            })
            .catch(error => {
                showMessage('Registration failed: ' + error.message, 'error');
            });
    });
}

function handleGoogleLoginError(error, isRegistration) {
    if (error.error_code === 'USER_NOT_REGISTERED') {
        showMessage('You need to complete your registration. Redirecting...', 'info');
        setTimeout(() => {
            loadStreamlinedRegistrationForm({
                email: error.email,
                name: error.name,
                google_id: error.google_id
            });
        }, 2000);
    } else {
        showMessage(
            `${isRegistration ? 'Registration' : 'Login'} with Google failed: ${error.message}`,
            'error'
        );
    }
}