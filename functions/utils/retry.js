// Exponential backoff with jittered reset cap.
// Limits retry window; server timeouts inside each attempt still fire.

const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

export async function withRetry(fn, { attempts = MAX_ATTEMPTS, label } = {}) {
  let lastErr = null;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn(i);
    } catch (err) {
      lastErr = err;
      if (i < attempts) {
        const delay = Math.min(BASE_DELAY_MS * Math.pow(2, i - 1), MAX_DELAY_MS);
        console.warn(`[retry] ${label || fn.name} attempt ${i} failed: ${err.message}; retrying in ${delay}ms`);
        await sleep(delay);
      }
    }
  }
  throw lastErr;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
