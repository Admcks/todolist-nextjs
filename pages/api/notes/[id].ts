import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma"; // Using relative path for stability

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) return res.status(401).json({ message: "Unauthorized" });

    // 1. FIXED DEFINITIONS
    const { id } = req.query;          // This is the Note's ID from the URL
    const userId = Number(session.user.id); // This is the logged-in User's ID

    // GET: Fetch one note
    if (req.method === 'GET') {
        const note = await prisma.note.findFirst({
            where: {
                id: Number(id),
                userId: userId
            }
        });
        return note ? res.json(note) : res.status(404).json({ message: "Not found" });
    }

    // PUT: Update a note
    if (req.method === 'PUT') {
        const { title, content } = req.body;
        if (!title) return res.status(400).json({ message: "Title is required" });

        try {
            const updated = await prisma.note.updateMany({
                where: {
                    id: Number(id), // Correctly use the Note ID
                    userId: userId  // Correctly use the User ID
                },
                data: { title, content }
            });

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
        try {
            await prisma.note.deleteMany({
                where: {
                    id: Number(id),
                    userId: userId
                }
            });
            return res.status(204).end();
        } catch (e) {
            return res.status(500).json({ message: "Delete failed" });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}