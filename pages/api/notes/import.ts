import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    if (req.method !== 'POST') return res.status(405).end();

    try {
        const data = req.body;
        const notesToImport = Array.isArray(data) ? data : [data];

        const createdNotes = await Promise.all(
            notesToImport.map((note: any) =>
                prisma.note.create({
                    data: {
                        title: note.title || "Imported Note",
                        content: note.content || "",
                        userId: session.user.id,
                        createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
                    }
                })
            )
        );

        return res.status(201).json({ count: createdNotes.length });
    } catch (e) {
        return res.status(400).json({ message: "Invalid JSON format" });
    }
}