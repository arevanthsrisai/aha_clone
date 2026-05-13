// This function asks the server for one JSON file.
async function readJsonFile(fileName) {
  try {
    // Send a GET request to the backend.
    const response = await fetch("/api/" + fileName);

    // If the server says the request failed, throw an error.
    if (!response.ok) {
      throw new Error("Read failed");
    }

    // Convert the JSON response into a JavaScript value.
    return await response.json();
  } catch (error) {
    // Show the error in the browser console.
    console.error("Error reading app data:", fileName, error);

    // Return null so the app can handle the failure safely.
    return null;
  }
}

// This function sends updated JSON data to the server.
async function writeJsonFile(fileName, data) {
  try {
    // Send a POST request with JSON data in the body.
    const response = await fetch("/api/" + fileName, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    // Return true if the server accepted the save.
    return response.ok;
  } catch (error) {
    // Show the error in the browser console.
    console.error("Error writing app data:", fileName, error);

    // Return false so the app knows the save failed.
    return false;
  }
}
