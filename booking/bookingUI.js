import { fetchBookings } from './bookingAPI.js';

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