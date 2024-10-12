import { config } from '../config.js';
import { getToken, setToken } from '../auth/authUtils.js';

export async function fetchProfile() {
    const token = getToken();
    try {
        const response = await fetch(`${config.backend_url}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        console.log(data.customer);
        return data.customer;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}

export async function updateProfile(profileData) {
    const token = getToken();
    try {
        const response = await fetch(`${config.backend_url}/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        const data = await response.json();
        console.log(data.customer);

        return {
            customer: data.customer,
            token: data.token
        };
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

export function getCustomerStatus() {
    const token = getToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
        hasAddress: payload.has_address,
        hasMobile: payload.has_mobile,
        hasPets: payload.has_pets
    };
}