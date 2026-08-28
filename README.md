# YT-Audio (SonicConvert Engine)

A high-fidelity YouTube-to-MP3 converter and streaming web application. This project features a full-stack architecture that fetches video metadata, extracts the highest quality audio, converts it to 320kbps MP3, and provides an ultra-modern, SoundCloud-inspired web player to preview the track before downloading.

## Features

* **High-Quality Extraction:** Utilizes `yt-dlp` and `ffmpeg` on the backend to guarantee pristine 320kbps audio conversion.
* **Immersive Audio Player:** A custom-built React audio player featuring a simulated waveform scrub bar, volume controls, play/pause toggles, and fetched YouTube thumbnail integration.
* **"Artistic Flair" Design:** A premium, dark-themed UI featuring glassmorphism (backdrop blurs), neon cyan and purple gradient accents, and dynamic loading states.
* **Robust Backend:** An Express server handling concurrent downloads, providing range-based streaming to the frontend player, and serving direct file downloads.

## Tech Stack

* **Frontend:** React 19, Tailwind CSS v4, Lucide React (Icons), Vite
* **Backend:** Node.js, Express.js
* **Core Tools:** 
  * `yt-dlp` (Direct binary execution for YouTube extraction)
  * `ffmpeg` (Audio processing and format conversion)

## Architecture

* **`/server.ts`**: The Express backend entry point. It defines the REST API and manages the execution of `yt-dlp` child processes, file system storage (in `/downloads`), and stream/download handling.
* **`/src/App.tsx`**: The main React Single Page Application (SPA). Manages UI state, backend communication, and custom HTML5 audio player controls.

## API Endpoints

* `POST /api/convert`: Accepts a JSON payload `{ "url": "https://youtube.com/..." }`. Downloads the audio, converts it, and returns the track metadata (title, author, thumbnail, and stream URL).
* `GET /api/stream/:videoId`: Serves the downloaded `.mp3` file with HTTP Range support for seamless seeking in the web player.
* `GET /api/download/:videoId`: Prompts a direct `Content-Disposition: attachment` file download to the user's device.

## Local Development

### Prerequisites
1. Node.js (v18+)
2. `ffmpeg` installed and accessible in your system's PATH.
3. `yt-dlp` binary downloaded and placed in the project root (or accessible in PATH).

### Setup
1. Clone the repository.
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the development server (runs both Vite and Express via `tsx`):
   ```bash
   npm run dev
   ```
4. Access the app at `http://localhost:3000`.

### Production Build
To build the React frontend and compile the Express backend into a single CommonJS artifact:
```bash
npm run build
npm start
```
