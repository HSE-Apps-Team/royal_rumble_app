import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

const isDevMode = process.env.DEV_MODE === "true";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: isDevMode
    ? []
    : [
        MicrosoftEntraID({
          clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
          clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
          issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_TENANT_ID}/v2.0`,
          authorization: {
            params: { prompt: "login" },
          },
        }),
      ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 60,
    updateAge: 0,
  },

  callbacks: {
    async signIn({ user }) {
      console.log("OAuth user:", user.email);

      if (!user.email) {
        console.log("No email from provider");
        return false;
      }

      const { getUserByEmail } = await import("@/actions/other");
      const dbUser = await getUserByEmail(user.email);

      console.log("DB user:", dbUser);

      if (!dbUser) {
        console.log("User not found in DB");
        user.job = "UNREGISTERED";
        return true;
      }

      user.id = String(dbUser.id);
      user.job = (dbUser.job ?? "").trim().toUpperCase();

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        if (typeof user.id === "string") {
          token.userId = user.id;
        }

        if (typeof user.job === "string") {
          token.job = user.job;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (typeof token.userId === "string") {
          session.user.id = token.userId;
        }

        if (typeof token.job === "string") {
          session.user.job = token.job;
        }
      }

      return session;
    },
  },
});