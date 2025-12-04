// ===== FETCH CATEGORIES FROM API =====
async function loadCategories() {
  try {
    const res = await fetch("https://www.themealdb.com/api/json/v1/1/list.php?c=list");
    const data = await res.json();

    const categorySelect = document.getElementById("categoryFilter");
    categorySelect.innerHTML = '<option value="">All Categories</option>';

    data.meals.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.strCategory;
      option.textContent = cat.strCategory;
      categorySelect.appendChild(option);
    });

  } catch (err) {
    console.error("Error loading categories:", err);
  }
}

// ===== FETCH AREAS FROM API =====
async function loadAreas() {
  try {
    const res = await fetch("https://www.themealdb.com/api/json/v1/1/list.php?a=list");
    const data = await res.json();

    const areaSelect = document.getElementById("areaFilter");
    areaSelect.innerHTML = '<option value="">All Areas</option>';

    data.meals.forEach(area => {
      const option = document.createElement("option");
      option.value = area.strArea;
      option.textContent = area.strArea;
      areaSelect.appendChild(option);
    });

  } catch (err) {
    console.error("Error loading areas:", err);
  }
}

// Load categories + areas when page loads
loadCategories();
loadAreas();

// Auto-load meals once filters are ready
setTimeout(() => {
  applyFilters();
}, 400);





/*************************************************
 *  FILTERS MODULE – Meal Finder & Groceries
 *  Version: PRO
 *  Author: Rakieft (with AI assistance)
 *************************************************/

/* ----------------------------------------------
   API CONFIGURATION (TheMealDB)
---------------------------------------------- */

const API_BASE = "https://www.themealdb.com/api/json/v1/1/";

/* ----------------------------------------------
   DOM ELEMENTS
---------------------------------------------- */

const categorySelect = document.getElementById("categoryFilter");
const areaSelect = document.getElementById("areaFilter");
const caloriesInput = document.getElementById("caloriesFilter");
const dietCheckboxes = document.querySelectorAll(".diet");

const applyBtn = document.getElementById("applyFiltersBtn");
const resetBtn = document.getElementById("resetFiltersBtn");

const resultsContainer = document.getElementById("results");

/* ----------------------------------------------
   HELPER: Fetch JSON from API
---------------------------------------------- */
async function fetchAPI(endpoint) {
  try {
    const res = await fetch(API_BASE + endpoint);
    const data = await res.json();
    return data.meals;
  } catch (err) {
    console.error("API Error:", err);
    return [];
  }
}

/* ----------------------------------------------
   FETCH FOR BASIC FILTERS (category, area)
---------------------------------------------- */

async function filterByCategory(category) {
  if (!category) return [];
  return await fetchAPI(`filter.php?c=${category}`);
}

async function filterByArea(area) {
  if (!area) return [];
  return await fetchAPI(`filter.php?a=${area}`);
}

/* ----------------------------------------------
   GET FULL MEAL DETAILS (because filters return minimal data)
---------------------------------------------- */

async function getMealDetails(id) {
  const data = await fetchAPI(`lookup.php?i=${id}`);
  return data ? data[0] : null;
}

/* ----------------------------------------------
   MOCK CALORIE GENERATOR 
   (TheMealDB does not provide calories, so we simulate)
---------------------------------------------- */
function estimateCalories(meal) {
  const base = meal.strIngredient10 ? 700 : 450;
  return Math.floor(base + Math.random() * 250);
}

/* ----------------------------------------------
   APPLY ADVANCED FILTERS (dietary & calorie)
---------------------------------------------- */

function matchesDietRestrictions(meal, selectedDiets) {
  if (selectedDiets.length === 0) return true;

  const mealName = meal.strMeal.toLowerCase();

  // simple simulation (school project)
  return selectedDiets.every(diet => {
    return (
      (diet === "vegetarian" && mealName.includes("vegetable")) ||
      (diet === "vegan" && !mealName.includes("chicken") && !mealName.includes("beef")) ||
      (diet === "gluten-free" && !meal.strMeal.includes("bread")) ||
      (diet === "dairy-free" && !meal.strMeal.includes("cheese"))
    );
  });
}

/* ----------------------------------------------
   MAIN FILTERING FUNCTION (PRO LOGIC)
---------------------------------------------- */

async function applyFilters() {
  resultsContainer.innerHTML = `<p class="loading">Loading results...</p>`;

  const category = categorySelect.value;
  const area = areaSelect.value;
  const maxCalories = parseInt(caloriesInput.value);
  const selectedDiets = [...dietCheckboxes]
    .filter(ch => ch.checked)
    .map(ch => ch.value);

  let meals = [];

  // STEP 1: CATEGORY
  if (category) {
    meals = await filterByCategory(category);
  }

  // STEP 2: AREA (cross-filter)
  if (area) {
    const areaMeals = await filterByArea(area);
    if (meals.length === 0) {
      meals = areaMeals;
    } else {
      const areaIds = areaMeals.map(m => m.idMeal);
      meals = meals.filter(m => areaIds.includes(m.idMeal));
    }
  }

  // No category/area selected → load all meals (simplified)
  if (!category && !area) {
    meals = await fetchAPI("search.php?s=");
  }

  if (!meals) {
    resultsContainer.innerHTML = `<p class="no-results">No meals found.</p>`;
    return;
  }

  // STEP 3: Get full details for each meal
  const detailedMeals = [];
  for (let m of meals) {
    const fullMeal = await getMealDetails(m.idMeal);
    if (fullMeal) {
      fullMeal.estimatedCalories = estimateCalories(fullMeal);
      detailedMeals.push(fullMeal);
    }
  }

  // STEP 4: Apply advanced filters (calories + diet)
  let finalResults = detailedMeals.filter(meal => {
    const calorieOK = isNaN(maxCalories) || meal.estimatedCalories <= maxCalories;
    const dietOK = matchesDietRestrictions(meal, selectedDiets);
    return calorieOK && dietOK;
  });

  // STEP 5: Display results
  renderResults(finalResults);
}

/* ----------------------------------------------
   RENDER RESULTS (Cards)
---------------------------------------------- */

function renderResults(meals) {
  if (!meals || meals.length === 0) {
    resultsContainer.innerHTML = `<p class="no-results">No meals match your filters.</p>`;
    return;
  }

  resultsContainer.innerHTML = meals
    .map(
    meal => `
      <div class="meal-card">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h3>${meal.strMeal}</h3>
        <p><strong>Area:</strong> ${meal.strArea}</p>
        <p><strong>Category:</strong> ${meal.strCategory}</p>
        <p><strong>Estimated Calories:</strong> ${meal.estimatedCalories} kcal</p>

        <a href="mealDetails.html?id=${meal.idMeal}" class="details-btn">
          View Meal
        </a>
      </div>
    `
  )
  .join("");
}

/* ----------------------------------------------
   RESET FILTERS
---------------------------------------------- */

function resetFilters() {
  categorySelect.value = "";
  areaSelect.value = "";
  caloriesInput.value = "";
  dietCheckboxes.forEach(d => (d.checked = false));
  resultsContainer.innerHTML = "";
}

/* ----------------------------------------------
   EVENTS
---------------------------------------------- */

applyBtn.addEventListener("click", applyFilters);
resetBtn.addEventListener("click", resetFilters);