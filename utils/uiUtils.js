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

export function showMessage(message, type = 'info') {
    // Remove any existing message banner
    $('#message-banner').remove();

    const backgroundColor = {
        'info': '#d1ecf1',
        'warning': '#fff3cd',
        'error': '#f8d7da'
    };

    const textColor = {
        'info': '#0c5460',
        'warning': '#856404',
        'error': '#721c24'
    };

    const banner = `
        <div id="message-banner" class="alert alert-dismissible fade show" role="alert" 
             style="position: fixed; top: 0; left: 0; right: 0; z-index: 1050; margin-bottom: 0; 
                    background-color: ${backgroundColor[type]}; color: ${textColor[type]};">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    $('body').prepend(banner);

    // Auto-hide the banner after 5 seconds
    setTimeout(() => {
        $('#message-banner').alert('close');
    }, 5000);
}