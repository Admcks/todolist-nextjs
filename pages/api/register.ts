import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../lib/hash';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { name, password } = req.body;

        if (!name || !password || password.length < 4) {
            return res.status(400).json({ message: 'Username and a valid password are required.' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { name },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                password: hashedPassword,
            },
        });

        return res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}