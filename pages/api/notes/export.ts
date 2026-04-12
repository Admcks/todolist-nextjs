import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).send("Unauthorized");

    const userId = session.user.id;
    const { id } = req.query; // Check if user wants ALL or just ONE note

    const notes = await prisma.note.findMany({
        where: {
            userId: userId,
            ...(id ? { id: Number(id) } : {}) // Filter by ID only if provided
        },
        select: { title: true, content: true, createdAt: true, updatedAt: true }
    });

    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const fileName = id ? `note-${id}-${date}.json` : `notes-export-${date}.json`;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    return res.send(JSON.stringify(notes, null, 2));
}