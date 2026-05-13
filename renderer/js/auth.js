// Read the saved username from browser storage.
function getUser() {
  return localStorage.getItem("user");
}

// Save the username in browser storage.
function setUser(username) {
  localStorage.setItem("user", username);
}

// Show a small message below the form.
function showMessage(text, isError) {
  // Find the message area in login.html.
  const message = document.getElementById("authMessage");

  // Stop if this page does not have that element.
  if (!message) {
    return;
  }

  // Put the message text on the page.
  message.textContent = text;

  // Use red for errors and green for success.
  message.style.color = isError ? "#ff8f8f" : "#7ee787";
}

// Read the username and password fields.
function getFormData() {
  return {
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value.trim()
  };
}

// Load users.json from the backend.
async function getUsers() {
  // Ask the server for users.json.
  const users = await readJsonFile("users.json");

  // If the result is not a proper array, use an empty array.
  return Array.isArray(users) ? users : [];
}

// Log the user in.
async function handleLogin() {
  // Read the form values.
  const form = getFormData();

  // Stop if the user left any field empty.
  if (!form.username || !form.password) {
    alert("Please enter username and password.");
    return;
  }

  // Load the saved users list.
  const users = await getUsers();

  // Find the user whose username and password match.
  const match = users.find(function (user) {
    return user.username === form.username && user.password === form.password;
  });

  // Show an error if no matching user was found.
  if (!match) {
    alert("Login failed. Username or password is incorrect.");
    showMessage("Login failed. Please check your details.", true);
    return;
  }

  // Save the username in browser storage.
  setUser(form.username);

  // Move to the home page.
  window.location.href = "index.html";
}

// Create a new user account.
async function handleSignup() {
  // Read the form values.
  const form = getFormData();

  // Stop if the user left any field empty.
  if (!form.username || !form.password) {
    alert("Please enter username and password.");
    return;
  }

  // Stop if the password is too short.
  if (form.password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return;
  }

  // Load the saved users list.
  const users = await getUsers();

  // Check if this username already exists.
  const exists = users.find(function (user) {
    return user.username === form.username;
  });

  // Show an error if the username is already taken.
  if (exists) {
    alert("This username already exists.");
    showMessage("Choose a different username.", true);
    return;
  }

  // Add the new user to the users array.
  users.push({
    username: form.username,
    password: form.password
  });

  // Save the updated users array.
  await writeJsonFile("users.json", users);

  // Save the username in browser storage.
  setUser(form.username);

  // Move to the home page.
  window.location.href = "index.html";
}

// Remove the saved username and go back to login.
function logout() {
  // Delete the saved username.
  localStorage.removeItem("user");

  // Move back to the login page.
  window.location.href = "login.html";
}

// Stop users from opening the wrong page.
function checkSession() {
  // Read the saved username.
  const user = getUser();

  // Read the current page path.
  const page = window.location.pathname;

  // If someone opens the home page without logging in, send them to login.
  if (page.endsWith("index.html") && !user) {
    window.location.href = "login.html";
  }

  // If someone is already logged in and opens login, send them to home.
  if (page.endsWith("login.html") && user) {
    window.location.href = "index.html";
  }
}

// Connect the page buttons after the HTML finishes loading.
document.addEventListener("DOMContentLoaded", function () {
  // Make sure the user is on the correct page.
  checkSession();

  // Find the buttons on the page.
  const loginButton = document.getElementById("loginBtn");
  const signupButton = document.getElementById("signupBtn");
  const logoutButton = document.getElementById("logoutBtn");

  // If a login button exists, make it run the login function.
  if (loginButton) {
    loginButton.addEventListener("click", handleLogin);
  }

  // If a signup button exists, make it run the signup function.
  if (signupButton) {
    signupButton.addEventListener("click", handleSignup);
  }

  // If a logout button exists, make it run the logout function.
  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }
});
