import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../lib/hash';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { name, password } = req.body;

        // 1. Basic Validation
        if (!name || !password || password.length < 4) {
            return res.status(400).json({ message: 'Username and a valid password are required.' });
        }

        // 2. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { name },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // 3. Hash the password for security
        const hashedPassword = await hashPassword(password);

        // 4. Save the user to the database
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