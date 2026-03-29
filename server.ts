import express from "express";
import cors from "cors";
import axios from "axios";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Proxy route for stations.json to bypass CORS
  app.get("/api/proxy/stations", async (req, res) => {
    const maxRetries = 3;
    let lastError: any = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch("https://carburants.clnf.fr/stations.json", {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(30000) // 30s timeout
        });

        if (response.ok) {
          const data = await response.json();
          return res.json(data);
        }

        console.warn(`Upstream returned ${response.status} (attempt ${i + 1}/${maxRetries})`);
        lastError = new Error(`Upstream server returned ${response.status}`);
        
        // Wait before retrying (exponential backoff)
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      } catch (error: any) {
        console.error(`Proxy error (attempt ${i + 1}/${maxRetries}):`, error.message);
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }

    res.status(500).json({ error: "Failed to fetch stations.json via proxy after retries", details: lastError?.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
