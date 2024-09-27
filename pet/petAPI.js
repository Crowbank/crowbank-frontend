import { config } from '../config.js';

export function fetchPets() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return $.ajax({
        url: `${config.backend_url}/pet`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }).then(data => {
        if (data.status === 'success') {
            return data.pets;
        } else {
            throw new Error('Failed to load pets');
        }
    });
}

export function addPet(petData) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return $.ajax({
        url: `${backend_url}/pets`,
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(petData)
    }).then(data => {
        if (data.status === 'success') {
            return data.pet;
        } else {
            throw new Error('Failed to add pet');
        }
    });
}

export function updatePet(petId, petData) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return $.ajax({
        url: `${backend_url}/pet/${petId}`,
        type: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(petData)
    }).then(data => {
        if (data.status === 'success') {
            return data.pet;
        } else {
            throw new Error('Failed to update pet');
        }
    });
}

export async function uploadPetImage(petId, file) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${backend_url}/pet/${petId}/image`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to upload image');
    }

    return response.json();
}

export function fetchBreeds() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return $.ajax({
        url: `${backend_url}/breeds`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }).then(data => {
        if (data.status === 'success') {
            return data.breeds;
        } else {
            throw new Error('Failed to load breeds');
        }
    });
}

export function fetchVets() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return $.ajax({
        url: `${backend_url}/vets`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }).then(data => {
        if (data.status === 'success') {
            return data.vets;
        } else {
            throw new Error('Failed to load vets');
        }
    });
}
