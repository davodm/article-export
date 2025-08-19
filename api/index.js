import Humanoid from 'humanoid-js';
import { extractFromHtml } from '@extractus/article-extractor';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

/**
 * Generate SHA1 hash for URL caching
 * @param {string} data - URL to hash
 * @returns {string} SHA1 hash
 */
function sha1(data) {
  return crypto.createHash('sha1').update(data, 'utf8').digest('hex');
}

/**
 * Validate request body
 * @param {Object} body - Request body
 * @returns {Object} Validation result
 */
function validateRequest(body) {
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      error: 'Request body is required and must be an object',
    };
  }

  if (!body.url || typeof body.url !== 'string') {
    return { valid: false, error: 'URL is required and must be a string' };
  }

  try {
    new URL(body.url);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  if (!body.key || typeof body.key !== 'string') {
    return {
      valid: false,
      error: 'Secret key is required and must be a string',
    };
  }

  return { valid: true };
}

/**
 * Validate secret key
 * @param {string} key - Provided secret key
 * @returns {boolean} Whether key is valid
 */
function validateSecretKey(key) {
  const secretKeys =
    process.env.SECRET_KEY?.split(',').map((k) => k.trim()) || [];
  return secretKeys.includes(key);
}

/**
 * Initialize Redis client
 * @returns {Redis} Redis instance
 */
function initRedis() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    throw new Error('Redis configuration is missing');
  }

  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * Fetch article content using Humanoid
 * @param {string} url - URL to fetch
 * @returns {Object} Response object
 */
async function fetchArticleContent(url) {
  const humanoid = new Humanoid(true, 0);
  const response = await humanoid.get(url);

  if (![200, 201].includes(response.statusCode)) {
    throw new Error(
      `URL is not accessible with status code ${response.statusCode}`
    );
  }

  return response;
}

/**
 * Extract article data from HTML
 * @param {string} html - HTML content
 * @param {string} url - Source URL
 * @returns {Object} Extracted article data
 */
async function extractArticleData(html, url) {
  const article = await extractFromHtml(html, url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    },
  });

  if (!article) {
    throw new Error('Could not extract article content from the provided URL');
  }

  return article;
}

/**
 * Cache article data in Redis
 * @param {Redis} redis - Redis instance
 * @param {string} hash - Cache key hash
 * @param {Object} article - Article data to cache
 * @param {number} cacheDays - Cache duration in days
 */
async function cacheArticleData(redis, hash, article, cacheDays) {
  const cacheSeconds = 3600 * 24 * parseInt(cacheDays || 10);

  const pipeline = redis.pipeline();
  await pipeline.hmset(hash, article).expire(hash, cacheSeconds).exec();
}

/**
 * Serverless function to provide parsed article data from a URL
 * @param {Object} request - HTTP request object
 * @param {Object} response - HTTP response object
 * @returns {Object} JSON response
 */
export default async function handler(request, response) {
  const startTime = Date.now();

  try {
    // Set CORS headers
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (request.method === 'OPTIONS') {
      return response.status(200).end();
    }

    // Only allow POST method
    if (request.method !== 'POST') {
      return response.status(405).json({
        status: -1,
        error: 'Method not allowed. Use POST method.',
        timestamp: new Date().toISOString(),
      });
    }

    // Validate request body
    const validation = validateRequest(request.body);
    if (!validation.valid) {
      return response.status(400).json({
        status: -1,
        error: validation.error,
        timestamp: new Date().toISOString(),
      });
    }

    // Validate secret key
    if (!validateSecretKey(request.body.key)) {
      return response.status(401).json({
        status: -1,
        error: 'Invalid secret key',
        timestamp: new Date().toISOString(),
      });
    }

    // Initialize Redis
    const redis = initRedis();

    // Generate cache hash
    const hash = sha1(request.body.url);

    // Try to get cached article
    let article = await redis.hgetall(hash);

    // If no cache, fetch and process the article
    if (!article || Object.keys(article).length === 0) {
      console.log(`Fetching article from: ${request.body.url}`);

      // Fetch content using Humanoid
      const response = await fetchArticleContent(request.body.url);

      // Extract article data
      article = await extractArticleData(response.body, request.body.url);

      // Cache the article data
      await cacheArticleData(
        redis,
        hash,
        article,
        process.env.REDIS_CACHE_DAYS
      );

      console.log(`Article cached successfully for: ${request.body.url}`);
    } else {
      console.log(`Article served from cache: ${request.body.url}`);
    }

    const processingTime = Date.now() - startTime;

    // Return successful response
    return response.status(200).json({
      status: 0,
      article: article,
      cached: Object.keys(article).length > 0,
      processingTime: `${processingTime}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing request:', error);

    const errorResponse = {
      status: -1,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString(),
    };

    // Don't expose internal errors in production
    if (
      process.env.NODE_ENV === 'production' &&
      error.message.includes('Redis')
    ) {
      errorResponse.error = 'Service temporarily unavailable';
    }

    return response.status(500).json(errorResponse);
  }
}
