// Store all video items from videos.json.
let allVideos = [];

// Store all watchlist data from watchlist.json.
let watchlistData = {};

// Store all progress data from progress.json.
let progressData = {};

// Get the current logged-in username.
function getCurrentUser() {
  return localStorage.getItem("user");
}

// Read the current text typed in the search box.
function getSearchText() {
  const searchInput = document.getElementById("searchInput");
  return searchInput ? searchInput.value.trim().toLowerCase() : "";
}

// Get the watchlist ids for the current user.
function getUserWatchlistIds() {
  const user = getCurrentUser();
  const ids = watchlistData[user];
  return Array.isArray(ids) ? ids : [];
}

// Turn saved video progress into a percentage.
function getProgressPercent(videoId) {
  const user = getCurrentUser();
  const userProgress = progressData[user];

  // If there is no saved progress, return 0.
  if (!userProgress || !userProgress[videoId] || !userProgress[videoId].duration) {
    return 0;
  }

  // Divide current time by full duration and convert it to percent.
  return Math.min((userProgress[videoId].currentTime / userProgress[videoId].duration) * 100, 100);
}

// Load videos, watchlist, and progress from the backend.
async function loadAppData() {
  const videos = await readJsonFile("videos.json");
  const watchlist = await readJsonFile("watchlist.json");
  const progress = await readJsonFile("progress.json");

  allVideos = Array.isArray(videos) ? videos : [];
  watchlistData = watchlist && typeof watchlist === "object" ? watchlist : {};
  progressData = progress && typeof progress === "object" ? progress : {};
}

// Add or remove one video from the current user's watchlist.
async function toggleWatchlist(videoId) {
  const user = getCurrentUser();
  const ids = getUserWatchlistIds().slice();
  const index = ids.indexOf(videoId);

  // If the id is not in the list, add it.
  if (index === -1) {
    ids.push(videoId);
  } else {
    // Otherwise remove it.
    ids.splice(index, 1);
  }

  // Save the changed list under the current user's name.
  watchlistData[user] = ids;
  await writeJsonFile("watchlist.json", watchlistData);
}

// Open the player page for one video.
function openPlayer(videoId) {
  window.location.href = "player.html?id=" + videoId;
}

// Show one simple hero banner at the top of the page.
function renderHero(videoList) {
  const heroBanner = document.getElementById("heroBanner");
  const heroTitle = document.getElementById("heroTitle");
  const heroMeta = document.getElementById("heroMeta");
  const heroPlayButton = document.getElementById("heroPlayBtn");
  const heroVideo = videoList[0];

  // If there is no hero video, show empty text.
  if (!heroVideo) {
    heroTitle.textContent = "No videos available";
    heroMeta.textContent = "Add videos to videos.json to show content here.";
    return;
  }

  // Set the hero background image.
  heroBanner.style.backgroundImage =
    "linear-gradient(90deg, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.65) 42%, rgba(0, 0, 0, 0.15) 100%), url('" +
    heroVideo.thumbnail +
    "')";

  // Make the image cover the full hero area.
  heroBanner.style.backgroundSize = "cover";

  // Keep the image centered.
  heroBanner.style.backgroundPosition = "center";

  // Show the selected video's title.
  heroTitle.textContent = heroVideo.title;

  // Show a small line of information under the title.
  heroMeta.textContent = heroVideo.category + " • Stream locally in aha";

  // Make the Play button open the selected video.
  heroPlayButton.onclick = function () {
    openPlayer(heroVideo.id);
  };
}

// Create a simple empty-state box.
function createEmptyState(message) {
  const box = document.createElement("div");
  box.className = "empty-box";
  box.textContent = message;
  return box;
}

// Create one video card for the home page rows.
function createVideoCard(video) {
  const watchlistIds = getUserWatchlistIds();
  const inWatchlist = watchlistIds.indexOf(video.id) !== -1;
  const progressPercent = getProgressPercent(video.id);
  const card = document.createElement("div");

  // Give the card its base style.
  card.className = "video-card";

  // Build the card HTML.
  card.innerHTML =
    '<div class="thumb-wrapper">' +
      '<img src="' + video.thumbnail + '" alt="' + video.title + '">' +
      '<div class="play-overlay">&#9658;</div>' +
    "</div>" +
    '<div class="card-content">' +
      "<h3>" + video.title + "</h3>" +
      "<p>" + video.category + "</p>" +
      (progressPercent > 0
        ? '<div class="progress-track"><div class="progress-fill" style="width: ' + progressPercent + '%;"></div></div>'
        : "") +
      '<button class="watchlist-btn">' + (inWatchlist ? "Remove from Watchlist" : "Add to Watchlist") + "</button>" +
    "</div>";

  // Open the player when the card is clicked.
  card.addEventListener("click", function () {
    openPlayer(video.id);
  });

  // Stop the card click when the watchlist button is clicked.
  card.querySelector(".watchlist-btn").addEventListener("click", async function (event) {
    event.stopPropagation();
    await toggleWatchlist(video.id);
    await renderApp(getSearchText());
  });

  return card;
}

// Fill one row section with cards.
function renderVideoSection(sectionId, videos, emptyMessage) {
  const section = document.getElementById(sectionId);

  // Remove old content first.
  section.innerHTML = "";

  // If there are no videos, show an empty message.
  if (videos.length === 0) {
    section.classList.add("empty-row");
    section.appendChild(createEmptyState(emptyMessage));
    return;
  }

  // Remove the empty-row style if we have videos.
  section.classList.remove("empty-row");

  // Add one card for each video.
  videos.forEach(function (video) {
    section.appendChild(createVideoCard(video));
  });
}

// Render the full home page.
async function renderApp(searchText) {
  // Load fresh data from the backend.
  await loadAppData();

  // Prepare the search text.
  const text = (searchText || "").trim().toLowerCase();

  // Keep only videos whose title matches the search text.
  const visibleVideos = allVideos.filter(function (video) {
    return text === "" || video.title.toLowerCase().includes(text);
  });

  // Get helper data for the current user.
  const watchlistIds = getUserWatchlistIds();
  const userProgress = progressData[getCurrentUser()] || {};

  // Use search results for the hero, or all videos if search has no match.
  const heroVideos = visibleVideos.length > 0 ? visibleVideos : allVideos;

  // Videos with saved progress go to Continue Watching.
  const continueVideos = visibleVideos.filter(function (video) {
    return userProgress[video.id] && userProgress[video.id].currentTime > 0;
  });

  // Videos in the user's watchlist go to My Watchlist.
  const watchlistVideos = visibleVideos.filter(function (video) {
    return watchlistIds.indexOf(video.id) !== -1;
  });

  // Filter movies.
  const movies = visibleVideos.filter(function (video) {
    return video.category === "Movies";
  });

  // Filter shows.
  const shows = visibleVideos.filter(function (video) {
    return video.category === "Shows";
  });

  // Draw all page sections.
  renderHero(heroVideos);
  renderVideoSection("continueWatching", continueVideos, "No saved progress yet.");
  renderVideoSection("watchlistSection", watchlistVideos, "Your watchlist is empty.");
  renderVideoSection("moviesSection", movies, "No movies found.");
  renderVideoSection("showsSection", shows, "No shows found.");
}

// Run this code after the page finishes loading.
document.addEventListener("DOMContentLoaded", async function () {
  // If no user is logged in, go back to login.
  if (!getCurrentUser()) {
    window.location.href = "login.html";
    return;
  }

  // Show the current username in the top bar.
  document.getElementById("welcomeUser").textContent = "Hi, " + getCurrentUser();

  // Re-render the page when the user types in search.
  document.getElementById("searchInput").addEventListener("input", function () {
    renderApp(getSearchText());
  });

  // Render the page for the first time.
  await renderApp("");
});
