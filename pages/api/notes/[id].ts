import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    const noteId = Number(req.query.id); // Convert URL param to number
    const userId = req.query;

    // GET: Fetch one note
    if (req.method === 'GET') {
        const note = await prisma.note.findFirst({
            where: { id: noteId, userId: userId }
        });
        return note ? res.json(note) : res.status(404).json({ message: "Not found" });
    }

    // PUT: Update a note
    if (req.method === 'PUT') {
        const { id } = req.query; // Get ID from the URL
        const { title, content } = req.body;

        if (!title) return res.status(400).json({ message: "Title is required" });

        try {
            const updated = await prisma.note.updateMany({
                // Security: Only update if the note belongs to this user
                where: {
                    id: Number(id),
                    userId: userId
                },
                data: { title, content }
            });

            // Check if anything was actually changed
            if (updated.count === 0) {
                return res.status(404).json({ message: "Note not found or unauthorized" });
            }

            return res.status(200).json({ message: "Update successful" });
        } catch (e) {
            console.error(e);
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