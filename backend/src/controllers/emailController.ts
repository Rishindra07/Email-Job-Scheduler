import { Request, Response } from 'express';
import Prisma from '../config/db';
import { scheduleEmailJob } from '../jobs/emailQueue';

export const scheduleEmail = async (req: Request, res: Response) => {
    try {
        const { recipient, subject, body, scheduledAt, delay, senderId } = req.body;

        const missing: string[] = [];
        if (!recipient) missing.push('recipient');
        if (!subject) missing.push('subject');
        if (!body) missing.push('body');
        if (!scheduledAt) missing.push('scheduledAt');
        if (!senderId) missing.push('senderId');

        if (missing.length > 0) {
            console.warn('Bad request to /schedule-email, missing fields:', missing, 'body:', req.body);
            res.status(400).json({ error: 'Missing required fields', missing });
            return;
        }

        // Parse scheduled time
        const scheduleTime = new Date(scheduledAt);
        const now = new Date();
        const delayInMs = Math.max(0, scheduleTime.getTime() - now.getTime());

        // Save to DB
        const email = await Prisma.scheduledEmail.create({
            data: {
                recipient,
                subject,
                body,
                scheduledAt: scheduleTime,
                senderId,
                status: 'PENDING'
            }
        });

        // Add to Queue
        await scheduleEmailJob({
            scheduledEmailId: email.id,
            recipient,
            subject,
            body,
            senderName: "ReachInbox User" // In real app, fetch user name
        }, delayInMs);

        res.status(201).json(email);
    } catch (error) {
        console.error('Error scheduling email:', error);
        res.status(500).json({ error: 'Failed to schedule email', details: (error as any)?.message });
    }
};

export const getScheduledEmails = async (req: Request, res: Response) => {
    try {
        const emails = await Prisma.scheduledEmail.findMany({
            where: { status: 'PENDING' },
            orderBy: { scheduledAt: 'asc' }
        });
        res.json(emails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch scheduled emails' });
    }
};

export const getSentEmails = async (req: Request, res: Response) => {
    try {
        const emails = await Prisma.scheduledEmail.findMany({
            where: { OR: [{ status: 'SENT' }, { status: 'FAILED' }] },
            orderBy: { sentAt: 'desc' }
        });
        res.json(emails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sent emails' });
    }
};
