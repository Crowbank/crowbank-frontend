import { fetchBookings } from './bookingAPI.js';

function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'confirmed':
            return 'success';
        case 'unconfirmed':
            return 'warning';
        case 'cancelled':
            return 'danger';
        case 'completed':
            return 'info';
        default:
            return 'secondary';
    }
}

export function loadBookingsScreen() {
    const cachedBookings = sessionStorage.getItem('bookings');
    
    if (cachedBookings) {
        renderBookings(JSON.parse(cachedBookings));
    } else {
        fetchBookings()
            .then(({ customer, bookings }) => {
                sessionStorage.setItem('bookings', JSON.stringify(bookings));
                sessionStorage.setItem('customer', JSON.stringify(customer));
                renderBookings(bookings);
            })
            .catch((error) => {
                $('#content-container').html('<div class="alert alert-danger" role="alert">Failed to load data. Please try again.</div>');
                console.error('Error loading bookings:', error);
            });
    }
}

function renderBookings(bookings) {
    const tableRows = bookings.map(booking => `
        <tr>
            <td>${booking.id}</td>
            <td><span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span></td>
            <td>${booking.pets.map(pet => pet.name).join(', ')}</td>
            <td>${new Date(booking.start_date).toLocaleDateString('en-GB')} - ${new Date(booking.end_date).toLocaleDateString('en-GB')}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-booking" data-id="${booking.id}">Edit</button>
                <button class="btn btn-sm btn-outline-danger cancel-booking" data-id="${booking.id}">Cancel</button>
                ${booking.status === 'unconfirmed' ? `<button class="btn btn-sm btn-outline-success confirm-booking" data-id="${booking.id}">Confirm</button>` : ''}
            </td>
        </tr>
    `).join('');

    $('#content-container').html(`
        <h2 class="mb-4">Your Bookings</h2>
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-light">
                    <tr>
                        <th>Booking No.</th>
                        <th>Status</th>
                        <th>Pets</th>
                        <th>Dates</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
        <button class="btn btn-primary mt-3" id="new-booking-btn">New Booking</button>
    `);

    // Add event listeners for the buttons
    $('.edit-booking').on('click', function() {
        const bookingId = $(this).data('id');
        // TODO: Implement edit booking functionality
        console.log('Edit booking:', bookingId);
    });

    $('.cancel-booking').on('click', function() {
        const bookingId = $(this).data('id');
        // TODO: Implement cancel booking functionality
        console.log('Cancel booking:', bookingId);
    });

    $('.confirm-booking').on('click', function() {
        const bookingId = $(this).data('id');
        // TODO: Implement confirm booking functionality
        console.log('Confirm booking:', bookingId);
    });
}

export function refreshBookings() {
    sessionStorage.removeItem('bookings');
    loadBookingsScreen();
}