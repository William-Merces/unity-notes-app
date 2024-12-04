import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Permitir conexões WebSocket
    if (request.headers.get('upgrade') === 'websocket') {
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;
    const isAuthPage = request.nextUrl.pathname.startsWith('/auth/');
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/');

    // Permitir que rotas de API lidem com sua própria autenticação
    if (isApiRoute) {
        return NextResponse.next();
    }

    // Se não estiver autenticado e não estiver em uma página de auth
    if (!token && !isAuthPage) {
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Redireciona /profile/update para /minhas-classes
    if (request.nextUrl.pathname === '/profile/update') {
        const classesUrl = new URL('/minhas-classes', request.url);
        return NextResponse.redirect(classesUrl);
    }

    // Se estiver autenticado e tentar acessar páginas de auth
    if (token && isAuthPage) {
        const homeUrl = new URL('/lessons', request.url);
        return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};