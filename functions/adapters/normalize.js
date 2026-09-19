// Normalized job model — shared across all source adapters.
// Every adapter normalizes raw source data into this shape before storing to Firestore.

/**
 * @typedef {Object} NormalizedJob
 * @property {string} id            - normalized hash ID (sha256 of source+sourceId)
 * @property {string} title
 * @property {string} company
 * @property {string} location      - e.g. "Remote — India"
 * @property {boolean} remote       - derived from location / explicit field
 * @property {string} postedAt      - ISO timestamp
 * @property {string} source        - source label (Greenhouse, LinkedIn, …)
 * @property {string} sourceId      - original source job ID
 * @property {string} url           - canonical apply URL
 * @property {string} applyUrl      - source ATS apply URL ([Apply Officially])
 * @property {string} logo          - company logo URL
 * @property {string} description   - full description (HTML)
 * @property {string[]} requirements - parsed from description
 * @property {string[]} skills       - populated by ATS Analyzer
 * @property {string[]} keywords     - matched against candidate profile
 * @property {{min:number,max:number|null}} experience - years
 * @property {string} employmentType - Full-time / Part-time / Contract…
 * @property {{currency:string,min:number,max:number}|null} salary
 * @property {string[]} tags         - curated tags
 */

import { createHash } from 'crypto';

const BASE_FIELDS = [
  'id','title','company','location','remote','postedAt','source','sourceId',
  'url','applyUrl','logo','description','requirements','skills','keywords',
  'experience','employmentType','salary','tags','createdAt'
];

/** deterministic job ID: sha256(source + sourceId) hex prefix */
export function jobId(source, sourceId) {
  return createHash('sha256')
    .update(`${source}::${sourceId}`)
    .digest('hex')
    .slice(0, 16);
}

/** de-dup source & apply URLs */
export function dedupeUrl(url, applyUrl) {
  if (!url && applyUrl) return applyUrl;
  if (url && !applyUrl) return url;
  return url || applyUrl || '';
}

/** safe date → ISO string */
export function toIsoDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/** base normalizer: map raw source fields → NormalizedJob */
export function normalizeBase(raw, source, sourceId) {
  const location = raw.location || raw.office || raw.city || 'Remote';
  const remote = String(location).toLowerCase().includes('remote')
    || String(location).toLowerCase() === 'distributed';
  return {
    id: jobId(source, sourceId),
    title: raw.title || raw.role || raw.position || 'Untitled',
    company: raw.company || raw.company_name || raw.employer || 'Unknown',
    location,
    remote,
    postedAt: toIsoDate(raw.postedAt || raw.posted_at || raw.date),
    source,
    sourceId: String(sourceId || raw.id || raw.jobId || ''),
    url: raw.url || raw.link || raw.apply_url || '',
    applyUrl: raw.applyUrl || raw.apply_url || raw.externalUrl || '',
    logo: raw.logo || raw.company_logo || '',
    description: raw.description || raw.body || raw.content || '',
    requirements: raw.requirements || raw.min_requirements || [],
    skills: raw.skills || [],
    keywords: raw.keywords || [],
    experience: raw.experience || { min: 0, max: null },
    employmentType: raw.employmentType || raw.jobType || raw.type || 'Full Time',
    salary: raw.salary || null,
    tags: raw.tags || [],
    createdAt: new Date().toISOString()
  };
}
