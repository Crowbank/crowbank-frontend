import { loginUser, loginWithCode, registerUser, fetchBookings } from './api.js';

export function loadLoginForm() {
    // ... (keep the existing loadLoginForm function)
}

export function loadRegistrationForm() {
    // ... (keep the existing loadRegistrationForm function)
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
    // ... (keep the existing bindMenuActions function)
}