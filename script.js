// מחפש את האלמנטים בדף לפי id
const breedSelector = document.getElementById('breeds');
const loadImagesButton = document.getElementById('load-images');
const dogGallery = document.getElementById('dog-gallery');

/**
 * מביא רשימת כל הגזעים מה-API של dog.ceo
 */
async function fetchBreeds() {
    try {
        const response = await fetch('https://dog.ceo/api/breeds/list/all');
        const data = await response.json();
        const breeds = Object.keys(data.message);

        breeds.forEach(breed => {
            const option = document.createElement('option');
            option.value = breed;
            option.innerText = breed;
            breedSelector.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching breeds:', error);
    }
}

/**
 * מביא 10 תמונות רנדומליות לכל גזע שנבחר ומציג בגלריה
 */
async function fetchDogImages(breeds) {
    dogGallery.innerHTML = '';
    const breedImages = [];

    try {
        // עבור כל גזע שהמשתמש בחר, נקבל 10 תמונות רנדומליות
        for (const breed of breeds) {
            const response = await fetch(`https://dog.ceo/api/breed/${breed}/images/random/10`);
            const data = await response.json();
            breedImages.push({ breed, images: data.message });
        }
    } catch (error) {
        console.error('Error fetching images:', error);
        return;
    }

    // מציגים את התמונות בגלריה
    breedImages.forEach(breedData => {
        breedData.images.forEach(imageUrl => {
            const container = document.createElement('div');
            container.classList.add('dog-image-container');

            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = breedData.breed;
            // ברירת מחדל: תמונה זו לא הגיעה מלחיצה על "Random"
            img.dataset.isRandom = "false";
            // שומרים את הגזע הראשי בלבד (ללא sub-breed) – מתוך הבחירה המקורית
            img.dataset.breed = JSON.stringify({ mainBreed: breedData.breed, subBreed: null });

            // מכולה לכפתורים
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container');

            // כפתור "Random Image"
            const randomButton = document.createElement('button');
            randomButton.innerText = 'Random Image';
            randomButton.onclick = () => changeImageRandom(img);

            // כפתור "Another Breed Image"
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

/**
 * פונקציה לחילוץ גזע ותת-גזע (אם יש) מ-URL של התמונה, בהתאם למבנה של Dog CEO
 * דוגמה ל-URL: https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg
 */
function extractBreedFromUrl(url) {
    console.log("extractBreedFromUrl -> URL:", url);
    const parts = url.split('/');
    console.log("extractBreedFromUrl -> parts:", parts);

    // ננסה לבדוק אם יש את המחרוזת 'breeds' או 'breed'
    let breedIndex = parts.indexOf('breeds');
    if (breedIndex === -1) {
        breedIndex = parts.indexOf('breed');
    }
    console.log("extractBreedFromUrl -> breedIndex:", breedIndex);

    if (breedIndex === -1 || parts.length <= breedIndex + 1) {
        console.warn("extractBreedFromUrl -> לא נמצא חלק מתאים ב-URL");
        return null;
    }
    const breedFull = parts[breedIndex + 1];
    console.log("extractBreedFromUrl -> breedFull:", breedFull);

    // אם יש מקף, נניח שזה mainBreed-subBreed
    if (breedFull.includes('-')) {
        const [mainBreed, subBreed] = breedFull.split('-');
        console.log("extractBreedFromUrl -> mainBreed:", mainBreed, "subBreed:", subBreed);
        return { mainBreed, subBreed };
    } else {
        console.log("extractBreedFromUrl -> mainBreed (ללא subBreed):", breedFull);
        return { mainBreed: breedFull, subBreed: null };
    }
}

/**
 * פונקציה המחזירה URL מתאים ל-fetch לפי mainBreed + subBreed.
 * אם subBreed קיים, זה יהיה: breed/mainBreed/subBreed/images/random
 * אחרת: breed/mainBreed/images/random
 */
function getBreedApiUrl(breedObj) {
    if (!breedObj) return null;
    const { mainBreed, subBreed } = breedObj;
    let url;
    if (subBreed) {
        url = `https://dog.ceo/api/breed/${mainBreed}/${subBreed}/images/random`;
    } else {
        url = `https://dog.ceo/api/breed/${mainBreed}/images/random`;
    }
    console.log("getBreedApiUrl -> URL:", url);
    return url;
}

/**
 * שינוי תמונה לתמונה אקראית מכל הגזעים.
 * לאחר מכן, ננסה לחלץ את הגזע ותת-הגזע מה-URL, ולשמור זאת ב-dataset.
 */
async function changeImageRandom(img) {
    try {
        const response = await fetch('https://dog.ceo/api/breeds/image/random');
        const data = await response.json();
        img.src = data.message;

        // סימון שהתמונה כעת היא אקראית
        img.dataset.isRandom = "true";

        // ננסה לחלץ את שם הגזע ותת-הגזע
        const breedObj = extractBreedFromUrl(data.message);
        if (breedObj) {
            img.dataset.breed = JSON.stringify(breedObj);
        } else {
            img.dataset.breed = "";
        }
    } catch (error) {
        console.error('Error fetching random image:', error);
    }
}

/**
 * שינוי התמונה לתמונה נוספת מהגזע המתאים.
 * - אם התמונה היא אקראית (isRandom==="true"), נחפש ב-dataset.breed (אם קיים).
 * - אם אין מידע ב-dataset.breed, נשתמש ב-defaultBreed (שקיבלנו מהגלריה המקורית).
 */
async function changeImageBreed(img, defaultBreed) {
    try {
        let breedObj = null;

        if (img.dataset.isRandom === "true" && img.dataset.breed) {
            // ננסה לפענח את ה-breedObj ששמרנו
            breedObj = JSON.parse(img.dataset.breed);
        }

        // אם אין לנו breedObj תקין, נשתמש בגזע המקורי (ללא תת-גזע)
        if (!breedObj || !breedObj.mainBreed) {
            breedObj = { mainBreed: defaultBreed, subBreed: null };
        }

        const url = getBreedApiUrl(breedObj);
        if (!url) return; // אם משום מה לא הצלחנו לבנות URL

        const response = await fetch(url);
        const data = await response.json();
        img.src = data.message;

        // מעדכנים dataset כך שידע שהתמונה כבר לא "אקראית", אלא מתייחסת ישירות לגזע הזה
        img.dataset.isRandom = "false";
        img.dataset.breed = JSON.stringify(breedObj);

    } catch (error) {
        console.error('Error fetching breed image:', error);
    }
}

/**
 * מאזין ללחיצה על כפתור הטעינה
 */
loadImagesButton.addEventListener('click', () => {
    const selectedBreeds = Array.from(breedSelector.selectedOptions).map(option => option.value);
    if (selectedBreeds.length > 0) {
        fetchDogImages(selectedBreeds);
    } else {
        alert('Please select at least one breed.');
    }
});

/**
 * קריאה ראשונית להבאת רשימת הגזעים
 */
fetchBreeds();
