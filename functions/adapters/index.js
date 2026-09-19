// Adapter registry — per-view fetch, no top-level side effects.
// Each adapter exports fetchSource*() and normalizeSource*(i).

import * as greenhouse from './greenhouse.js';
import * as adcash from './adcash.js';
import * as linkedin from './linkedin.js';

export const ADAPTERS = {
  greenhouse,
  adcash,
  linkedin
};

export function getAdapter(source) {
  return ADAPTERS[source] || null;
}

export const SOURCE_NAMES = {
  greenhouse: 'Greenhouse',
  adcash: 'Adcash',
  linkedin: 'LinkedIn'
};
