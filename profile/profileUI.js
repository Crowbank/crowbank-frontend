import { fetchProfile, updateProfile } from './profileAPI.js';

export function loadProfileScreen() {
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
                console.error('Error loading profile:', error);
            });
    }
}

function renderProfile(profile) {
    const profileHtml = `
        <form id="profile-form" class="card">
            <div class="card-header">
                <h2>${profile.forename} ${profile.surname}</h2>
            </div>
            <div class="card-body">
                <p><strong>Customer ID:</strong> ${profile.no}</p>
                
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" class="form-control" id="email" name="email" value="${profile.email}" required>
                </div>
                
                <div class="form-group">
                    <label for="email2">Secondary Email:</label>
                    <input type="email" class="form-control" id="email2" name="email2" value="${profile.email2 || ''}">
                </div>
                
                <div class="form-group">
                    <label for="telno_mobile">Mobile:</label>
                    <input type="tel" class="form-control" id="telno_mobile" name="telno_mobile" value="${profile.telno_mobile}" required>
                </div>
                
                <div class="form-group">
                    <label for="telno_home">Home Phone:</label>
                    <input type="tel" class="form-control" id="telno_home" name="telno_home" value="${profile.telno_home || ''}">
                </div>
                
                <div class="form-group">
                    <label for="telno_mobile2">Secondary Mobile:</label>
                    <input type="tel" class="form-control" id="telno_mobile2" name="telno_mobile2" value="${profile.telno_mobile2 || ''}">
                </div>
                
                <div class="form-group">
                    <label for="addr1">Address:</label>
                    <input type="text" class="form-control" id="addr1" name="addr1" value="${profile.addr1}" required>
                </div>
                
                <div class="form-group">
                    <label for="addr3">Address Line 2:</label>
                    <input type="text" class="form-control" id="addr3" name="addr3" value="${profile.addr3 || ''}">
                </div>
                
                <div class="form-group">
                    <label for="postcode">Postcode:</label>
                    <input type="text" class="form-control" id="postcode" name="postcode" value="${profile.postcode}" required>
                </div>
                
                ${renderEmergencyContactsForm(profile.emergency)}
            </div>
            <div class="card-footer">
                <button type="submit" class="btn btn-primary">Submit</button>
                <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
            </div>
        </form>
    `;

    $('#content-container').html(profileHtml);
    
    // Add event listeners
    $('#profile-form').on('submit', handleSubmit);
    $('#cancel-btn').on('click', handleCancel);
}

function renderEmergencyContactsForm(emergencyContacts) {
    if (!emergencyContacts || emergencyContacts.length === 0) {
        return '';
    }

    let emergencyHtml = '<h3>Emergency Contacts</h3>';
    emergencyContacts.forEach((contact, index) => {
        emergencyHtml += `
            <div class="emergency-contact">
                <h4>Contact ${index + 1}</h4>
                <div class="form-group">
                    <label for="emergency_name_${index}">Name:</label>
                    <input type="text" class="form-control" id="emergency_name_${index}" name="emergency[${index}][name]" value="${contact.name}" required>
                </div>
                <div class="form-group">
                    <label for="emergency_telno_${index}">Phone:</label>
                    <input type="tel" class="form-control" id="emergency_telno_${index}" name="emergency[${index}][telno]" value="${contact.telno}" required>
                </div>
                <div class="form-group">
                    <label for="emergency_telno2_${index}">Secondary Phone:</label>
                    <input type="tel" class="form-control" id="emergency_telno2_${index}" name="emergency[${index}][telno2]" value="${contact.telno2 || ''}">
                </div>
            </div>
        `;
    });

    return emergencyHtml;
}

function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const updatedProfile = Object.fromEntries(formData);
    
    // Process emergency contacts
    updatedProfile.emergency = [];
    for (let i = 0; i < 10; i++) { // Assuming max 10 emergency contacts
        if (formData.get(`emergency[${i}][name]`)) {
            updatedProfile.emergency.push({
                name: formData.get(`emergency[${i}][name]`),
                telno: formData.get(`emergency[${i}][telno]`),
                telno2: formData.get(`emergency[${i}][telno2]`) || null
            });
        }
    }
    
    updateProfile(updatedProfile)
        .then(() => {
            sessionStorage.removeItem('profile');
            loadProfileScreen();
        })
        .catch((error) => {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        });
}

function handleCancel() {
    loadProfileScreen();
}

export function refreshProfile() {
    sessionStorage.removeItem('profile');
    loadProfileScreen();
}