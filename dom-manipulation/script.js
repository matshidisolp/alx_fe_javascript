let quotes = [];

function loadQuotes() {
  const saved = localStorage.getItem("quotes");
  if (saved) {
    quotes = JSON.parse(saved);
  } else {
    quotes = [
      { text: "The only limit is your mind.", category: "Motivation" },
      { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
      { text: "Education is the passport to the future.", category: "Education" }
    ];
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function displayRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  const category = document.getElementById("categoryFilter").value;
  const filtered = category === "all" ? quotes : quotes.filter(q => q.category === category);
  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  display.innerHTML = `<p>"${quote.text}"</p><small>Category: ${quote.category}</small>`;
  sessionStorage.setItem("lastQuote", quote.text);
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    textInput.value = "";
    categoryInput.value = "";
    populateCategories();
    alert("Quote added!");
  } else {
    alert("Please fill in both fields.");
  }
}

function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  dropdown.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && categories.includes(savedCategory)) {
    dropdown.value = savedCategory;
  }
}

function filterQuotes() {
  localStorage.setItem("selectedCategory", document.getElementById("categoryFilter").value);
  displayRandomQuote();
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON file format.");
      }
    } catch (error) {
      alert("Error reading file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
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

// ✅ TASK 3 FUNCTIONS

async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    return data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Failed to fetch quotes:", error);
    return [];
  }
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let newCount = 0;

  serverQuotes.forEach(sq => {
    const exists = quotes.some(q => q.text === sq.text);
    if (!exists) {
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

// ✅ INIT

document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  displayRandomQuote();
  setInterval(syncQuotes, 60000); // check every 60 sec
});

document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);

