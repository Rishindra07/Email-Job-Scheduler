import { Router } from 'express';
import { scheduleEmail, getScheduledEmails, getSentEmails } from '../controllers/emailController';
import { googleLogin } from '../controllers/authController';
import { signup, login } from '../controllers/authEmailController';

const router = Router();

// Auth
router.post('/auth/login', login); // email/password login
router.post('/auth/signup', signup);
router.post('/auth/google', googleLogin);

// Emails
router.post('/schedule-email', scheduleEmail);
router.get('/scheduled-emails', getScheduledEmails);
router.get('/sent-emails', getSentEmails);

export default router;
