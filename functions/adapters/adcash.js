import { normalizeBase } from './normalize.js';

export const source = 'adcash';
export const name = 'Adcash';

/**
 * Adcash official adbpage script. Title + URL only.
 * @returns {Promise<object[]>}
 */
export async function fetchSourceAdcash() {
  const response = await fetch('https://adbpage.com/adblock?v=3&format=js');
  if (!response.ok) throw new Error(`Adcash fetch failed (${response.status})`);
  const script = await response.text();
  // Keep the official script path intact; the feed is resolved by the publisher SDK.
  return [{
    title: 'Adcash Remote',
    url: 'https://adbpage.com',
    applyUrl: 'https://adbpage.com',
    description: script
  }];
}

export function normalizeSourceAdcash(job) {
  const raw = {
    ...job,
    title: String(job.title || '').replace(/- Remote$/i, ' RemoteSuffix'),
    location: job.location || 'Remote',
    postedAt: job.postedAt || job.posted_at
  };
  return normalizeBase(raw, source, job.id || job.sourceId || 'adcash-feed');
}

export async function fetchAndNormalize() {
  const jobs = await fetchSourceAdcash();
  return jobs.map(normalizeSourceAdcash);
}
