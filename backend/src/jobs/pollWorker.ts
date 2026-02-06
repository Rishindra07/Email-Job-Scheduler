import Prisma from '../config/db';
import { sendEmail } from '../services/emailService';

let polling = false;
let intervalId: NodeJS.Timeout | null = null;

export const startPollingPendingEmails = (intervalMs = 30_000, limit = 5) => {
    if (intervalId) return;
    console.log('ℹ️ Starting DB polling worker for pending emails (Redis unavailable)');

    intervalId = setInterval(async () => {
        if (polling) return;
        polling = true;
        try {
            const now = new Date();
            const emails = await Prisma.scheduledEmail.findMany({
                where: { status: 'PENDING', scheduledAt: { lte: now } },
                orderBy: { scheduledAt: 'asc' },
                take: limit,
            });

            for (const e of emails) {
                try {
                    console.log(`PollWorker: processing email ${e.id} -> ${e.recipient}`);
                    await sendEmail(e.recipient, e.subject, e.body, 'ReachInbox PollWorker');
                    await Prisma.scheduledEmail.update({
                        where: { id: e.id },
                        data: { status: 'SENT', sentAt: new Date() },
                    });
                    console.log(`PollWorker: sent ${e.id}`);
                } catch (err) {
                    console.error(`PollWorker: failed ${e.id}`, err);
                    try {
                        await Prisma.scheduledEmail.update({ where: { id: e.id }, data: { status: 'FAILED' } });
                    } catch (updErr) {
                        console.error('PollWorker: failed to mark FAILED', updErr);
                    }
                }

                // small delay to avoid hitting SMTP rate limits
                await new Promise((r) => setTimeout(r, 1000));
            }
        } catch (err) {
            console.error('PollWorker error:', err);
        } finally {
            polling = false;
        }
    }, intervalMs);
};

export const stopPollingPendingEmails = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('ℹ️ Stopped DB polling worker');
    }
};
