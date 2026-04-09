import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../lib/prisma";
import { verifyPassword } from "../../../lib/hash";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                name: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.name || !credentials.password) return null;

                const user = await prisma.user.findUnique({
                    where: { name: credentials.name }
                });

                if (user && await verifyPassword(credentials.password, user.password)) {
                    // Return the user object (id is a number)
                    return { id: user.id.toString(), name: user.name };
                }
                return null;
            }
        })
    ],
    session: { strategy: "jwt" },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }) {
            // token.sub is the ID we returned in authorize (as a string)
            // session.user.id was defined as a 'number' in our types/next-auth.d.ts
            if (token.sub && session.user) {
                session.user.id = Number(token.sub);
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    }
};

export default NextAuth(authOptions);