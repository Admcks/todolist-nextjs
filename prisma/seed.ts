import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 1. Clean the database (optional, but keeps things tidy)
    await prisma.note.deleteMany({});
    await prisma.user.deleteMany({});

    const hashedPassword = await bcrypt.hash('demo1234', 12);

    // 2. Create the demo user
    const user = await prisma.user.create({
        data: {
            name: 'demo',
            password: hashedPassword,
        },
    });

    // 3. Create some demo notes (using BlockNote JSON format)
    await prisma.note.createMany({
        data: [
            {
                title: 'Project Goals',
                content: JSON.stringify([
                    { type: "paragraph", content: "1. Complete the Next.js project." },
                    { type: "paragraph", content: "2. Get a great grade!" }
                ]),
                userId: user.id,
            },
            {
                title: 'Meeting Notes',
                content: JSON.stringify([
                    { type: "paragraph", content: "Discussed the new database schema." }
                ]),
                userId: user.id,
            },
        ],
    });

    console.log('✅ Seeding complete!');
    console.log('User: demo | Password: demo1234');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });