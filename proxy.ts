import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'super-secret-key-change-me'
);

export async function proxy(request: NextRequest) {
    const session = request.cookies.get('session')?.value;

    // Protect Admin Routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL('/auth/login?role=admin', request.url));
        }
        try {
            const { payload } = await jwtVerify(session, SECRET_KEY);
            if (payload.role !== 'admin') {
                if (payload.role === 'donor') return NextResponse.redirect(new URL('/donor', request.url));
                if (payload.role === 'requestor') return NextResponse.redirect(new URL('/requestor', request.url));
                return NextResponse.redirect(new URL('/auth/login?role=admin', request.url));
            }
        } catch {
            return NextResponse.redirect(new URL('/auth/login?role=admin', request.url));
        }
    }

    // Protect Donor Routes
    if (request.nextUrl.pathname.startsWith('/donor')) {
        if (!session) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
        try {
            const { payload } = await jwtVerify(session, SECRET_KEY);
            if (payload.role !== 'donor') {
                // Redirect requestors trying to access donor pages
                return NextResponse.redirect(new URL('/requestor', request.url));
            }
        } catch {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    // Protect Requestor Routes
    if (request.nextUrl.pathname.startsWith('/requestor')) {
        if (!session) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
        try {
            const { payload } = await jwtVerify(session, SECRET_KEY);
            if (payload.role !== 'requestor') {
                // Redirect donors trying to access requestor pages
                return NextResponse.redirect(new URL('/donor', request.url));
            }
        } catch {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/donor/:path*', '/requestor/:path*'],
};

