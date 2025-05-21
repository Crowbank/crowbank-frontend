import { fetchBookings, handleBookingSubmit } from './bookingAPI.js';
import { getPetData } from '../pet/petAPI.js'; // Ensure you have the getPets function

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

export function showBookingsScreen() {
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
    const tableRows = bookings.map(booking => {
        const isFutureBooking = new Date(booking.start_date) > new Date(); // Check if the booking is in the future
        return `
            <tr>
                <td>${booking.id}</td>
                <td><span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span></td>
                <td>${booking.pets.map(pet => pet.name).join(', ')}</td>
                <td>${new Date(booking.start_date).toLocaleDateString('en-GB')} - ${new Date(booking.end_date).toLocaleDateString('en-GB')}</td>
                <td>
                    ${isFutureBooking ? `
                        <button class="btn btn-sm btn-outline-primary edit-booking" data-id="${booking.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger cancel-booking" data-id="${booking.id}">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');

    $('#content-container').html(`
        <h2 class="mb-4">Your Bookings</h2>
        <button class="btn btn-primary mb-3" id="new-booking-btn">
            <i class="fas fa-plus"></i> New Booking
        </button>
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
    `);

    // Add event listeners for the buttons
    $('.edit-booking').on('click', function() {
        const bookingId = $(this).data('id');
        // Navigate to the booking form for editing
        page(`/booking/${bookingId}`); // Use page.js to navigate
    });

    $('.cancel-booking').on('click', function() {
        const bookingId = $(this).data('id');
        // TODO: Implement cancel booking functionality
        console.log('Cancel booking:', bookingId);
    });

    // Add event listener for the New Booking button
    $('#new-booking-btn').on('click', function() {
        page('/booking/new'); // Navigate to the new booking form
    });
}

export function showBookingForm(ctx) {
    const bookingId = ctx.params.bookingId; // Get the booking ID from the URL
    const cachedBookings = JSON.parse(sessionStorage.getItem('bookings'));

    if (cachedBookings) {
        const booking = cachedBookings.find(b => b.id === parseInt(bookingId)); // Find the booking by ID
        if (booking) {
            openBookingForm(booking); // Pass the booking details to the form
        } else {
            console.error('Booking not found:', bookingId);
            showBookingsScreen(); // Fallback to bookings screen if not found
        }
    } else {
        console.error('No cached bookings found.');
        showBookingsScreen(); // Fallback to bookings screen if no cached data
    }
}

export async function openBookingForm(booking = null) {
    try {
        const pet_data = await getPetData();
        const pets = pet_data.pets.filter(pet => !pet.deceased);
        const petCheckboxes = pets.map(pet => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="pet-${pet.no}" value="${pet.no}" ${booking ? (booking.pets.some(bPet => bPet.id === pet.id) ? 'checked' : '') : 'checked'}>
                <label class="form-check-label" for="pet-${pet.no}">${pet.name}</label>
            </div>
        `).join('');

        const formHtml = `
            <div class="container my-5">
                <div class="row">
                    <div class="col-md-8 offset-md-2">
                        <div class="card shadow-sm">
                            <div class="card-header bg-primary text-white">
                                <h2 class="mb-0">${booking ? 'Edit Booking' : 'New Booking'}</h2>
                            </div>
                            <div class="card-body bg-light">
                                <form id="booking-form">
                                    <input type="hidden" name="bk_no" value="${booking ? booking.no : 0}">
                                    <div class="mb-4">
                                        <h4>Select Pets</h4>
                                        ${petCheckboxes}
                                    </div>
                                    <div class="row mb-4">
                                        <div class="col-md-6">
                                            <label for="start-date" class="form-label"><i class="fas fa-calendar-alt"></i> Start Date</label>
                                            <div class="d-flex align-items-center">
                                                <input type="date" class="form-control me-2" style="max-width: 150px;" id="start-date" name="start_date" value="${booking ? new Date(booking.start_date).toISOString().split('T')[0] : ''}" required min="${new Date().toISOString().split('T')[0]}">
                                                ${booking ? 
                                                    `<input type="text" class="form-control" style="max-width: 80px;" name="start_time" value="${booking.start_time}" required>` :
                                                    `<div class="d-flex align-items-center">
                                                        <input type="radio" name="start_time_slot" value="AM" checked> AM
                                                        <input type="radio" name="start_time_slot" value="PM" class="ms-2"> PM
                                                    </div>`
                                                }
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <label for="end-date" class="form-label"><i class="fas fa-calendar-alt"></i> End Date</label>
                                            <div class="d-flex align-items-center">
                                                <input type="date" class="form-control me-2" style="max-width: 150px;" id="end-date" name="end_date" value="${booking ? new Date(booking.end_date).toISOString().split('T')[0] : ''}" required min="${new Date().toISOString().split('T')[0]}">
                                                ${booking ? 
                                                    `<input type="text" class="form-control" style="max-width: 80px;" name="end_time" value="${booking.end_time}" required>` :
                                                    `<div class="d-flex align-items-center">
                                                        <input type="radio" name="end_time_slot" value="AM" checked> AM
                                                        <input type="radio" name="end_time_slot" value="PM" class="ms-2"> PM
                                                    </div>`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <label for="comment" class="form-label"><i class="fas fa-comment"></i> Comment</label>
                                        <textarea class="form-control" id="comment" name="comment" rows="3">${booking ? booking.comment || '' : ''}</textarea>
                                    </div>
                                    <div class="text-center mt-4">
                                        <button type="submit" class="btn btn-primary btn-lg">
                                            <i class="fas fa-check"></i> Submit
                                        </button>
                                        <button type="button" class="btn btn-secondary btn-lg" id="cancel-booking">
                                            <i class="fas fa-times"></i> Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#content-container').html(formHtml);

        // Ensure End Date is always greater than or equal to Start Date
        $('#start-date').on('change', function() {
            const startDate = new Date($(this).val());
            const endDate = new Date($('#end-date').val());
            if (endDate < startDate) {
                $('#end-date').val($(this).val());
            }
            $('#end-date').attr('min', $(this).val());
        });

        $('#booking-form').on('submit', function(event) {
            handleBookingSubmit(event)
                .then(() => {
                    showMessage('Booking saved successfully!', 'success');
                    showBookingsScreen();
                })
                .catch(error => {
                    showMessage(`Error: ${error}`, 'error');
                });
        });
        $('#cancel-booking').on('click', showBookingsScreen);
    } catch (error) {
        console.error('Error loading pet data:', error);
        $('#content-container').html('<div class="alert alert-danger" role="alert">Failed to load pet data. Please try again.</div>');
    }
}
