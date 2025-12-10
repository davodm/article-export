/**
 * Health check endpoint for monitoring and deployment verification
 * @param {Object} request - HTTP request object
 * @param {Object} response - HTTP response object
 * @returns {Object} JSON response
 */
export default async function handler(request, response) {
  try {
    // Set CORS headers
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (request.method === 'OPTIONS') {
      return response.status(200).end();
    }

    // Only allow GET method
    if (request.method !== 'GET') {
      return response.status(405).json({
        status: -1,
        error: 'Method not allowed. Use GET method.',
        timestamp: new Date().toISOString(),
      });
    }

    // Check Redis connection and perform transaction test if environment variables are set
    let redisStatus = 'not_configured';
    let redisTransaction = null;
    
    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        // Test Redis connection
        await redis.ping();
        
        // Perform a transaction: write and then delete a test key
        const testKey = `health:check:${Date.now()}`;
        const testValue = JSON.stringify({
          timestamp: new Date().toISOString(),
          test: true,
        });
        
        // Write test data
        await redis.set(testKey, testValue, { ex: 60 }); // Expire in 60 seconds as safety
        
        // Read it back to verify
        const readValue = await redis.get(testKey);
        
        // Delete the test key
        await redis.del(testKey);
        
        // Verify the transaction was successful
        if (readValue === testValue) {
          redisStatus = 'connected';
          redisTransaction = 'success';
        } else {
          redisStatus = 'connected';
          redisTransaction = 'read_mismatch';
        }
      } catch (error) {
        redisStatus = 'error';
        redisTransaction = 'failed';
        console.error('Redis health check failed:', error.message);
      }
    }

    // Return health status
    return response.status(200).json({
      status: 0,
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      redis: redisStatus,
      redisTransaction: redisTransaction,
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error('Health check error:', error);

    return response.status(500).json({
      status: -1,
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
}
