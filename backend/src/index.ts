import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeRedis, redisAvailable } from './config/redis';
import { initializeEmailQueue } from './jobs/emailQueue';
import { initializeEmailWorker } from './jobs/emailWorker';
import { startPollingPendingEmails } from './jobs/pollWorker';
import apiRoutes from './routes/api';
import { Request, Response } from 'express';

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

// Basic health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        redis: redisAvailable ? 'connected' : 'unavailable'
    });
});

// Root route
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Email Job Scheduler API is running' });
});

// Start server
const startServer = async () => {
    try {
        // Initialize Redis (may fail, but that's ok)
        await initializeRedis();

        // Initialize job queue and worker if Redis is available
        if (redisAvailable) {
            initializeEmailQueue();
            initializeEmailWorker();
        } else {
            // Start DB polling fallback to process pending emails while Redis is unavailable
            startPollingPendingEmails(30_000, 5);
        }

        app.listen(PORT, () => {
            console.log(`\n✓ Server running on port ${PORT}`);
            console.log(`API check: http://localhost:${PORT}/api/health`);
            if (!redisAvailable) {
                console.log('⚠️  Running without Redis - scheduled emails will not auto-process');
                console.log('   Install Redis 5.0+ to enable email job queue\n');
            }
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
