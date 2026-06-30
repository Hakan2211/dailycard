import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  // Google OAuth + email/password (sign up + sign in). No email verification or
  // password reset yet — those need an email sender (e.g. Resend) and are a
  // follow-up.
  providers: [Google, Password],
});
