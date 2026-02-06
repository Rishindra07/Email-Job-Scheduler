import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisConnection: Redis | null = null;
let redisAvailable = false;

const redisUrl = process.env.REDIS_URL;

const redisConfig = redisUrl ? redisUrl : {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => {
        if (times > 5) {
            return null;
        }
        return Math.min(times * 50, 2000);
    },
    enableReadyCheck: false,
    enableOfflineQueue: false,
};

const initializeRedis = async () => {
    try {
        const isUpstash = redisUrl?.includes('upstash.io');

        const options: any = {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            enableOfflineQueue: false,
            tls: (redisUrl?.startsWith('rediss://') || isUpstash) ? {} : undefined,
            connectTimeout: 10000,
        };

        console.log('🔄 Attempting to connect to Redis...');
        if (redisUrl) {
            const maskedUrl = redisUrl.replace(/:[^:@]+@/, ':****@');
            console.log(`📡 URL: ${maskedUrl}`);
        }

        redisConnection = typeof redisConfig === 'string'
            ? new Redis(redisConfig, options)
            : new Redis(redisConfig as any);

        redisConnection.on('error', (err) => {
            redisAvailable = false;
            console.warn('⚠️  Redis connection error:', err.message);
        });

        redisConnection.on('connect', () => {
            redisAvailable = true;
            console.log('✓ Connected to Redis');
        });

        redisConnection.on('ready', () => {
            console.log('✓ Redis is ready');
        });

        redisConnection.on('close', () => {
            redisAvailable = false;
            console.warn('⚠️  Redis connection closed');
        });

        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                if (!redisAvailable) {
                    console.warn('⚠️  Redis connection timeout - proceeding without job queue');
                    resolve(false);
                }
            }, 10000);

            redisConnection?.ping().then(() => {
                clearTimeout(timeout);
                redisAvailable = true;
                resolve(true);
            }).catch((err) => {
                clearTimeout(timeout);
                console.warn('⚠️  Redis ping failed:', err.message);
                redisAvailable = false;
                resolve(false);
            });
        });
    } catch (error: any) {
        console.warn('⚠️  Failed to initialize Redis:', error.message);
        redisAvailable = false;
        return false;
    }
};

export { initializeRedis, redisAvailable };
export const getRedisConnection = () => redisConnection;
