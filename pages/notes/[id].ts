import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    const noteId = Number(req.query.id); // Convert URL param to number
    const userId = session.user.id;

    // GET: Fetch one note
    if (req.method === 'GET') {
        const note = await prisma.note.findFirst({
            where: { id: noteId, userId: userId }
        });
        return note ? res.json(note) : res.status(404).json({ message: "Not found" });
    }

    // PUT: Update a note
    if (req.method === 'PUT') {
        const { title, content } = req.body;
        if (!title) return res.status(400).json({ message: "Title is required" });

        try {
            const updated = await prisma.note.updateMany({
                where: { id: noteId, userId: userId },
                data: { title, content }
            });
            return res.json({ success: !!updated.count });
        } catch (e) {
            return res.status(500).json({ message: "Update failed" });
        }
    }

    // DELETE: Remove a note
    if (req.method === 'DELETE') {
        await prisma.note.deleteMany({
            where: { id: noteId, userId: userId }
        });
        return res.status(204).end();
    }
}