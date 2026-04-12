import { getRedisClient, isRedisConnected } from '../config/redis.js';

class Cache {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async init() {
    try {
      this.client = getRedisClient();
      this.isConnected = true;
    } catch (error) {
      console.warn('Redis cache not available:', error.message);
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    if (!this.isConnected) return false;
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Cache del error:', error.message);
      return false;
    }
  }

  async invalidatePattern(pattern) {
    if (!this.isConnected) return false;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache invalidate pattern error:', error.message);
      return false;
    }
  }
}

const cache = new Cache();
export default cache;