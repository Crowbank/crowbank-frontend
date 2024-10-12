import { loadBookingsScreen, refreshBookings } from '../booking/bookingUI.js';
import { loadPetsScreen, refreshPets } from '../pet/petUI.js';
import { loadProfileScreen, refreshProfile } from '../profile/profileUI.js';
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

    $('#refresh-data').on('click', function(e) {
        e.preventDefault();
        Promise.all([
            refreshBookings().catch(handleApiError),
            refreshPets().catch(handleApiError),
            refreshProfile().catch(handleApiError)
        ]).then(() => {
            showMessage('Data refreshed successfully!', 'info');
        }).catch(() => {
            // Error already handled by handleApiError
        });
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
                    background-color: ${backgroundColor[type]}; color: ${textColor[type]};
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    $('body').prepend(banner);

    // Adjust body padding to prevent content from being hidden behind the banner
    $('body').css('padding-top', $('#message-banner').outerHeight());

    // Remove padding when the banner is closed
    $('.btn-close').on('click', function() {
        $('body').css('padding-top', 0);
    });
}

export function updateMenuState() {
    const hasRegistration = sessionStorage.getItem('hasRegistration') === 'true';
    const hasPets = sessionStorage.getItem('hasPets') === 'true';

    $('#menu-bookings').toggleClass('disabled', !hasRegistration || !hasPets)
        .attr('tabindex', (!hasRegistration || !hasPets) ? '-1' : '0')
        .attr('aria-disabled', (!hasRegistration || !hasPets).toString());
    
    $('#menu-pets').toggleClass('disabled', !hasRegistration)
        .attr('tabindex', !hasRegistration ? '-1' : '0')
        .attr('aria-disabled', (!hasRegistration).toString());
}

export function handleApiError(error) {
    if (error.response) {
        const data = error.response.data;
        if (data.status === 'error' && (data.code === 'token_expired' || data.code === 'invalid_token' || data.code === 'authorization_required')) {
            handleCredentialError(data.message);
        } else {
            console.error('API Error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        }
    } else {
        console.error('Network Error:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
    }
}
