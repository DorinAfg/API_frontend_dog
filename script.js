//Searches for an element in HTML by id and returns it.
const breedSelector = document.getElementById('breeds');
const loadImagesButton = document.getElementById('load-images');
const dogGallery = document.getElementById('dog-gallery');

//Fetch list of all breeds
async function fetchBreeds() {
    //Sends a request to the server and waits for a response.
    //fetch - Sends a request to the server
    //await - waits for a response (and then continues to the next line)
    const response = await fetch('https://dog.ceo/api/breeds/list/all');
    //Converts the response to JSON format
    const data = await response.json();
    //Extracts all breeds names from the received object
    //Object.keys() is a function that returns an array of all the keys of an object. key == breed
    const breeds = Object.keys(data.message);
    //Going through every breed on the list
    breeds.forEach(breed => {
        //Creates a new <option> in the selection menu.
        const option = document.createElement('option');
        //Sets the option value for the breed name.
        option.value = breed;
        //Defines the text displayed in the option.
        option.innerText = breed;
        //Adds the option to the list of breed.
        breedSelector.appendChild(option);
    });
}

// Fetch random images for selected breeds
async function fetchDogImages(breeds) {
     //Clear previous images to display new ones
    dogGallery.innerHTML = '';
    const breedImages = [];
    //A loop that goes through each breed selected by the user.
    for (const breed of breeds) {
        //Sends a request to the server to receive 10 random images of the current breed.
        const response = await fetch(`https://dog.ceo/api/breed/${breed}/images/random/10`);
        const data = await response.json();
        //push add new object to the array
        breedImages.push({ breed, images: data.message });
    }
    //Goes through each object in the array.
    breedImages.forEach(breedData => {
        //Goes through each image URL in the breed object.
        breedData.images.forEach(imageUrl => {
            //Creates a new <div> that will be a container for each image and its buttons.
            const container = document.createElement('div');
            //Adds CSS styling to each image.
            container.classList.add('dog-image-container');
            //Creates a new <img> element and places the link to the image in it.
            const img = document.createElement('img');
            //Loading the image.
            img.src = imageUrl;
            //Provides alternative text (in case the image doesn't load).
            img.alt = breedData.breed;
            const randomButton = document.createElement('button');
            //Text that appears on the button.
            randomButton.innerText = 'Get Random Image';
            //When a user clicks on it, the changeImageRandom() function will replace the image to random.
            randomButton.onclick = () => changeImageRandom(img, breedData.breed);
            const breedButton = document.createElement('button');
            breedButton.innerText = 'Get Another Image of this Breed';
            //When a user clicks on it, the changeImageBreed() function will replace the image to random of the same breed.
            breedButton.onclick = () => changeImageBreed(img, breedData.breed);
            //Adds the image and buttons into a container
            container.appendChild(img);
            container.appendChild(randomButton);
            container.appendChild(breedButton);
            //Adds Adds the container to dogGallery, so that the image and buttons will be displayed on the page.
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
