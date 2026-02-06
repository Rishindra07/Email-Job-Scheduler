import { Worker, Job } from 'bullmq';
import { getRedisConnection, redisAvailable } from '../config/redis';
import { sendEmail } from '../services/emailService';
import Prisma from '../config/db';

export const EMAIL_QUEUE_NAME = 'email-queue';

// Rate Limiting Config
const MAX_EMAILS_PER_HOUR = process.env.MAX_EMAILS_PER_HOUR ? parseInt(process.env.MAX_EMAILS_PER_HOUR) : 100;
const MIN_DELAY_BETWEEN_EMAILS = 2000; // 2 seconds

interface EmailJobData {
    scheduledEmailId: string;
    recipient: string;
    subject: string;
    body: string;
    senderName?: string;
}

let emailWorker: Worker<EmailJobData> | null = null;

export const initializeEmailWorker = () => {
    const redisConnection = getRedisConnection();
    if (!redisConnection || !redisAvailable) {
        console.warn('⚠️  Email worker disabled - Redis not available');
        return;
    }

    emailWorker = new Worker<EmailJobData>(
        EMAIL_QUEUE_NAME,
        async (job: Job<EmailJobData>) => {
            const { scheduledEmailId, recipient, subject, body, senderName } = job.data;

            console.log(`Processing job ${job.id} for email ${scheduledEmailId}`);

            try {
                await new Promise(resolve => setTimeout(resolve, MIN_DELAY_BETWEEN_EMAILS));

                await sendEmail(recipient, subject, body, senderName);

                await Prisma.scheduledEmail.update({
                    where: { id: scheduledEmailId },
                    data: {
                        status: 'SENT',
                        sentAt: new Date()
                    }
                });

                console.log(`Job ${job.id} completed. Email sent.`);

            } catch (error) {
                console.error(`Job ${job.id} failed:`, error);

                await Prisma.scheduledEmail.update({
                    where: { id: scheduledEmailId },
                    data: { status: 'FAILED' }
                });

                throw error;
            }
        },
        {
            connection: redisConnection,
            limiter: {
                max: MAX_EMAILS_PER_HOUR,
                duration: 3600000,
            },
            concurrency: 5
        }
    );

    emailWorker.on('completed', job => {
        console.log(`${job.id} has completed!`);
    });

    emailWorker.on('failed', (job, err) => {
        console.log(`${job?.id} has failed with ${err.message}`);
    });

    console.log('✓ Email worker initialized');
};
