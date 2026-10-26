// Concurrency control + per-source request pacing.
// Concurrency cap guards against Thundering Herd on Cloud Functions while
// still honouring cross-source rate limits. Per-source min gap avoids hammering
// upstream APIs.

const GLOBAL_CAP = process.env.GLOBAL_CONCURRENCY_CAP || 4;
const MIN_GAP_MS_DEFAULT = 5000; // 5s between requests to a given source

const heldTimers = new Map();
const active = new Set();

function clearSourceSlot(sourceKey) {
  const t = heldTimers.get(sourceKey);
  if (t) { clearTimeout(t); heldTimers.delete(sourceKey); }
}

async function releaseGlobal() {
  active.delete(releaseGlobal);
  while (active.size >= GLOBAL_CAP) {
    await new Promise(resolve => setImmediate(resolve));
  }
}

export async function acquireSourceSlot(sourceKey, minGapMs = MIN_GAP_MS_DEFAULT) {
  if (heldTimers.has(sourceKey)) {
    return sleep(minGapMs);
  }
  await releaseGlobal();
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      heldTimers.delete(sourceKey);
      resolve();
    }, minGapMs);
    heldTimers.set(sourceKey, timer);
  });
}

export function releaseSourceSlot(sourceKey) {
  clearSourceSlot(sourceKey);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
