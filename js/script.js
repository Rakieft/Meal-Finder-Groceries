// === Elements DOM ===
const searchBtn = document.getElementById('search-btn');
const randomBtn = document.getElementById('random-btn');
const ingredientInput = document.getElementById('ingredient-input');
const resultsSection = document.getElementById('results');
// === Grocery List Elements ===
const groceryList = document.getElementById('grocery-list');
const groceryInput = document.getElementById('grocery-input');
const addGroceryBtn = document.getElementById('add-grocery-btn');
const clearGroceryBtn = document.getElementById('clear-grocery-btn');

// === Event Listeners ===
searchBtn.addEventListener('click', () => {
    const query = ingredientInput.value.trim();
    if(query) {
        searchMeals(query);
    }
});

randomBtn.addEventListener('click', () => {
    getRandomMeal();
});

// === Functions ===
async function searchMeals(ingredient) {
    resultsSection.innerHTML = '<p>Loading...</p>';
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
        const data = await res.json();
        displayMeals(data.meals);
    } catch (error) {
        resultsSection.innerHTML = '<p>Sorry, no meals found.</p>';
        console.error(error);
    }
}

async function getRandomMeal() {
    resultsSection.innerHTML = '<p>Loading...</p>';
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/random.php`);
        const data = await res.json();
        displayMeals([data.meals[0]]);
    } catch (error) {
        resultsSection.innerHTML = '<p>Error fetching random meal.</p>';
        console.error(error);
    }
}

function displayMeals(meals) {
    if(!meals) {
        resultsSection.innerHTML = '<p>No meals found.</p>';
        return;
    }

    resultsSection.innerHTML = '';
    meals.forEach(meal => {
        const mealCard = document.createElement('div');
        mealCard.classList.add('meal-card');

        mealCard.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="meal-info">
                <h3>${meal.strMeal}</h3>
                <button onclick="viewMealDetails('${meal.idMeal}')">View Details</button>
                <button onclick="addMealToGrocery('${meal.idMeal}')">Add to Grocery</button>
                <button onclick="addMealToFavorites('${meal.idMeal}')">Add to Favorites</button>
            </div>
        `;

        resultsSection.appendChild(mealCard);
    });
}

async function addMealToGrocery(mealId) {
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await res.json();
        const meal = data.meals[0];

        
        for(let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if(ingredient && ingredient.trim() !== '') {
                const item = `${ingredient} (${measure})`;
                groceries.push(item);
            }
        }

        saveAndRender(); 
        alert(`${meal.strMeal} ingredients added to grocery list!`);

    } catch(error) {
        console.error(error);
        alert('Error adding meal ingredients.');
    }
}

// Placeholder for viewing meal details (to be implemented)
function viewMealDetails(mealId) {
    alert(`Meal ID: ${mealId}\nThis will open meal details page.`);
}

// Load grocery list from LocalStorage
let groceries = JSON.parse(localStorage.getItem('groceries')) || [];
renderGroceryList();

// Add item
addGroceryBtn.addEventListener('click', () => {
    const item = groceryInput.value.trim();
    if(item) {
        groceries.push(item);
        groceryInput.value = '';
        saveAndRender();
    }
});

// Clear list
clearGroceryBtn.addEventListener('click', () => {
    groceries = [];
    saveAndRender();
});

// Remove item
function removeGrocery(index) {
    groceries.splice(index, 1);
    saveAndRender();
}

// Save to LocalStorage and render
function saveAndRender() {
    localStorage.setItem('groceries', JSON.stringify(groceries));
    renderGroceryList();
}

// Render grocery list
function renderGroceryList() {
    groceryList.innerHTML = '';
    groceries.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = item;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => removeGrocery(index));

        li.appendChild(removeBtn);
        groceryList.appendChild(li);
    });
}

// === Favorites Elements ===
const favoritesListDiv = document.getElementById('favorites-list');

// Load favorites from LocalStorage
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
renderFavorites();

async function addMealToFavorites(mealId) {
    try {
        // Vérifier si déjà dans favoris
        if(favorites.find(meal => meal.idMeal === mealId)) {
            alert('Meal already in favorites!');
            return;
        }

        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await res.json();
        const meal = data.meals[0];

        favorites.push({
            idMeal: meal.idMeal,
            strMeal: meal.strMeal,
            strMealThumb: meal.strMealThumb
        });

        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderFavorites();
        alert(`${meal.strMeal} added to favorites!`);
    } catch (error) {
        console.error(error);
        alert('Error adding meal to favorites.');
    }
}

function renderFavorites() {
    favoritesListDiv.innerHTML = '';
    favorites.forEach(meal => {
        const mealCard = document.createElement('div');
        mealCard.classList.add('meal-card');

        mealCard.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="meal-info">
                <h3>${meal.strMeal}</h3>
                <button onclick="viewMealDetails('${meal.idMeal}')">View Details</button>
                <button onclick="removeFavorite('${meal.idMeal}')">Remove</button>
            </div>
        `;

        favoritesListDiv.appendChild(mealCard);
    });
}

function removeFavorite(mealId) {
    favorites = favorites.filter(meal => meal.idMeal !== mealId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
}