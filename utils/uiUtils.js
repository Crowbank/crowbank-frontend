import { loadBookingsScreen } from '../booking/bookingUI.js';
import { loadPetsScreen } from '../pet/petUI.js';
import { loadProfileScreen } from '../profile/profileUI.js';
import { loadLoginForm } from '../auth/authUI.js';

export function bindMenuActions() {
    $('#menu-bookings').on('click', function (e) {
        e.preventDefault();
        loadBookingsScreen();
    });

    $('#menu-pets').on('click', function (e) {
        e.preventDefault();
        loadPetsScreen();
    });

    $('#menu-profile').on('click', function (e) {
        e.preventDefault();
        loadProfileScreen();
    });

    $('#menu-logout').on('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        loadLoginForm();
        toggleMenu(false);
    });
}

export function toggleMenu(show) {
    if (show) {
        $('nav').show();
    } else {
        $('nav').hide();
    }
}