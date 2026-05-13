// Load the built-in Node modules we need.
const http = require("http");
const fs = require("fs");
const path = require("path");

// Save the main folder paths.
const rendererFolder = path.join(__dirname, "renderer");
const dataFolder = path.join(__dirname, "data");

// Choose the server port.
const port = 3000;

// Return the correct content type for a file.
function getType(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".html") return "text/html";
  if (extension === ".css") return "text/css";
  if (extension === ".js") return "application/javascript";
  if (extension === ".json") return "application/json";
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".mp4") return "video/mp4";

  return "text/plain";
}

// Send a JSON response back to the browser.
function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(data));
}

// Read one JSON file from the data folder.
function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(dataFolder, name), "utf-8"));
}

// Save one JSON file into the data folder.
function writeJson(name, data) {
  fs.writeFileSync(path.join(dataFolder, name), JSON.stringify(data, null, 2), "utf-8");
}

// Read the body text from a POST request.
function readBody(request, callback) {
  let body = "";

  request.on("data", function (chunk) {
    body += chunk;
  });

  request.on("end", function () {
    callback(body);
  });
}

// Serve MP4 videos with range support so manual seeking works.
function serveVideo(request, response, filePath) {
  fs.stat(filePath, function (error, stats) {
    // Show a 404 error if the file does not exist.
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("File not found");
      return;
    }

    // Read the full file size and the browser's range request.
    const fileSize = stats.size;
    const range = request.headers.range;

    // If the browser did not ask for a range, send the whole video.
    if (!range) {
      response.writeHead(200, {
        "Content-Type": "video/mp4",
        "Content-Length": fileSize,
        "Accept-Ranges": "bytes"
      });

      fs.createReadStream(filePath).pipe(response);
      return;
    }

    // Split the requested range into start and end positions.
    const parts = range.replace("bytes=", "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    // Tell the browser we are sending only part of the file.
    response.writeHead(206, {
      "Content-Type": "video/mp4",
      "Content-Length": (end - start) + 1,
      "Content-Range": "bytes " + start + "-" + end + "/" + fileSize,
      "Accept-Ranges": "bytes"
    });

    // Stream only the requested part of the video.
    fs.createReadStream(filePath, { start: start, end: end }).pipe(response);
  });
}

// Serve any normal file from the renderer folder.
function serveFile(request, response, filePath) {
  // Use the video function for MP4 files.
  if (path.extname(filePath).toLowerCase() === ".mp4") {
    serveVideo(request, response, filePath);
    return;
  }

  // Read the file normally.
  fs.readFile(filePath, function (error, content) {
    // Show a 404 error if the file does not exist.
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("File not found");
      return;
    }

    // Send the file with the correct content type.
    response.writeHead(200, { "Content-Type": getType(filePath) });
    response.end(content);
  });
}

// Handle /api/ requests for JSON files.
function handleApi(request, response, pathname) {
  // Remove "/api/" and keep only the file name.
  const name = pathname.replace("/api/", "");

  // Only allow the app's known JSON files.
  if (!["users.json", "videos.json", "watchlist.json", "progress.json"].includes(name)) {
    sendJson(response, 404, { error: "Invalid file" });
    return;
  }

  // If the browser wants to read data, send the JSON file.
  if (request.method === "GET") {
    try {
      sendJson(response, 200, readJson(name));
    } catch (error) {
      sendJson(response, 500, { error: "Could not read file" });
    }

    return;
  }

  // If the browser wants to save data, update the JSON file.
  if (request.method === "POST") {
    readBody(request, function (body) {
      try {
        writeJson(name, JSON.parse(body));
        sendJson(response, 200, { success: true });
      } catch (error) {
        sendJson(response, 500, { error: "Could not write file" });
      }
    });

    return;
  }

  // Any other request type is not allowed.
  sendJson(response, 405, { error: "Method not allowed" });
}

// Create and start the web server.
http.createServer(function (request, response) {
  // Build a full URL object from the request.
  const url = new URL(request.url, "http://localhost:" + port);

  // Decode the path from the URL.
  const pathname = decodeURIComponent(url.pathname);

  // Send API requests to the API handler.
  if (pathname.startsWith("/api/")) {
    handleApi(request, response, pathname);
    return;
  }

  // If the path is "/", show login.html first.
  const filePath = pathname === "/" || pathname === ""
    ? path.join(rendererFolder, "login.html")
    : path.join(rendererFolder, pathname);

  // Serve the requested file.
  serveFile(request, response, filePath);
}).listen(port, function () {
  console.log("AHA server running at http://localhost:" + port);
});
