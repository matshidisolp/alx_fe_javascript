// ✅ 1. Required array
let quotes = [
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" }
];

// ✅ 2. DOM selections
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");

// ✅ 3. Required function: displayRandomQuote
function displayRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  quoteDisplay.textContent = `"${randomQuote.text}" — [${randomQuote.category}]`;
}

// ✅ 4. Required function: addQuote
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (quoteText === "" || quoteCategory === "") {
    alert("Please enter both quote and category.");
    return;
  }

  const newQuote = { text: quoteText, category: quoteCategory };
  quotes.push(newQuote);
  updateCategoryDropdown(quoteCategory);

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("New quote added!");
}

// ✅ 5. Utility function
function updateCategoryDropdown(newCategory) {
  const exists = Array.from(categorySelect.options).some(option => option.value.toLowerCase() === newCategory.toLowerCase());

  if (!exists) {
    const newOption = document.createElement("option");
    newOption.value = newCategory;
    newOption.textContent = newCategory;
    categorySelect.appendChild(newOption);
  }
}

// ✅ 6. Required event listener
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);

