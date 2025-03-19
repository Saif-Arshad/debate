import { AuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { DefaultUser } from "next-auth";
import axiosInstance from "./axios";

declare module "next-auth" {
    interface User extends DefaultUser {
        id?: string;
        userType?: string;
    }

    interface Session {
        user: {
            id?: string;
            userType?: string;
        } & DefaultUser;
    }

    interface JWT {
        id?: string;
        userType?: string;
    }
}

const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            type: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const credentialDetails = {
                        email: credentials?.email,
                        password: credentials?.password,
                    };
                    const response = await axiosInstance.post(
                        "/api/user/login",
                        credentialDetails
                    );
                    const user = response.data;
                    console.log(user.data);
                    console.log(user.data.id)
                    console.log(user.data.email)
                    console.log(user.data.name)
                    console.log(user.data.userType)
                    if (user.data) {
                        (await cookies()).set("debate-token", user.data.token, {
                            expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                            sameSite: "strict",
                            path: "/",
                        });
                        return {
                            id: user.data.id,
                            email: user.data.email,
                            name: user.data.name,
                            userType: user.data.userType,
                        };
                    } else {
                        throw new Error("Invalid Credentials");
                    }
                } catch (error: any) {
                    console.log("🚀 ~ authorize ~ error:", error.response.data.message)
                    throw new Error(error.response.data.message  || "Authorization error");
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        maxAge: 14 * 24 * 60 * 60,
        updateAge: 14 * 24 * 60 * 60,
    },
    callbacks: {
        async signIn({ account }) {
            return true;
        },
        async jwt({ token, user, account, trigger, session }) {
            if (trigger === "update" && session) {
                console.log("Session in Auth Options", session);
                return { ...token, ...session.user };
            }
            if (account && user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.userType = user.userType;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token.id as string,
                    email: token.email as string,
                    name: token.name as string,
                    userType: token.userType as string,
                };
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    jwt: {
        maxAge: 14 * 24 * 60 * 60,
    },
};

const getSession = () => getServerSession(authOptions);

export { authOptions, getSession };
