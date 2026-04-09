import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { 
  handlers: { GET, POST }, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        console.log('[AUTH] authorize() called');
        try {
          console.log('[AUTH] credentials:', !!credentials?.email, !!credentials?.password);
          if (!credentials?.email || !credentials?.password) {
            console.error('[AUTH] FAIL: Missing email or password in credentials');
            return null;
          }

          // Normalize email
          const normalizedEmail = (credentials.email as string).trim().toLowerCase();
          console.log('[AUTH] Normalized email:', normalizedEmail);

          // Initialize Supabase client
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
          const supabase = createClient(supabaseUrl!, supabaseKey!);

          console.log('[AUTH] Querying Supabase for user...');
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', normalizedEmail)
            .single();

          console.log('[AUTH] User found:', !!user);

          if (!user || userError) {
            console.error(`[AUTH] FAIL: User not found or error with email: ${normalizedEmail}`, userError);
            return null;
          }

          if (!user.password) {
            console.error(`[AUTH] FAIL: User found but password field is missing for email: ${normalizedEmail}`);
            return null;
          }

          console.log('[AUTH] Comparing passwords...');
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );
          console.log('[AUTH] Password valid:', isValid);

          if (!isValid) {
            console.error(`[AUTH] FAIL: Password mismatch for email: ${normalizedEmail}`);
            return null;
          }

          console.log(`[AUTH] SUCCESS: User authenticated: ${normalizedEmail}`);

          return {
            id: user.id.toString(),
            email: user.email,
          };

        } catch (error) {
          console.error('[AUTH] FAIL: Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
});
