import { onRequest } from "firebase-functions/v2/https";
import logger from "firebase-functions/logger";
import cors from 'cors';

let cachedAdcashJs = "";
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

async function getAdcashScript() {
  const now = Date.now();
  if (!cachedAdcashJs || now - lastFetchTime > CACHE_DURATION_MS) {
    try {
      const response = await fetch("https://adbpage.com/adblock?v=3&format=js");
      if (response.ok) {
        cachedAdcashJs = await response.text();
        lastFetchTime = now;
        logger.info("Refreshed Adcash script cache");
      }
    } catch (err) {
      logger.error("Error fetching Adcash script:", err);
    }
  }
  return cachedAdcashJs;
}

export const adcashLib = onRequest({ cors: true }, async (req, res) => {
  const scriptContent = await getAdcashScript();
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  res.status(200).send(scriptContent);
});

// CORS middleware for other functions
const corsHandler = cors({ origin: true });

export const greenhouseJobs = onRequest({ cors: true }, async (req, res) => {
  corsHandler(req, res, async () => {
    const pathMatch = req.path.match(/^\/greenhouse\/([^/]+)\/jobs$/);
    const board = pathMatch ? decodeURIComponent(pathMatch[1]) : req.query.board;
    if (!board) {
      return res.status(400).json({ error: "Board parameter required" });
    }
    try {
      const url = `https://api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs`;
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Greenhouse fetch failed" });
      }
      const data = await response.json();
      res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
      res.status(200).json(data);
    } catch (err) {
      logger.error("Greenhouse proxy error:", err);
      res.status(500).json({ error: "Proxy error" });
    }
  });
});