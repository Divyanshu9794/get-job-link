import { normalizeBase } from './normalize.js';

export const source = 'linkedin';
export const name = 'LinkedIn';

/**
 * LinkedIn guest search results. Placeholder until official/enterprise API approval.
 * @returns {Promise<object[]>}
 */
export async function fetchSourceLinkedin() {
  throw new Error('LinkedIn integration requires official/enterprise/partner API approval');
}

export function normalizeSourceLinkedin(job) {
  return normalizeBase(job, source, job.id || job.jobId);
}

export async function fetchAndNormalize() {
  const jobs = await fetchSourceLinkedin();
  return jobs.map(normalizeSourceLinkedin);
}
