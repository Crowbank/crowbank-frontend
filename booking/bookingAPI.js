import { config } from '../config.js';

export function fetchBookings() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return $.ajax({
        url: `${config.backend_url}/booking`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: {}
    }).then(data => {
        if (data.status === 'success') {
            return {
                customer: data.customer,
                bookings: data.bookings
            };
        } else {
            throw new Error('Failed to load data');
        }
    });
}

export async function refreshBookingData() {
    sessionStorage.removeItem('bookings');
    return fetchBookings();
}

export function handleBookingSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const bookingData = Object.fromEntries(formData.entries());

    // Collect selected pet IDs
    const selectedPets = [];
    $('input[type="checkbox"]:checked').each(function() {
        selectedPets.push($(this).val());
    });
    bookingData.pets = selectedPets;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const url = bookingData.id ? `${config.backend_url}/booking/${bookingData.id}` : `${config.backend_url}/booking`;
    const errorMessage = bookingData.id ? 'Failed to update booking' : 'Failed to create booking';

    return $.ajax({
        url: url,
        type: 'POST',
 // method is always POST, because a new request is always created, even when it is for a booking change
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(bookingData)
    }).then(data => {
        if (data.status === 'success') {
            return data.booking;
        } else {
            return Promise.reject(data.message || errorMessage);
        }
    }).catch(error => {
        console.error('Error saving booking:', error);
        return Promise.reject(error);
    });
}
