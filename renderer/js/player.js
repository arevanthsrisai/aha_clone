// Get the logged-in username.
function getUser() {
  return localStorage.getItem("user");
}

// Read the video id from the page URL.
function getVideoId() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id"));
}

// Show a message below the video.
function showMessage(text, isError) {
  // Find the message area in player.html.
  const message = document.getElementById("playerMessage");

  // Put the message text on the page.
  message.textContent = text;

  // Use red for errors and muted gray for normal messages.
  message.style.color = isError ? "#ff8f8f" : "#b8b8b8";
}

// Load one video from videos.json.
async function getVideo() {
  // Ask the server for videos.json.
  const videos = await readJsonFile("videos.json");

  // Read the video id from the URL.
  const videoId = getVideoId();

  // If the result is not a proper array, stop here.
  if (!Array.isArray(videos)) {
    return null;
  }

  // Return the video whose id matches the URL.
  return videos.find(function (video) {
    return video.id === videoId;
  });
}

// Load the full progress.json object.
async function getProgress() {
  // Ask the server for progress.json.
  const progress = await readJsonFile("progress.json");

  // If the result is not a proper object, use an empty object.
  return progress && typeof progress === "object" ? progress : {};
}

// Save the current playback time for one video.
async function saveProgress(videoId, currentTime, duration) {
  // Read the logged-in username.
  const user = getUser();

  // Load the current progress object.
  const progress = await getProgress();

  // If this user does not have a progress object yet, create one.
  if (!progress[user]) {
    progress[user] = {};
  }

  // Save the current playback time and duration.
  progress[user][videoId] = {
    currentTime: currentTime,
    duration: duration || 0
  };

  // Send the updated progress object back to the server.
  await writeJsonFile("progress.json", progress);
}

// Load the player page.
async function loadPlayer() {
  // Read the logged-in username.
  const user = getUser();

  // Find the selected video.
  const video = await getVideo();

  // Find the main player page elements.
  const title = document.getElementById("videoTitle");
  const player = document.getElementById("videoPlayer");
  const source = document.getElementById("videoSource");

  // Keep track of the last second we saved.
  let lastSavedSecond = -1;

  // If there is no logged-in user, go back to login.
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // If the video was not found, show an error.
  if (!video) {
    title.textContent = "Video not found";
    showMessage("This video was not found.", true);
    return;
  }

  // Load the whole progress object.
  const progress = await getProgress();

  // Read the saved playback time for this user and this video.
  const savedTime = progress[user] && progress[user][video.id]
    ? progress[user][video.id].currentTime || 0
    : 0;

  // Show the video title.
  title.textContent = video.title;

  // Set the video file path.
  source.src = video.video;

  // Tell the browser to reload the video source.
  player.load();

  // Show a small helpful message.
  showMessage("Playback started. Your progress will be saved automatically.", false);

  // When the video metadata is ready, resume from the old saved time.
  player.addEventListener("loadedmetadata", function () {
    if (savedTime > 0 && savedTime < player.duration) {
      player.currentTime = savedTime;
    }
  });

  // Save progress every 5 seconds while the video is playing.
  player.addEventListener("timeupdate", function () {
    const currentSecond = Math.floor(player.currentTime);

    if (currentSecond !== 0 && currentSecond % 5 === 0 && currentSecond !== lastSavedSecond) {
      lastSavedSecond = currentSecond;
      saveProgress(video.id, player.currentTime, player.duration);
    }
  });

  // Also save when the user pauses the video.
  player.addEventListener("pause", function () {
    saveProgress(video.id, player.currentTime, player.duration);
  });

  // Reset saved progress to 0 when the video ends.
  player.addEventListener("ended", function () {
    saveProgress(video.id, 0, player.duration);
  });

  // Show an error message if the video fails to play.
  player.addEventListener("error", function () {
    showMessage("Could not play this video. Add the video file inside renderer/videos.", true);
  });
}

// Connect the Back button and start the page.
document.addEventListener("DOMContentLoaded", function () {
  // Find the Back button.
  const backButton = document.getElementById("backBtn");

  // If the Back button exists, make it return to the home page.
  if (backButton) {
    backButton.addEventListener("click", function () {
      window.location.href = "index.html";
    });
  }

  // Load the player page.
  loadPlayer();
});
