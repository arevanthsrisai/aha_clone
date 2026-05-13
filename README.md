# aha

A simple OTT-style web app inspired by Aha.

This project is built with:

- HTML
- CSS
- Vanilla JavaScript
- Node.js
- Local JSON files

It is designed as a beginner-friendly project, so the code stays simple and easy to follow.

## Features

- Login and signup using `users.json`
- Home page with Movies and Shows sections
- Search videos by title
- Watchlist support using `watchlist.json`
- Continue Watching support using `progress.json`
- Video player with resume playback
- Local video streaming using `.mp4` files

## Project Structure

```text
aha/
├── data/
│   ├── users.json
│   ├── videos.json
│   ├── watchlist.json
│   └── progress.json
├── renderer/
│   ├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── player.js
│   │   └── storage.js
│   ├── videos/
│   ├── index.html
│   ├── login.html
│   └── player.html
├── package.json
├── server.js
└── README.md
```

## How It Works

This project uses a very small Node.js server.

- `server.js` serves the HTML, CSS, JavaScript, images, and videos
- it also reads and writes JSON files inside the `data` folder
- the frontend uses `fetch()` to talk to the backend through `/api/...`

Example:

- `users.json` stores login users
- `videos.json` stores the list of videos
- `watchlist.json` stores saved watchlist items
- `progress.json` stores playback progress

## Installation

Make sure Node.js is installed first.

Then run:

```bash
npm install
```

## Run the Project

Start the server with:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

## Video Files

Put your video files inside:

```text
renderer/videos/
```

Then update `data/videos.json` like this:

```json
[
  {
    "id": 1,
    "title": "Sample Video",
    "thumbnail": "assets/thumb1.jpg",
    "video": "videos/video1.mp4",
    "category": "Movies"
  }
]
```

## Thumbnail Files

Put thumbnail images inside:

```text
renderer/assets/
```

You can use formats like:

- `.jpg`
- `.jpeg`
- `.png`
- `.svg`

## JSON Formats

### `users.json`

```json
[]
```

### `videos.json`

```json
[
  {
    "id": 1,
    "title": "Sample Video",
    "thumbnail": "assets/thumb1.jpg",
    "video": "videos/video1.mp4",
    "category": "Movies"
  }
]
```

### `watchlist.json`

```json
{}
```

### `progress.json`

```json
{}
```

## Notes

- This is a local project, not a production streaming platform
- It does not use React, Vue, Angular, or any database
- It does not use external APIs
- Video files are played locally
- Progress and watchlist are saved into local JSON files through the Node server

## Future Improvements

- Add more metadata like year, duration, and language
- Add category filters
- Improve hero/banner section
- Add better mobile layout
- Convert this into an Electron desktop app later

## License

This project is for learning and personal use.
