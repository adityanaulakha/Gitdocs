import { getRedisClient, isRedisConnected } from '../config/redis.js';

class RateLimiter {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async init() {
    try {
      this.client = getRedisClient();
      this.isConnected = true;
    } catch (error) {
      console.warn('Redis rate limiter not available:', error.message);
      this.isConnected = false;
    }
  }

  async isRateLimited(key, maxRequests = 100, windowSeconds = 60) {
    if (!this.isConnected) return false; // Allow requests if Redis is not available

    try {
      const now = Date.now();
      const windowStart = now - (windowSeconds * 1000);

      // Use Redis sorted set to track requests
      const score = now;
      const member = `${key}:${now}`;

      // Add current request
      await this.client.zAdd(`ratelimit:${key}`, { score, value: member });

      // Remove old requests outside the window
      await this.client.zRemRangeByScore(`ratelimit:${key}`, 0, windowStart);

      // Count requests in current window
      const requestCount = await this.client.zCard(`ratelimit:${key}`);

      // Set expiration on the key to clean up automatically
      await this.client.expire(`ratelimit:${key}`, windowSeconds * 2);

      return requestCount > maxRequests;
    } catch (error) {
      console.error('Rate limiter error:', error.message);
      return false; // Allow requests on error
    }
  }

  // Middleware function for Express
  middleware(options = {}) {
    const { maxRequests = 100, windowSeconds = 60, keyGenerator } = options;

    return async (req, res, next) => {
      const key = keyGenerator ? keyGenerator(req) : `${req.ip}:${req.path}`;

      const isLimited = await this.isRateLimited(key, maxRequests, windowSeconds);

      if (isLimited) {
        return res.status(429).json({
          message: 'Too many requests, please try again later',
          retryAfter: windowSeconds
        });
      }

      next();
    };
  }
}

const rateLimiter = new RateLimiter();
export default rateLimiter;