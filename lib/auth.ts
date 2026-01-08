import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'super-secret-key-change-me'
);

const ALG = 'HS256';

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(plain: string, hashed: string) {
    return await bcrypt.compare(plain, hashed);
}

export async function createSession(userId: string, role: string) {
    const token = await new SignJWT({ userId, role })
        .setProtectedHeader({ alg: ALG })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(SECRET_KEY);

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
    });
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload as { userId: string; role: string };
    } catch (error) {
        return null;
    }
}
