
========== public/script.js ==========


const quoteElement = document.getElementById("quote");
const authorElement = document.getElementById("author");
const messageElement = document.getElementById("message");

let currentQuote = "";
let currentAuthor = "";

// Fetch random quote
async function getQuote() {
  try {
    messageElement.textContent = "Loading...";

    const response = await fetch("/api/quote");
    const data = await response.json();

    currentQuote = data.quote;
    currentAuthor = data.author;

    quoteElement.textContent = `"${currentQuote}"`;
    authorElement.textContent = `— ${currentAuthor}`;

    messageElement.textContent = "";
  } catch (error) {
    messageElement.textContent = "Could not load quote.";
  }
}

// Save favorite
async function saveFavorite() {
  if (!currentQuote) {
    messageElement.textContent = "Please get a quote first.";
    return;
  }

  const response = await fetch("/api/favorites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      quote: currentQuote,
      author: currentAuthor
    })
  });

  const data = await response.json();

  messageElement.textContent = data.message || data.error;

  loadFavorites();
}

// Load favorites
async function loadFavorites() {
  const response = await fetch("/api/favorites");
  const favorites = await response.json();

  const list = document.getElementById("favoritesList");

  if (favorites.length === 0) {
    list.innerHTML = "<p>No favorite quotes yet.</p>";
    return;
  }

  list.innerHTML = "";

  favorites.forEach(item => {
    const div = document.createElement("div");
    div.className = "favorite-item";

    div.innerHTML = `
      <div class="favorite-quote">"${item.quote}"</div>
      <div class="favorite-author">— ${item.author}</div>
      <button class="delete-btn" onclick="deleteFavorite(${item.id})">
        Delete
      </button>
      <button class="copy-history-btn"
        onclick="copyText('${escapeQuote(item.quote)}')">
        Copy
      </button>
    `;

    list.appendChild(div);
  });
}

// Delete favorite
async function deleteFavorite(id) {
  await fetch(`/api/favorites/${id}`, {
    method: "DELETE"
  });

  loadFavorites();
}

// Copy quote
async function copyText(text) {
  await navigator.clipboard.writeText(text);
  messageElement.textContent = "Quote copied!";
}

function escapeQuote(text) {
  return text.replace(/'/g, "\\'");
}

document.getElementById("newQuote").addEventListener("click", getQuote);

document.getElementById("favorite").addEventListener("click", saveFavorite);

document.getElementById("copy").addEventListener("click", () => {
  if (!currentQuote) {
    messageElement.textContent = "Please get a quote first.";
    return;
  }

  copyText(`"${currentQuote}" — ${currentAuthor}`);
});

loadFavorites();
getQuote();

