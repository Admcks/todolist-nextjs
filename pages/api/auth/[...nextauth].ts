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
                if (!credentials?.name || !credentials.password) {
                    throw new Error("Missing username or password");
                }

                const user = await prisma.user.findUnique({
                    where: { name: credentials.name }
                });

                if (!user) {
                    throw new Error("No user found with that name");
                }

                const isValid = await verifyPassword(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id.toString(),
                    name: user.name
                };
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async session({ session, token }) {
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
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);