// ✅ Load quotes from localStorage or use defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" }
];

// ✅ Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ✅ Show a random quote
function showRandomQuote() {
  const categorySelect = document.getElementById("categorySelect");
  const quoteDisplay = document.getElementById("quoteDisplay");

  const selectedCategory = categorySelect?.value || "all";
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes in this category.";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.innerHTML = `"${randomQuote.text}" — [${randomQuote.category}]`;

  // ✅ Store last viewed quote in sessionStorage
  sessionStorage.setItem("lastQuote", quoteDisplay.innerHTML);
}

// ✅ Add a new quote
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (quoteText === "" || quoteCategory === "") {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text: quoteText, category: quoteCategory });
  saveQuotes(); // ✅ Save to localStorage
  updateCategoryDropdown(quoteCategory);

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("New quote added!");
}

// ✅ Create quote input form
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// ✅ Update dropdown if new category is added
function updateCategoryDropdown(newCategory) {
  const categorySelect = document.getElementById("categorySelect");
  if (!categorySelect) return;

  const exists = Array.from(categorySelect.options).some(
    option => option.value.toLowerCase() === newCategory.toLowerCase()
  );

  if (!exists) {
    const newOption = document.createElement("option");
    newOption.value = newCategory;
    newOption.textContent = newCategory;
    categorySelect.appendChild(newOption);
  }
}

// ✅ Export quotes as JSON
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// ✅ Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (error) {
      alert("Error parsing file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ✅ Add controls for import/export
function createImportExportControls() {
  const container = document.createElement("div");
  container.style.marginTop = "20px";

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.addEventListener("change", importFromJsonFile);

  const exportButton = document.createElement("button");
  exportButton.textContent = "Export Quotes";
  exportButton.addEventListener("click", exportToJsonFile);

  container.appendChild(importInput);
  container.appendChild(exportButton);
  document.body.appendChild(container);
}

// ✅ On load
document.addEventListener("DOMContentLoaded", () => {
  createAddQuoteForm();
  createImportExportControls();

  // Load last quote from session storage
  const last = sessionStorage.getItem("lastQuote");
  if (last) document.getElementById("quoteDisplay").innerHTML = last;
});

// ✅ Button listener
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

