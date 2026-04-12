import { getRedisClient, isRedisConnected } from '../config/redis.js';

class PubSub {
  constructor() {
    this.publisher = null;
    this.subscriber = null;
    this.isConnected = false;
  }

  async init() {
    try {
      this.publisher = getRedisClient();
      this.subscriber = getRedisClient().duplicate();
      await this.subscriber.connect();
      this.isConnected = true;
    } catch (error) {
      console.warn('Redis pub/sub not available:', error.message);
      this.isConnected = false;
    }
  }

  async publish(channel, message) {
    if (!this.isConnected) return false;
    try {
      await this.publisher.publish(channel, JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Pub/sub publish error:', error.message);
      return false;
    }
  }

  async subscribe(channel, callback) {
    if (!this.isConnected) return false;
    try {
      await this.subscriber.subscribe(channel, (message) => {
        try {
          const data = JSON.parse(message);
          callback(data);
        } catch (error) {
          console.error('Error parsing pub/sub message:', error.message);
        }
      });
      return true;
    } catch (error) {
      console.error('Pub/sub subscribe error:', error.message);
      return false;
    }
  }

  async unsubscribe(channel) {
    if (!this.isConnected) return false;
    try {
      await this.subscriber.unsubscribe(channel);
      return true;
    } catch (error) {
      console.error('Pub/sub unsubscribe error:', error.message);
      return false;
    }
  }
}

const pubsub = new PubSub();
export default pubsub;