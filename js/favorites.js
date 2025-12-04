// ===============================
// FAVORITES.JS — Page favorites.html
// ===============================

// Load favorites from LocalStorage
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// ===============================
// Display Favorite Meals
// ===============================
function renderFavorites() {
    const favoritesListDiv = document.getElementById('favoritesList');
    favoritesListDiv.innerHTML = '';

    if (favorites.length === 0) {
        favoritesListDiv.innerHTML = "<p>No favorite meals yet.</p>";
        return;
    }

    favorites.forEach(meal => {
        const mealCard = document.createElement('div');
        mealCard.classList.add('meal-card');

        mealCard.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="meal-info">
                <h3>${meal.strMeal}</h3>
                <button onclick="viewMealDetails('${meal.idMeal}')">View Details</button>
                <button onclick="addToGrocery('${meal.idMeal}')">Add to Grocery</button>
                <button onclick="removeFavorite('${meal.idMeal}')">Remove</button>
            </div>
        `;

        favoritesListDiv.appendChild(mealCard);
    });
}

// ===============================
// Remove Favorite Meal
// ===============================
function removeFavorite(mealId) {
    favorites = favorites.filter(meal => meal.idMeal !== mealId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
}

// ===============================
// View Meal Details (go to the page)
// ===============================
function viewMealDetails(mealId) {
    window.location.href = `mealDetails.html?id=${mealId}`;
}

// ===============================
// Add Ingredients to Grocery List
// ===============================
async function addToGrocery(mealId) {
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await res.json();
        const meal = data.meals[0];

        let groceries = JSON.parse(localStorage.getItem('groceries')) || [];

        for (let i = 1; i <= 20; i++) {
            const ing = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];

            if (ing && ing.trim() !== '') {
                groceries.push(`${ing} (${measure})`);
            }
        }

        localStorage.setItem('groceries', JSON.stringify(groceries));
        alert(`${meal.strMeal} ingredients added to your grocery list!`);

    } catch (error) {
        console.error("Error adding to grocery:", error);
        alert("Error loading ingredients.");
    }
}

// ⬇️ rendre accessible au HTML
window.viewMealDetails = viewMealDetails;
window.removeFavorite = removeFavorite;
window.addToGrocery = addToGrocery;

// ===============================
// INITIAL LOAD
// ===============================
renderFavorites();