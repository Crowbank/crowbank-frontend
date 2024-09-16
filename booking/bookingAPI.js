const backend_url = 'http://localhost:5000/api';

export function fetchBookings() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return $.ajax({
        url: backend_url + '/booking',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: {}
    });
}