import 'dotenv/config';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './db.js';
import bcrypt  from 'bcryptjs';
import crypto from 'crypto';

passport.use(new GoogleStrategy(
    {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            const fullName = profile.displayName;

            // Try to find the user by email
            let user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                // New Google user - create an account
                // They'll never use a password, so we hash a random string just to satisfy the schema
                const randomPassword = await bcrypt.hash(crypto.randomUUID(), 12);
                user = await prisma.user.create({
                    data: { fullName, email, password: randomPassword, },
                    select: { id: true, fullName: true, email: true, role: true },
                });
            }

            return done(null, user); // Passes user info to the next step (generating JWT and setting cookie)
        } catch (err) {
            return done(err);
        }
    }
));

export default passport;