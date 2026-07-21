import { onRequest } from "firebase-functions/v2/https";
import logger from "firebase-functions/logger";

let cachedAdcashJs = "";
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

async function getAdcashScript() {
  const now = Date.now();
  // Fetch fresh script if cache expired or empty
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