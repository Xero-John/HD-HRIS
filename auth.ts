import NextAuth, {Session, User} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {JWT} from "next-auth/jwt";
import {PrismaAdapter} from "@auth/prisma-adapter";
import prisma from "@/prisma/prisma";
import {handleAuthorization} from "@/lib/utils/authUtils/authUtils";
import {LoginValidation} from "@/helper/zodValidation/LoginValidation";
import GoogleProvider from "next-auth/providers/google";
import {processJsonObject} from "@/lib/utils/parser/JsonObject";
import {UserPrivileges} from "@/types/JSON/user-privileges";
import {devices} from "@/defaults_configurations/devices";


export const {handlers, signIn, signOut, auth, unstable_update} = NextAuth({
    adapter: PrismaAdapter(prisma), providers: [Credentials({
        credentials: {
            username: {}, password: {},
        }, authorize: async (credentials) => {
            // Type assertion to ensure correct type
            if (!credentials.username || !credentials.password) {
                throw new Error('Fields cannot be empty');
            }

            // Validate credentials
            const {username, password} = await LoginValidation.parseAsync(credentials as {
                username: string; password: string
            });

            // Get user data
            return await handleAuthorization({username, password});
        },
    }), GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET, authorization: {
            params: {
                prompt: "consent", access_type: "offline", response_type: "code",
            },
        },
    })], callbacks: {
        async signIn({account, user}) {
            try {
                if (account?.provider === "google") {
                    const privilege = await prisma.user.findUnique({
                        where: {
                            id: user.id,
                        }, include: {
                            sys_privileges: true
                        }
                    })

                    const accessibility = processJsonObject<UserPrivileges>(privilege?.sys_privileges?.accessibility);
                    const role = !accessibility?.web_access;

                    if(role) {
                        console.log("Only admin can login")
                        return false;
                    }
                    // Check if user email exists in the employees table
                    const employeeEmail = await prisma.trans_employees.findFirst({
                        where: {
                            email: user.email || undefined,
                        },
                    });

                    if (!employeeEmail) {
                        new Error("Unauthorized login attempt.")
                        console.error("Unauthorized login attempt.");
                        return false; // User is not authorized
                    }

                    await devices();
                    return true;

                }

                await devices();

                return true; // Handle other providers
            } catch (error) {
                console.error("Login error:", error);
                return false; // Stop the login process on error
            }
        }, authorized({request: {nextUrl}, auth}) {
            const isLoggedIn = !!auth?.user;
            const {pathname} = nextUrl;
            if (pathname.startsWith('/api/auth/signin') && isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }
            return !!auth
        }, async jwt({token, user}) {
            if (user) {
                return {
                    ...token,
                    image: user.image,
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    privilege: user.privilege,
                    isDefaultAccount: user.isDefaultAccount
                } as JWT;
            }
            return token;
        }, async session({session, token}: { session: Session, token: JWT, user: User }) {

            session.user = token;
            return session;
        },
    }, pages: {
        signIn: "/", error: "/"
    }, secret: process.env.AUTH_SECRET, session: {
        strategy: "jwt"
    }
})


