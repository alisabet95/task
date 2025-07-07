import { NextAuthOptions, User, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/prisma/clientali";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

// Extend JWT to include custom properties
declare module "next-auth/jwt" {
  interface JWT {
    id?: number;
    username?: string | null;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }
}

// Extend Session to type the user property
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string | null;
      email: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

interface ExtendedUser extends User {
  id: string;
  username: string | null;
  email: string | null;
  name?: string | null;
  image?: string | null;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "ایمیل", type: "email" },
        password: { label: "رمز عبور", type: "password" },
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("لطفاً ایمیل و رمز عبور را وارد کنید");
        }
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              username: true,
              email: true,
              password: true,
              name: true,
              image: true,
              emailVerified: true,
              provider: true,
            },
          });

          if (!user) {
            throw new Error("ایمیل وجود ندارد");
          }

          if (!user.password) {
            throw new Error("این حساب با گوگل ثبت شده است");
          }

          if (user.provider === "credentials" && !user.emailVerified) {
            throw new Error("لطفاً ابتدا ایمیل خود را تأیید کنید");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("رمز عبور نادرست است");
          }

          return {
            id: user.id.toString(),
            username: user.username,
            email: user.email ?? credentials.email,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          console.error("Authentication error:", error);
          throw new Error("خطای سرور رخ داده است. لطفاً بعداً تلاش کنید");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        console.log(user, account);

        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user = {
          id: token.id?.toString() ?? "",
          username: token.username ?? "unknown",
          email: token.email ?? null,
          name: token.name ?? undefined,
          image: token.image ?? null,
        };
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User | AdapterUser }) {
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.id = Number(user.id);
        token.name = user.name;
        token.email = user.email;
        token.username = extendedUser.username || "unknown";
        token.image = extendedUser.image || null;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
    error: "/login?error=OAuthCallback",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
