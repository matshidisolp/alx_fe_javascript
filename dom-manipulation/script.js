// ================== QUOTE DATA ==================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Success" },
  { text: "Education is the most powerful weapon which you can use to change the world.", category: "Education" }
];

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
  displayRandomQuote();
  createAddQuoteForm();
  populateCategories();
  loadLastFilter();
  syncQuotes();
});

// ================== DISPLAY QUOTES ==================
function displayRandomQuote() {
  const selectedCategory = document.getElementById("categoryFilter")?.value || "all";
  const filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>${randomQuote.text}</p><small>Category: ${randomQuote.category}</small>`;

  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// ================== ADD QUOTE ==================
function createAddQuoteForm() {
  const formDiv = document.createElement("div");
  formDiv.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
  document.body.appendChild(formDiv);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    alert("Quote added!");
  }
}

// ================== SAVE & LOAD ==================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ================== FILTERING ==================
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;

  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  select.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");

  const savedFilter = localStorage.getItem("lastFilter");
  if (savedFilter && categories.includes(savedFilter)) {
    select.value = savedFilter;
  }
}

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", selected);
  displayRandomQuote();
}

function loadLastFilter() {
  const saved = localStorage.getItem("lastFilter");
  if (saved) {
    const select = document.getElementById("categoryFilter");
    if (select) select.value = saved;
  }
}

// ================== JSON IMPORT/EXPORT ==================
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

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ================== SYNC WITH SERVER ==================
async function fetchQuotesFromServer() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await response.json();
  return data.slice(0, 10).map(item => ({
    text: item.title,
    category: item.body.substring(0, 15) || "Server"
  }));
}

async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let newQuotes = 0;

    serverQuotes.forEach(serverQuote => {
      const exists = quotes.some(local => local.text === serverQuote.text);
      if (!exists) {
        quotes.push(serverQuote);
        newQuotes++;
      }
    });

    if (newQuotes > 0) {
      saveQuotes();
      populateCategories();
      showSyncNotification(`${newQuotes} new quote(s) synced from server.`);
    }
  } catch (error) {
    showSyncNotification("⚠️ Error syncing with server.");
    console.error("Sync error:", error);
  }
}

setInterval(syncQuotes, 30000);

function syncWithServer() {
  syncQuotes();
}

// ================== SYNC NOTIFICATION ==================
function showSyncNotification(message) {
  const notify = document.getElementById("syncNotification");
  notify.textContent = message;
  notify.style.display = "block";
  setTimeout(() => {
    notify.style.display = "none";
  }, 5000);
}

