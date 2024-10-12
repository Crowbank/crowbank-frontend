import { config } from '../config.js';

function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

export async function getPetData() {
    const cachedData = sessionStorage.getItem('petData');

    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const token = getToken();
    try {
        const response = await $.ajax({
            url: `${config.backend_url}/pet_data`,
            type: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (response.status === 'success') {
            sessionStorage.setItem('petData', JSON.stringify(response));
            return response;
        } else {
            throw new Error('Failed to load data');
        }
    } catch (error) {
        console.error('Error fetching pet data:', error);
        throw error;
    }
}

export function getPets() {
    const cachedData = JSON.parse(sessionStorage.getItem('petData') || '{}');
    return cachedData.pets || [];
}

export function getBreeds() {
    const cachedData = JSON.parse(sessionStorage.getItem('petData') || '{}');
    return cachedData.breeds || [];
}

export function getVets() {
    const cachedData = JSON.parse(sessionStorage.getItem('petData') || '{}');
    return cachedData.vets || [];
}

export async function addPet(petData) {
    const token = getToken();
    try {
        const response = await $.ajax({
            url: `${config.backend_url}/pet`,
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(petData)
        });

        if (response.status === 'success') {
            // Update the pets in sessionStorage
            const pets = JSON.parse(sessionStorage.getItem('pets') || '[]');
            pets.push(response.pet);
            sessionStorage.setItem('pets', JSON.stringify(pets));
            return response.pet;
        } else {
            throw new Error(response.message || 'Failed to add pet');
        }
    } catch (error) {
        console.error('Error adding pet:', error);
        throw error;
    }
}

export async function updatePet(petId, petData) {
    const token = getToken();
    try {
        const response = await $.ajax({
            url: `${config.backend_url}/pet/${petId}`,
            type: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(petData)
        });

        if (response.status === 'success') {
            // Update the pet in sessionStorage
            const pets = JSON.parse(sessionStorage.getItem('pets') || '[]');
            const index = pets.findIndex(p => p.no === petId);
            if (index !== -1) {
                pets[index] = response.pet;
                sessionStorage.setItem('pets', JSON.stringify(pets));
            }
            return response.pet;
        } else {
            throw new Error(response.message || 'Failed to update pet');
        }
    } catch (error) {
        console.error('Error updating pet:', error);
        throw error;
    }
}

export async function uploadPetImage(petId, file) {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`${config.backend_url}/pet/${petId}/image`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload image');
        }

        // Update the pet's image URL in sessionStorage
        const pets = JSON.parse(sessionStorage.getItem('pets') || '[]');
        const pet = pets.find(p => p.no === petId);
        if (pet) {
            pet.image_url = data.image_url;
            sessionStorage.setItem('pets', JSON.stringify(pets));
        }

        return data;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

export async function refreshPetData() {
    sessionStorage.removeItem('petData');
    return getPetData();
}

export function fetchPet(petId) {
    const pets = getPets();
    const pet = pets.find(p => p.no === petId);
    if (pet) {
        return Promise.resolve(pet);
    }

    // If not found in cache, fetch from server
    const token = getToken();
    return $.ajax({
        url: `${config.backend_url}/pet/${petId}`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }).then(data => {
        if (data.status === 'success') {
            return data.pet;
        } else {
            throw new Error(data.message || 'Failed to load pet details');
        }
    });
}