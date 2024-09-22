import { fetchPets, uploadPetImage, fetchBreeds, fetchVets, updatePet } from './petAPI.js';

export function loadPetsScreen() {
    const cachedPets = sessionStorage.getItem('pets');
    
    if (cachedPets) {
        renderPets(JSON.parse(cachedPets));
    } else {
        fetchPets()
            .then((pets) => {
                sessionStorage.setItem('pets', JSON.stringify(pets));
                renderPets(pets);
            })
            .catch((error) => {
                $('#content-container').html('<div class="alert alert-danger" role="alert">Failed to load pets. Please try again.</div>');
                console.error('Error loading pets:', error);
            });
    }
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

    $('#content-container').html(`
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
    
    // Add click event listener to edit buttons
    $('.edit-pet').on('click', handleEditPet);
}

function handleImageClick(event) {
    const petId = $(event.target).closest('[data-pet-id]').data('pet-id');
    const fileInput = $('<input type="file" accept="image/*" style="display: none;">');
    
    fileInput.on('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadPetImage(petId, file)
                .then(() => refreshPets())
                .catch(error => console.error('Error uploading image:', error));
        }
    });

    fileInput.click();
}

export function refreshPets() {
    sessionStorage.removeItem('pets');
    loadPetsScreen();
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
    $('#cancel-edit').on('click', loadPetsScreen);

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

function handleSavePet(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const updatedPet = Object.fromEntries(formData.entries());
    
    // Convert checkbox value to boolean
    updatedPet.deceased = updatedPet.deceased === 'on';

    updatePet(updatedPet.no, updatedPet)
        .then(() => {
            refreshPets();
        })
        .catch(error => {
            console.error('Error updating pet:', error);
            $('#content-container').prepend(`
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    Failed to update pet. Please try again.
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            `);
        });
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