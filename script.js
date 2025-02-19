//Searches for an element in HTML by id and returns it.
const breedSelector = document.getElementById('breeds');
const loadImagesButton = document.getElementById('load-images');
const dogGallery = document.getElementById('dog-gallery');

//Fetch list of all breeds
async function fetchBreeds() {
    const response = await fetch('https://dog.ceo/api/breeds/list/all');
    const data = await response.json();
    const breeds = Object.keys(data.message);
    breeds.forEach(breed => {
        const option = document.createElement('option');
        option.value = breed;
        option.innerText = breed;
        breedSelector.appendChild(option);
    });
}

// Fetch random images for selected breeds
async function fetchDogImages(breeds) {
    dogGallery.innerHTML = '';
    const breedImages = [];
    for (const breed of breeds) {
        const response = await fetch(`https://dog.ceo/api/breed/${breed}/images/random/10`);
        const data = await response.json();
        breedImages.push({ breed, images: data.message });
    }
    breedImages.forEach(breedData => {
        breedData.images.forEach(imageUrl => {
            const container = document.createElement('div');
            container.classList.add('dog-image-container');

            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = breedData.breed;

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container');

            const randomButton = document.createElement('button');
            randomButton.innerText = 'Random Image';
            randomButton.onclick = () => changeImageRandom(img, breedData.breed);
            
            const breedButton = document.createElement('button');
            breedButton.innerText = 'Another Breed Image';
            breedButton.onclick = () => changeImageBreed(img, breedData.breed);

            buttonContainer.appendChild(randomButton);
            buttonContainer.appendChild(breedButton);
            
            container.appendChild(img);
            container.appendChild(buttonContainer);
            dogGallery.appendChild(container);
        });
    });
}

//Change image to a random dog image
async function changeImageRandom(img, breed) {
    const response = await fetch('https://dog.ceo/api/breeds/image/random');
    const data = await response.json();
    img.src = data.message;
}

//Change image to another image of the same breed
async function changeImageBreed(img, breed) {
    const response = await fetch(`https://dog.ceo/api/breed/${breed}/images/random`);
    const data = await response.json();
    img.src = data.message;
}

//Event listener for button to load images
loadImagesButton.addEventListener('click', () => {
    const selectedBreeds = Array.from(breedSelector.selectedOptions).map(option => option.value);
    if (selectedBreeds.length > 0) {
        fetchDogImages(selectedBreeds);
    } else {
        alert('Please select at least one breed.');
    }
});

//Initial fetch of breeds
fetchBreeds();
