import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'super-secret-key-change-me'
);

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value;

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
        } catch (e) {
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
        } catch (e) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/donor/:path*', '/requestor/:path*'],
};
