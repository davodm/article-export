import Humanoid from 'humanoid-js';
import { Impit } from 'impit';

/**
 * Fetch content using Humanoid (primary bypass method)
 * @param {string} url - URL to fetch
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Object>} Response object with statusCode and body
 */
async function fetchWithHumanoid(url, timeout = 25000) {
  const humanoid = new Humanoid(true, 0);

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Humanoid fetch timed out'));
    }, timeout);
  });

  const response = await Promise.race([humanoid.get(url), timeoutPromise]);

  if (![200, 201].includes(response.statusCode)) {
    throw new Error(`URL returned status code ${response.statusCode}`);
  }

  return {
    statusCode: response.statusCode,
    body: response.body,
    method: 'humanoid',
  };
}

/**
 * Fetch content using Impit (secondary bypass method)
 * Modern HTTP client with browser impersonation and anti-blocking features
 * @param {string} url - URL to fetch
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Object>} Response object with statusCode and body
 */
async function fetchWithImpit(url, timeout = 25000) {
  // Create Impit instance with Chrome browser emulation
  const impit = new Impit({
    browser: 'chrome',
    ignoreTlsErrors: false,
  });

  // Create timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Impit fetch timed out'));
    }, timeout);
  });

  // Race between fetch and timeout
  const response = await Promise.race([impit.fetch(url), timeoutPromise]);

  if (![200, 201].includes(response.status)) {
    throw new Error(`URL returned status code ${response.status}`);
  }

  // Get the response body as text
  const body = await response.text();

  return {
    statusCode: response.status,
    body: body,
    method: 'impit',
  };
}

/**
 * Fetch content using multiple strategies with fallback
 * @param {string} url - URL to fetch
 * @param {Object} options - Options object
 * @param {number} options.timeout - Timeout in milliseconds
 * @param {Array<string>} options.strategies - Array of strategy names to try
 * @returns {Promise<Object>} Response object with statusCode, body, and strategy used
 */
export async function fetchWithStrategies(url, options = {}) {
  const timeout = options.timeout || 25000;
  const strategies = options.strategies || ['humanoid', 'impit'];

  const fetchers = {
    humanoid: () => fetchWithHumanoid(url, timeout),
    impit: () => fetchWithImpit(url, timeout),
  };

  const errors = [];

  for (const strategyName of strategies) {
    if (!fetchers[strategyName]) {
      console.warn(`Unknown strategy: ${strategyName}`);
      continue;
    }

    try {
      console.log(`Attempting fetch with strategy: ${strategyName}`);
      const startTime = Date.now();

      const result = await fetchers[strategyName]();

      const duration = Date.now() - startTime;
      console.log(`Strategy ${strategyName} succeeded in ${duration}ms`);

      return { ...result, strategy: strategyName, duration };
    } catch (error) {
      console.warn(`Strategy ${strategyName} failed:`, error.message);
      errors.push({ strategy: strategyName, error: error.message });
      continue;
    }
  }

  throw new Error(
    `All fetch strategies failed. Errors: ${JSON.stringify(errors)}`
  );
}

/**
 * Simple fetch function that uses both strategies with automatic fallback
 * Tries humanoid first, then impit if it fails
 * @param {string} url - URL to fetch
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Object>} Response object with statusCode and body
 */
export async function fetchArticleContent(url, timeout = 25000) {
  return fetchWithStrategies(url, { timeout, strategies: ['humanoid', 'impit'] });
}

