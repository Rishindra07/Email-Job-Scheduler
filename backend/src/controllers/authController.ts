import { Request, Response } from 'express';
import Prisma from '../config/db';

// For this assignment, we'll keep it simple. 
// In a real app, verify Google Token here.
// Keep the simple Google-based login for oauth flows
export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { email, name, googleId, avatar } = req.body;

        if (!email) {
            res.status(400).json({ error: "Email required" });
            return;
        }

        let user = await Prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await Prisma.user.create({
                data: {
                    email,
                    name,
                    googleId,
                    avatar
                }
            });
        }

        res.json(user);
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};
