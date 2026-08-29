import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import youtubedl from "youtube-dl-exec";

const execPromise = promisify(exec);

const app = express();
const PORT = 3000;

app.use(express.json());

const DOWNLOAD_DIR = path.join(process.cwd(), "downloads");
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// Endpoint to convert a YouTube video to MP3
app.post("/api/convert", async (req, res) => {
  const { url } = req.body;

  if (!url || !url.includes("youtube.com") && !url.includes("youtu.be")) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  try {
    // 1. Get video info first
    const ytDlpExecutable = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
    const ytDlpPath = path.join(process.cwd(), ytDlpExecutable);
    
    // Using raw yt-dlp to get info as youtube-dl-exec might have issues resolving the local binary sometimes
    const { stdout: infoJsonStr } = await execPromise(`${ytDlpPath} --dump-json "${url}"`);
    const info = JSON.parse(infoJsonStr);
    
    const videoId = info.id;
    const title = info.title;
    const author = info.uploader;
    const thumbnail = info.thumbnail;

    const outputPath = path.join(DOWNLOAD_DIR, `${videoId}.mp3`);

    // 2. Download and convert if not already downloaded
    if (!fs.existsSync(outputPath)) {
       // Download best audio, extract as mp3, 320k
       await execPromise(`${ytDlpPath} -f "bestaudio/best" -x --audio-format mp3 --audio-quality 320K -o "${DOWNLOAD_DIR}/%(id)s.%(ext)s" "${url}"`);
    }

    res.json({
      success: true,
      fileUrl: `/api/stream/${videoId}`,
      title,
      author,
      thumbnail
    });

  } catch (error: any) {
    console.error("Conversion error:", error);
    res.status(500).json({ error: "Failed to convert video. Ensure it is a valid, publicly accessible YouTube URL." });
  }
});

// Endpoint to serve/stream the downloaded MP3
app.get("/api/stream/:videoId", (req, res) => {
  const { videoId } = req.params;
  const filePath = path.join(DOWNLOAD_DIR, `${videoId}.mp3`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

app.get("/api/download/:videoId", (req, res) => {
    const { videoId } = req.params;
    const filePath = path.join(DOWNLOAD_DIR, `${videoId}.mp3`);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }
    
    res.download(filePath, `${videoId}.mp3`);
});


async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
