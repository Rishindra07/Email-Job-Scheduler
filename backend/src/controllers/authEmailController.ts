import { Request, Response } from 'express';
import Prisma from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;
        const missing: string[] = [];
        if (!email) missing.push('email');
        if (!password) missing.push('password');

        if (missing.length > 0) {
            return res.status(400).json({ error: 'Missing fields', missing });
        }

        const existing = await Prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await Prisma.user.create({
            data: {
                email,
                name,
                password: hashed
            }
        });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ user, token });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = await Prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ user, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};
