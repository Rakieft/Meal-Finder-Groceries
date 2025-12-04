let groceries = JSON.parse(localStorage.getItem('groceries')) || [];

const groceryList = document.getElementById('grocery-list');
const groceryInput = document.getElementById('grocery-input');
const addBtn = document.getElementById('add-grocery-btn');
const clearBtn = document.getElementById('clear-grocery-btn');

renderGroceryList();

// Add item
addBtn.addEventListener('click', () => {
    const item = groceryInput.value.trim();
    if (item) {
        groceries.push(item);
        groceryInput.value = '';
        saveAndRender();
    }
});

// Clear list
clearBtn.addEventListener('click', () => {
    groceries = [];
    saveAndRender();
});

// Remove item
function removeItem(index) {
    groceries.splice(index, 1);
    saveAndRender();
}

// Save & render
function saveAndRender() {
    localStorage.setItem('groceries', JSON.stringify(groceries));
    renderGroceryList();
}

// Show list
function renderGroceryList() {
    groceryList.innerHTML = '';
    groceries.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = item;

        const btn = document.createElement('button');
        btn.textContent = "Remove";
        btn.onclick = () => removeItem(index);

        li.appendChild(btn);
        groceryList.appendChild(li);
    });
}