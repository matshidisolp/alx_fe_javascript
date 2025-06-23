let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Success is not final, failure is not fatal.", category: "Motivation" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" },
  { text: "Do one thing every day that scares you.", category: "Inspiration" }
];

const savedFilter = localStorage.getItem("selectedCategory") || "all";

document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  document.getElementById("categoryFilter").value = savedFilter;
  displayFilteredQuote();
});

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const categorySelect = document.getElementById("categoryFilter");
  categorySelect.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  displayFilteredQuote();
}

function displayFilteredQuote() {
  const selected = document.getElementById("categoryFilter").value;
  let filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  document.getElementById("quoteDisplay").textContent = `"${quote.text}" — ${quote.category}`;
  sessionStorage.setItem("lastQuote", quote.text);
}

document.getElementById("newQuote").addEventListener("click", displayFilteredQuote);

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    alert("Quote added!");
  } else {
    alert("Please enter both a quote and a category.");
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const imported = JSON.parse(e.target.result);
    quotes.push(...imported);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  reader.readAsText(event.target.files[0]);
}

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------
// 🛰️ Task 3: Server Sync + Conflict Resolution
// ---------------------------

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Sync every 30 seconds
setInterval(syncWithServer, 30000); // every 30s

async function syncWithServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Simulate quote format: title = text, body = category
    const serverQuotes = serverData.slice(0, 10).map(item => ({
      text: item.title,
      category: item.body.slice(0, 20) || "General"
    }));

    let newQuotesAdded = 0;

    serverQuotes.forEach(serverQuote => {
      const existsLocally = quotes.some(
        local => local.text === serverQuote.text
      );
      if (!existsLocally) {
        quotes.push(serverQuote);
        newQuotesAdded++;
      }
    });

    if (newQuotesAdded > 0) {
      saveQuotes();
      populateCategories();
      notifyUser(`${newQuotesAdded} new quote(s) synced from server.`);
    }
  } catch (error) {
    console.error("Failed to sync with server:", error);
    notifyUser("⚠️ Could not sync with server. Check your connection.");
  }
}

function notifyUser(message) {
  let notify = document.getElementById("syncNotification");
  notify.textContent = message;
  notify.style.display = "block";
  setTimeout(() => {
    notify.style.display = "none";
  }, 5000);
}

