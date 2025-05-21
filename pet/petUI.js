import { addPet, getPetData, getBreeds, getVets, uploadPetImage, updatePet, fetchPet, refreshPetData } from './petAPI.js';
import { showMessage } from '../utils/uiUtils.js';
// import page from 'page';

export function showPetsScreen() {
    // Add the "New Pet" button
    $('#content-container').html(`
        <button id="new-pet-btn" class="btn btn-success mb-3">Add New Pet</button>
        <div id="pets-list-container"></div>
    `);

    $('#new-pet-btn').on('click', () => openPetEditForm());
    
    getPetData()
        .then(data => {
            renderPets(data.pets);
        })
        .catch((error) => {
            $('#pets-list-container').html('<div class="alert alert-danger" role="alert">Failed to load data. Please try again.</div>');
            showMessage('Failed to load data. Please try again.', 'error');
        });
}

function renderPets(pets) {
    const renderPetList = (petsToRender) => {
        return petsToRender.map(pet => `
            <div class="col-md-4 mb-4" data-pet-id="${pet.no}">
                <div class="card">
                    <div class="row no-gutters p-2">
                        <div class="col-4">
                            <img src="${pet.image_url || (pet.species === 'Cat' ? 'images/cat.webp' : 'images/dog.webp')}" 
                                 class="card-img pet-image" 
                                 alt="${pet.name}">
                        </div>
                        <div class="col-8">
                            <div class="card-body">
                                <h5 class="card-title">${pet.name}</h5>
                                <p class="card-text">Age: ${calculateAge(pet.dob)}</p>
                                <p class="card-text">Breed: ${pet.breed ? pet.breed.desc : pet.species}</p>
                                <p class="card-text">Vet: ${pet.vet ? pet.vet.practice_name : 'Not assigned'}</p>
                                ${pet.deceased ? '<p class="card-text text-danger">Deceased</p>' : ''}
                                <button class="btn btn-primary btn-sm edit-pet" data-pet-id="${pet.no}">Edit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    };

    const filterPets = (showAll) => {
        return showAll ? pets : pets.filter(pet => !pet.deceased);
    };

    const updatePetList = () => {
        const showAll = $('#show-all-pets').prop('checked');
        const filteredPets = filterPets(showAll);
        $('.pet-list').html(renderPetList(filteredPets));
    };

    $('#pets-list-container').html(`
        <div class="mb-3">
            <input type="checkbox" id="show-all-pets">
            <label for="show-all-pets">Show all pets (including deceased)</label>
        </div>
        <div class="row pet-list">
            ${renderPetList(filterPets(false))}
        </div>
    `);

    $('#show-all-pets').on('change', updatePetList);

    // Add click event listener to pet images
    $('.pet-image').on('click', handleImageClick);
    
    // Update the click event listener for edit buttons
    $('.edit-pet').on('click', function() {
        const petId = $(this).data('pet-id');
        page(`/pet/${petId}`);  // Navigate directly to pet edit form
    });
}

function handleImageClick(event) {
    const fileInput = $('<input type="file" accept="image/*" style="display: none;">');
    fileInput.on('change', handleImageUpload);
    fileInput.click();
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            $('#pet-image').attr('src', e.target.result);
        }
        reader.readAsDataURL(file);

        const petId = $('#pet-id').val();
        if (petId) {
            uploadPetImage(petId, file)
                .then(response => {
                    showMessage('Image uploaded successfully!', 'info');
                })
                .catch(error => {
                    console.error('Error uploading image:', error);
                    showMessage('Failed to upload image. Please try again.', 'error');
                });
        }
    }
}

export function refreshPets() {
    refreshPetData().then(() => {
        showPetsScreen();
    }).catch(error => {
        console.error('Error refreshing pet data:', error);
        showMessage('Failed to refresh pet data. Please try again.', 'error');
    });
}

function handleEditPet(event) {
    const petId = $(event.target).data('pet-id');
    const pets = JSON.parse(sessionStorage.getItem('pets') || '[]');
    const pet = pets.find(p => p.no === petId);
    
    if (!pet) {
        console.error('Pet not found');
        return;
    }

    // Fetch breeds and vets if not already cached
    const cachedBreeds = sessionStorage.getItem('breeds');
    const cachedVets = sessionStorage.getItem('vets');
    
    Promise.all([
        cachedBreeds ? Promise.resolve(JSON.parse(cachedBreeds)) : fetchBreeds(),
        cachedVets ? Promise.resolve(JSON.parse(cachedVets)) : fetchVets()
    ])
    .then(([breeds, vets]) => {
        if (!cachedBreeds) sessionStorage.setItem('breeds', JSON.stringify(breeds));
        if (!cachedVets) sessionStorage.setItem('vets', JSON.stringify(vets));
        renderEditForm(pet, breeds, vets);
    })
    .catch(error => console.error('Error fetching data:', error));
}

function renderEditForm(pet, breeds, vets) {
    const catBreeds = breeds.filter(breed => breed.species === 'Cat');
    const dogBreeds = breeds.filter(breed => breed.species === 'Dog');

    const formHtml = `
        <form id="edit-pet-form">
            <input type="hidden" name="no" value="${pet.no}">
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" class="form-control" id="name" name="name" value="${pet.name}" required>
            </div>
            <div class="form-group">
                <label for="dob">Date of Birth</label>
                <input type="date" class="form-control" id="dob" name="dob" value="${new Date(pet.dob).toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label for="species">Species</label>
                <select class="form-control" id="species" name="species" required>
                    <option value="Cat" ${pet.species === 'Cat' ? 'selected' : ''}>Cat</option>
                    <option value="Dog" ${pet.species === 'Dog' ? 'selected' : ''}>Dog</option>
                </select>
            </div>
            <div class="form-group">
                <label for="breed">Breed</label>
                <select class="form-control" id="breed" name="breed" required>
                    <option value="">Select breed</option>
                    ${renderBreedOptions(pet.species === 'Cat' ? catBreeds : dogBreeds, pet.breed ? pet.breed.no : null)}
                </select>
            </div>
            <div class="form-group">
                <label for="vet">Vet</label>
                <select class="form-control" id="vet" name="vet">
                    <option value="">Select vet</option>
                    ${renderVetOptions(vets, pet.vet ? pet.vet.no : null)}
                </select>
            </div>
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="deceased" name="deceased" ${pet.deceased ? 'checked' : ''}>
                <label class="form-check-label" for="deceased">Deceased</label>
            </div>
            <button type="submit" class="btn btn-primary mt-3">Save Changes</button>
            <button type="button" class="btn btn-secondary mt-3" id="cancel-edit">Cancel</button>
        </form>
    `;

    $('#content-container').html(formHtml);

    $('#edit-pet-form').on('submit', handleSavePet);
    $('#cancel-edit').on('click', () => page('/pets'));  // Use Page.js to navigate back

    // Add event listener for species change
    $('#species').on('change', function() {
        const selectedSpecies = $(this).val();
        const breedOptions = selectedSpecies === 'Cat' ? catBreeds : dogBreeds;
        $('#breed').html(renderBreedOptions(breedOptions));
    });
}

function renderBreedOptions(breeds, selectedBreedNo = null) {
    return breeds.map(breed => 
        `<option value="${breed.no}" ${breed.no === selectedBreedNo ? 'selected' : ''}>${breed.desc}</option>`
    ).join('');
}

function renderVetOptions(vets, selectedVetNo = null) {
    return vets.map(vet => 
        `<option value="${vet.no}" ${vet.no === selectedVetNo ? 'selected' : ''}>${vet.practice_name}</option>`
    ).join('');
}

function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
    }

    return `${years}y ${months}m`;
}

function openPetEditForm(pet = null) {
    const formTitle = pet ? 'Edit Pet' : 'Add New Pet';
    const breeds = getBreeds();
    const vets = getVets();

    const catBreeds = breeds.filter(breed => breed.species === 'Cat');
    const dogBreeds = breeds.filter(breed => breed.species === 'Dog');

    const formHtml = `
        <div class="container my-5">
            <div class="row">
                <div class="col-md-10 offset-md-1">
                    <form id="pet-edit-form">
                        <div class="card shadow-sm mb-4">
                            <div class="card-header bg-primary text-white">
                                <h2 class="mb-0"><i class="fas fa-paw"></i>&nbsp; ${formTitle}</h2>
                            </div>
                            <div class="card-body bg-light">
                                <input type="hidden" id="pet-id" name="no" value="${pet ? pet.no : ''}">
                                <div class="row mb-4">
                                    <div class="col-md-4">
                                        <img id="pet-image" src="${pet ? (pet.image_url || (pet.species === 'Cat' ? 'images/cat.webp' : 'images/dog.webp')) : 'images/pet-placeholder.webp'}" alt="Pet Image" class="img-fluid mb-2 clickable-image" style="cursor: pointer; max-width: 100%; height: auto;">
                                        <p class="text-muted small"><i class="fas fa-camera"></i> Click the image to upload a new photo</p>
                                    </div>
                                    <div class="col-md-8">
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="pet-name" class="form-label"><i class="fas fa-font"></i> Name:</label>
                                                <input type="text" id="pet-name" name="name" class="form-control" value="${pet ? pet.name : ''}" required>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label"><i class="fas fa-venus-mars"></i> Sex:</label>
                                                <div class="d-flex">
                                                    <div class="form-check me-3">
                                                        <input class="form-check-input" type="radio" name="sex" id="sex-male" value="M" ${pet && pet.sex === 'M' ? 'checked' : ''} required>
                                                        <label class="form-check-label" for="sex-male">Male</label>
                                                    </div>
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="radio" name="sex" id="sex-female" value="F" ${pet && pet.sex === 'F' ? 'checked' : ''} required>
                                                        <label class="form-check-label" for="sex-female">Female</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="pet-dob" class="form-label"><i class="fas fa-birthday-cake"></i> Date of Birth:</label>
                                                <input type="date" id="pet-dob" name="dob" class="form-control" value="${pet ? new Date(pet.dob).toISOString().split('T')[0] : ''}" required>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label"><i class="fas fa-paw"></i> Species:</label>
                                                <div class="d-flex">
                                                    <div class="form-check me-3">
                                                        <input class="form-check-input" type="radio" name="species" id="species-dog" value="Dog" ${pet && pet.species === 'Dog' ? 'checked' : ''} required>
                                                        <label class="form-check-label" for="species-dog">Dog</label>
                                                    </div>
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="radio" name="species" id="species-cat" value="Cat" ${pet && pet.species === 'Cat' ? 'checked' : ''} required>
                                                        <label class="form-check-label" for="species-cat">Cat</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="pet-breed" class="form-label"><i class="fas fa-dog"></i> Breed:</label>
                                                <select id="pet-breed" name="breed_no" class="form-select" required>
                                                    <option value="">Select breed</option>
                                                    ${renderBreedOptions(pet && pet.species === 'Cat' ? catBreeds : dogBreeds, pet ? pet.breed.no : null)}
                                                </select>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label for="pet-vet" class="form-label"><i class="fas fa-user-md"></i> Vet:</label>
                                                <select id="pet-vet" name="vet_no" class="form-select">
                                                    <option value="">Select vet</option>
                                                    ${renderVetOptions(vets, pet && pet.vet ? pet.vet.no : null)}
                                                </select>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="pet-microchip" class="form-label"><i class="fas fa-microchip"></i> Microchip:</label>
                                                <input type="text" id="pet-microchip" name="microchip" class="form-control" value="${pet ? pet.microchip || '' : ''}">
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <div class="form-check mt-4">
                                                    <input type="checkbox" id="pet-neutered" name="neutered" class="form-check-input" ${pet && pet.neutered ? 'checked' : ''}>
                                                    <label class="form-check-label" for="pet-neutered"><i class="fas fa-cut"></i> Neutered</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <div class="form-check">
                                                    <input type="checkbox" id="pet-deceased" name="deceased" class="form-check-input" ${pet && pet.deceased ? 'checked' : ''}>
                                                    <label class="form-check-label" for="pet-deceased"><i class="fas fa-heart-broken"></i> Deceased</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="text-center mt-4">
                            <button type="submit" class="btn btn-primary btn-lg mr-2">Save</button>
                            <button type="button" class="btn btn-secondary btn-lg" id="cancel-pet-edit">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    $('#content-container').html(formHtml);

    // Add event listeners
    $('#pet-edit-form').on('submit', handleSavePet);
    $('#cancel-pet-edit').on('click', () => page('/pets'));
    $('#pet-image').on('click', handleImageClick);
    $('input[name="species"]').on('change', function() {
        const selectedSpecies = $(this).val();
        const breedOptions = selectedSpecies === 'Cat' ? catBreeds : dogBreeds;
        $('#pet-breed').html('<option value="">Select breed</option>' + renderBreedOptions(breedOptions));
    });
}

function handleSavePet(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const petData = Object.fromEntries(formData.entries());
    
    petData.deceased = petData.deceased === 'on';
    petData.neutered = petData.neutered === 'on';

    const petId = petData.no;
    delete petData.no;

    if (petId) {
        updatePet(petId, petData)
            .then(() => {
                showMessage('Pet updated successfully!', 'info');
                page('/pets');  // Navigate back to pets list
            })
            .catch(error => {
                console.error('Error updating pet:', error);
                showMessage('Failed to update pet. Please try again.', 'error');
            });
    } else {
        addPet(petData)
            .then(() => {
                showMessage('Pet added successfully!', 'info');
                page('/pets');  // Navigate back to pets list
            })
            .catch(error => {
                console.error('Error adding pet:', error);
                showMessage('Failed to add pet. Please try again.', 'error');
            });
    }
}

export function showPetUI(ctx) {
    const petNo = ctx.params.petNo;

    fetchPet(petNo)
        .then(pet => {
            openPetEditForm(pet);
        })
        .catch(error => {
            console.error('Error fetching pet details:', error);
            showMessage('Failed to load pet details. Please try again.', 'error');
        });
}