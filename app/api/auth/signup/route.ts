import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword, createSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, role } = body;

        if (!email || !password || !name || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Check existing user
        const existing = await db.select().from(users).where(eq(users.email, email)).get();
        if (existing) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);
        const userId = uuidv4();

        await db.insert(users).values({
            id: userId,
            name,
            email,
            password: hashedPassword,
            role,
        });

        await createSession(userId, role);

        return NextResponse.json({ success: true, user: { id: userId, name, email, role } });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
