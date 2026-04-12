import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_DB = process.env.REDIS_DB || 0;

let redisClient = null;
let isConnected = false;

const connectRedis = async () => {
  try {
    if (!redisClient) {
      redisClient = createClient({
        url: REDIS_URL,
        password: REDIS_PASSWORD,
        database: REDIS_DB,
      });

      redisClient.on('error', (err) => {
        console.warn('❌ Redis connection error:', err.message);
        isConnected = false;
      });

      redisClient.on('connect', () => {
        console.log('✅ Redis connected');
        isConnected = true;
      });

      redisClient.on('disconnect', () => {
        console.log('⚠️ Redis disconnected');
        isConnected = false;
      });

      await redisClient.connect();
    }
  } catch (error) {
    console.warn('❌ Failed to connect to Redis:', error.message);
    console.log('⚠️ Application will run without Redis caching and pub/sub features');
    isConnected = false;
  }
};

const getRedisClient = () => {
  if (!redisClient || !isConnected) {
    throw new Error('Redis client not connected. Redis features will be disabled.');
  }
  return redisClient;
};

const isRedisConnected = () => isConnected;

const disconnectRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.disconnect();
      console.log('✅ Redis disconnected');
    } catch (error) {
      console.error('Error disconnecting Redis:', error.message);
    }
  }
};

export { connectRedis, getRedisClient, disconnectRedis, isRedisConnected };