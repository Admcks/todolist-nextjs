import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    await prisma.note.deleteMany({});
    await prisma.user.deleteMany({});

    const hashedPassword = await bcrypt.hash('demo', 12);

    const user = await prisma.user.create({
        data: {
            name: 'demo',
            password: hashedPassword,
        },
    });

    await prisma.note.createMany({
        data: [
            {
                title: 'Jak funguji API routy v Next.js',
                content: JSON.stringify([
                    { type: "paragraph", content: "API routy v Next.js jsou soubory ve slozce pages/api. Kazdy soubor predstavuje endpoint, ktery muze prijimat HTTP requesty." },
                    { type: "paragraph", content: "Ukazka:" },
                    { type: "paragraph", content: "export default function handler(req, res) { if (req.method === 'GET') { res.json({ message: 'Ahoj' }); } }" },
                    { type: "paragraph", content: "Vysvetleni:" },
                    { type: "paragraph", content: "Soubor funguje jako backend. Req obsahuje data z requestu a res slouzi pro odpoved. Muzeme kontrolovat metody jako GET, POST, PUT a DELETE." }
                ]),
                userId: user.id,
            },
            {
                title: 'Co je middleware v Next.js',
                content: JSON.stringify([
                    { type: "paragraph", content: "Middleware v Next.js je funkce, ktera se spusti pred zpracovanim requestu. Pouziva se napr. pro kontrolu prihlaseni nebo presmerovani." },
                    { type: "paragraph", content: "Ukazka:" },
                    { type: "paragraph", content: "import { NextResponse } from 'next/server'; export function middleware(req) { return NextResponse.next(); }" },
                    { type: "paragraph", content: "Vysvetleni:" },
                    { type: "paragraph", content: "Middleware muze zachytit request a rozhodnout, jestli ho pusti dal nebo presmeruje. Pouziva se napr. pro ochranu stranek." }
                ]),
                userId: user.id,
            },
            {
                title: 'Jak funguje Prisma',
                content: JSON.stringify([
                    { type: "paragraph", content: "Prisma je ORM knihovna, ktera umoznuje pracovat s databazi pomoci JavaScriptu." },
                    { type: "paragraph", content: "Schema: model User { id Int @id @default(autoincrement()) name String }" },
                    { type: "paragraph", content: "CRUD ukazka: const user = await prisma.user.create({ data: { name: 'Jan' } }); const users = await prisma.user.findMany(); await prisma.user.update({ where: { id: 1 }, data: { name: 'Petr' } }); await prisma.user.delete({ where: { id: 1 } });" },
                    { type: "paragraph", content: "Vysvetleni: Schema definuje strukturu databaze. Prisma pak generuje klienta, pres ktereho delame operace create, read, update a delete." }
                ]),
                userId: user.id,
            },
            {
                title: 'Jak funguje useForm hook',
                content: JSON.stringify([
                    { type: "paragraph", content: "useForm je hook z knihovny react-hook-form, ktery slouzi pro praci s formulari." },
                    { type: "paragraph", content: "Ukazka: const { register, handleSubmit } = useForm(); <form onSubmit={handleSubmit(onSubmit)}> <input {...register('name')} /> </form>" },
                    { type: "paragraph", content: "Vysvetleni: register napoji input na formular. handleSubmit zpracuje data a zavola funkci onSubmit. Je to jednodussi nez pouzivat useState pro kazde pole." }
                ]),
                userId: user.id,
            },
            {
                title: 'Co je NextAuth',
                content: JSON.stringify([
                    { type: "paragraph", content: "NextAuth je knihovna pro autentizaci v Next.js. Umoznuje prihlaseni uzivatele napriklad pres jmeno a heslo." },
                    { type: "paragraph", content: "Ukazka: import NextAuth from 'next-auth'; export default NextAuth({ providers: [] });" },
                    { type: "paragraph", content: "Vysvetleni: NextAuth resi login, session a bezpecnost. Muzeme pouzit Credentials provider pro vlastni login. Session pak pouzivame v aplikaci pro overeni uzivatele." }
                ]),
                userId: user.id,
            },
            {
                title: 'Jak se nasazuje na Vercel',
                content: JSON.stringify([
                    { type: "paragraph", content: "Vercel je platforma pro nasazeni Next.js aplikaci." },
                    { type: "paragraph", content: "Postup: 1. Nahraju projekt na GitHub, 2. Propojim repozitar s Vercel, 3. Nastavim environment variables, 4. Deploynu aplikaci." },
                    { type: "paragraph", content: "Vysvetleni: Vercel automaticky rozpozna Next.js projekt a postara se o build i hosting. Pri kazdem pushi se aplikace znovu nasadi." }
                ]),
                userId: user.id,
            }
        ],
    });

    console.log('✅ Seeding complete!');
    console.log('User: demo | Password: demo');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });