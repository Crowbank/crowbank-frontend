import { fetchProfile, updateProfile } from './profileAPI.js';
import { showMessage, updateMenuState } from '../utils/uiUtils.js';
import { setToken } from '../auth/authUtils.js';

export function showProfileScreen() {
    const cachedProfile = sessionStorage.getItem('profile');
    
    if (cachedProfile) {
        renderProfile(JSON.parse(cachedProfile));
    } else {
        fetchProfile()
            .then((profile) => {
                sessionStorage.setItem('profile', JSON.stringify(profile));
                renderProfile(profile);
            })
            .catch((error) => {
                $('#content-container').html('<div class="alert alert-danger" role="alert">Failed to load profile. Please try again.</div>');
                showMessage('Failed to load profile. Please try again.', 'error');
            });
    }
}

function renderProfile(profile) {
    const profileHtml = `
        <div class="container my-5">
            <div class="row">
                <div class="col-md-8 offset-md-2">
                    <form id="profile-form">
                        <div class="card shadow-sm mb-4">
                            <div class="card-header bg-primary text-white">
                                <h2 class="mb-0"><i class="fas fa-user-circle"></i>&nbsp; Customer Profile</h2>
                            </div>
                            <div class="card-body bg-light">
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <p class="mb-1 customer-id"><strong><i class="fas fa-id-card"></i> Customer ID:</strong></p>
                                        <p class="lead">${profile.no}</p>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="forename" class="form-label"><i class="fas fa-user"></i> Forename:</label>
                                        <input type="text" class="form-control" id="forename" name="forename" value="${profile.forename}" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="surname" class="form-label"><i class="fas fa-user"></i> Surname:</label>
                                        <input type="text" class="form-control" id="surname" name="surname" value="${profile.surname}" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="email" class="form-label"><i class="fas fa-envelope"></i> Email:</label>
                                        <input type="email" class="form-control" id="email" name="email" value="${profile.email}" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="email2" class="form-label"><i class="fas fa-envelope"></i> Secondary Email:</label>
                                        <input type="email" class="form-control" id="email2" name="email2" value="${profile.email2 || ''}">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="telno_mobile" class="form-label"><i class="fas fa-mobile-alt"></i> Mobile:</label>
                                        <input type="tel" class="form-control" id="telno_mobile" name="telno_mobile" value="${profile.telno_mobile}" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="telno_home" class="form-label"><i class="fas fa-phone"></i> Home Phone:</label>
                                        <input type="tel" class="form-control" id="telno_home" name="telno_home" value="${profile.telno_home || ''}">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="telno_mobile2" class="form-label"><i class="fas fa-mobile-alt"></i> Secondary Mobile:</label>
                                        <input type="tel" class="form-control" id="telno_mobile2" name="telno_mobile2" value="${profile.telno_mobile2 || ''}">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12 mb-3">
                                        <label for="addr1" class="form-label"><i class="fas fa-home"></i> Address:</label>
                                        <input type="text" class="form-control" id="addr1" name="addr1" value="${profile.addr1}" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="addr3" class="form-label"><i class="fas fa-map-marker-alt"></i> Address Line 2:</label>
                                        <input type="text" class="form-control" id="addr3" name="addr3" value="${profile.addr3 || ''}">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="postcode" class="form-label"><i class="fas fa-map-pin"></i> Postcode:</label>
                                        <input type="text" class="form-control" id="postcode" name="postcode" value="${profile.postcode}" required>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        ${renderEmergencyContactsForm(profile.emergency)}
                        
                        <div class="text-center mt-4">
                            <button type="submit" class="btn btn-primary btn-lg mr-2">Save Changes</button>
                            <button type="button" class="btn btn-secondary btn-lg" id="cancel-btn">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    $('#content-container').html(profileHtml);
    
    // Add event listeners
    $('#profile-form').on('submit', handleSubmit);
    $('#cancel-btn').on('click', handleCancel);
}

function renderEmergencyContactsForm(emergencyContacts) {
    let emergencyHtml = `
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-info text-white">
                <h3 class="mb-0"><i class="fas fa-ambulance"></i>&nbsp; Emergency Contacts</h3>
            </div>
            <div class="card-body bg-light">
                <div class="row">
    `;
    
    for (let i = 0; i < 2; i++) {
        const contact = emergencyContacts && emergencyContacts[i] ? emergencyContacts[i] : {};
        emergencyHtml += `
            <div class="col-md-6 emergency-contact mb-4">
                <h4 class="mb-3">Contact ${i + 1}</h4>
                <div class="mb-3">
                    <label for="emergency_name_${i}" class="form-label"><i class="fas fa-user"></i>Name:</label>
                    <input type="text" class="form-control" id="emergency_name_${i}" name="emergency[${i}][name]" value="${contact.name || ''}">
                </div>
                <div class="mb-3">
                    <label for="emergency_telno_${i}" class="form-label"><i class="fas fa-phone"></i>Phone:</label>
                    <input type="tel" class="form-control" id="emergency_telno_${i}" name="emergency[${i}][telno]" value="${contact.telno || ''}">
                </div>
                <div class="mb-3">
                    <label for="emergency_telno2_${i}" class="form-label"><i class="fas fa-phone-alt"></i>Secondary Phone:</label>
                    <input type="tel" class="form-control" id="emergency_telno2_${i}" name="emergency[${i}][telno2]" value="${contact.telno2 || ''}">
                </div>
            </div>
        `;
    }

    emergencyHtml += `
                </div>
            </div>
        </div>
    `;

    return emergencyHtml;
}

function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const updatedProfile = Object.fromEntries(formData);
    
    // Process emergency contacts
    updatedProfile.emergency = [];
    for (let i = 0; i < 2; i++) {
        if (formData.get(`emergency[${i}][name]`)) {
            updatedProfile.emergency.push({
                name: formData.get(`emergency[${i}][name]`),
                telno: formData.get(`emergency[${i}][telno]`),
                telno2: formData.get(`emergency[${i}][telno2]`) || null
            });
        }
    }
    
    updateProfile(updatedProfile)
        .then((response) => {
            sessionStorage.removeItem('profile');
            if (response.token) {
                setToken(response.token, true); // Update the token
                const decodedToken = JSON.parse(atob(response.token.split('.')[1]));
                sessionStorage.setItem('hasRegistration', decodedToken.has_registration);
                sessionStorage.setItem('hasPets', decodedToken.has_pets);
            }
            loadProfileScreen();
            updateMenuState();
            showMessage('Profile updated successfully!', 'info');
        })
        .catch((error) => {
            console.error('Error updating profile:', error);
            showMessage('Failed to update profile. Please try again.', 'error');
        });
}

function handleCancel() {
    showProfileScreen();
}

export function refreshProfile() {
    sessionStorage.removeItem('profile');
    showProfileScreen();
}
