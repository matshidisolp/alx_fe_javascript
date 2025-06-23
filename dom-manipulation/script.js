let quotes = [];

// Load quotes from localStorage
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : [
    { text: "The only limit is your mind.", category: "Motivation" },
    { text: "Stay curious.", category: "Learning" }
  ];
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate category dropdown
function populateCategories() {
  const categorySelect = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = '';
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categorySelect.appendChild(opt);
  });
}

// Display a random quote
function displayRandomQuote() {
  const category = document.getElementById("categoryFilter").value;
  const filtered = category === "all" ? quotes : quotes.filter(q => q.category === category);
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById("quoteDisplay").innerHTML = random ? 
    `<strong>${random.category}</strong>: ${random.text}` : 
    "No quotes in this category.";
  sessionStorage.setItem("lastViewedQuote", random ? JSON.stringify(random) : '');
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return alert("Please fill both fields.");

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  displayRandomQuote();
  postQuoteToServer(newQuote); // sync with server
}

// Create form for adding quote
function createAddQuoteForm() {
  const form = document.createElement("div");
  form.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
  document.body.appendChild(form);
}

// Import quotes from uploaded JSON
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Export quotes to JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// === TASK 3 === Sync with Server ===
// fetchQuotesFromServer: simulate API fetch
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));
    return serverQuotes;
  } catch (err) {
    console.error("Server fetch failed", err);
    return [];
  }
}

// postQuoteToServer: simulate API post
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Failed to post quote", err);
  }
}

// syncQuotes: merge with server and update DOM + notify
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let newCount = 0;
  serverQuotes.forEach(sq => {
    if (!quotes.some(lq => lq.text === sq.text)) {
      quotes.push(sq);
      newCount++;
    }
  });
  if (newCount > 0) {
    saveQuotes();
    populateCategories();
    displayRandomQuote();
    document.getElementById("syncNotification").innerHTML = "Quotes synced with server!";
    document.getElementById("syncNotification").style.display = "block";
    setTimeout(() => {
      document.getElementById("syncNotification").style.display = "none";
    }, 4000);
  }
}

// On DOM load
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  createAddQuoteForm();
  displayRandomQuote();

  const last = sessionStorage.getItem("lastViewedQuote");
  if (last) document.getElementById("quoteDisplay").innerHTML = JSON.parse(last).text;

  setInterval(syncQuotes, 15000); // every 15 sec
});

