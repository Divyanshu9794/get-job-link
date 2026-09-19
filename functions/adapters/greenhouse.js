import { normalizeBase } from './normalize.js';

export const source = 'greenhouse';
export const name = 'Greenhouse';

/**
 * Fetch raw listings from a Greenhouse board.
 * @param {string} board Greenhouse board token
 * @returns {Promise<object[]>}
 */
export async function fetchSourceGreenhouse(board) {
  if (!board) throw new Error('Greenhouse board is required');
  const url = `https://api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'GetJobLink/1.0 (+https://get-job-link.web.app)',
      'Accept': 'application/json'
    }
  });
  if (!response.ok) throw new Error(`Greenhouse fetch failed (${response.status})`);
  const data = await response.json();
  return Array.isArray(data) ? data : (data.jobs || []);
}

/**
 * Normalize one Greenhouse job.
 * @param {object} job
 * @returns {import('./normalize.js').NormalizedJob}
 */
export function normalizeSourceGreenhouse(job) {
  const raw = {
    ...job,
    company: job.company || job.abs_company,
    location: job.location || job.office?.name || job.office?.location,
    postedAt: job.updated_at || job.created_at,
    url: job.absolute_url || job.url,
    applyUrl: job.absolute_url || job.url,
    logo: job.company_logo || job.abs_company_logo,
    description: job.content || job.description
  };
  return normalizeBase(raw, source, job.id || job.job_id);
}

export async function fetchAndNormalize(board) {
  const jobs = await fetchSourceGreenhouse(board);
  return jobs.map(normalizeSourceGreenhouse);
}
