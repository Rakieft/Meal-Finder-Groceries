const API = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

// Get Meal ID from URL
const urlParams = new URLSearchParams(window.location.search);
const mealId = urlParams.get("id");

const container = document.getElementById("mealDetails");
const titleEl = document.getElementById("mealTitle");

if (!mealId) {
  container.innerHTML = "<p>No meal selected.</p>";
}

// Fetch Meal Data
async function loadMeal() {
  try {
    const res = await fetch(API + mealId);
    const data = await res.json();
    const meal = data.meals[0];

    titleEl.textContent = meal.strMeal;

    renderMeal(meal);

  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Error loading meal.</p>";
  }
}

function renderMeal(meal) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ingredient && ingredient.trim()) {
      ingredients.push(`${ingredient} - ${measure}`);
    }
  }

  const isFavorite = checkIfFavorite(meal.idMeal);

  container.innerHTML = `
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">

    <h2>${meal.strMeal}</h2>

    <button id="favoriteBtn" class="favorite-btn">
      ${isFavorite ? "★ Remove from Favorites" : "☆ Add to Favorites"}
    </button>

    <p><strong>Category:</strong> ${meal.strCategory}</p>
    <p><strong>Area:</strong> ${meal.strArea}</p>

    <h2>Instructions</h2>
    <p>${meal.strInstructions}</p>

    <h2>Ingredients</h2>
    <ul class="ingredients-list">
      ${ingredients.map(i => `<li>${i}</li>`).join("")}
    </ul>
  `;

  document.getElementById("favoriteBtn").addEventListener("click", () => {
    toggleFavorite(meal);
  });
}

/* --------------------------------------
   FAVORITES LOGIC (localStorage)
-------------------------------------- */

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favs) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

function checkIfFavorite(id) {
  const favs = getFavorites();
  return favs.some(m => m.idMeal === id);
}

function toggleFavorite(meal) {
  let favs = getFavorites();
  const exists = favs.some(m => m.idMeal === meal.idMeal);

  if (exists) {
    // Remove
    favs = favs.filter(m => m.idMeal !== meal.idMeal);
    saveFavorites(favs);
    alert("Removed from Favorites!");
  } else {
    // Add
    favs.push({
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb
    });
    saveFavorites(favs);
    alert("Added to Favorites!");
  }

  // Refresh the button display
  renderMeal(meal);
}

loadMeal();