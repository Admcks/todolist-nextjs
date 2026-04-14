import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = session.user.id;

    if (req.method === 'GET') {
        const notes = await prisma.note.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(notes);
    }

    if (req.method === 'POST') {
        const { title, content } = req.body;

        if (!title) return res.status(400).json({ message: "Title is required" });

        const newNote = await prisma.note.create({
            data: {
                title,
                content,
                userId: userId,
            }
        });
        return res.status(201).json(newNote);
    }

    return res.status(405).json({ message: "Method not allowed" });
}

