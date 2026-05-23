import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL as string, {
  password: process.env.REDIS_TOKEN,
  tls: { rejectUnauthorized: false },  // Required for Upstash
  maxRetriesPerRequest: null,           // Required for BullMQ
});

redis.on('connect', () => console.log('✅ Upstash Redis Connected'));
redis.on('error', (err) => console.error('❌ Redis Error:', err));