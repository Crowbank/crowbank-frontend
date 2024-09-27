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