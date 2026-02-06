import { Queue } from 'bullmq';
import { getRedisConnection, redisAvailable } from '../config/redis';
import { EMAIL_QUEUE_NAME } from './emailWorker';

let emailQueue: Queue | null = null;

export const initializeEmailQueue = () => {
    const redisConnection = getRedisConnection();
    if (redisConnection && redisAvailable) {
        emailQueue = new Queue(EMAIL_QUEUE_NAME, {
            connection: redisConnection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: true,
            },
        });
        console.log('✓ Email queue initialized');
    } else {
        console.warn('⚠️  Email queue disabled - Redis not available');
    }
};

export const scheduleEmailJob = async (data: any, delay: number = 0) => {
    if (!emailQueue || !redisAvailable) {
        console.warn('⚠️  Queue not available - email job not added to queue');
        return null;
    }
    return await emailQueue.add('send-email', data, {
        delay,
        jobId: data.scheduledEmailId
    });
};
