// src/app/api/discourse/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const discourseUrl = url.searchParams.get('url');

    if (!discourseUrl) {
        return new Response(
            JSON.stringify({ error: 'URL não fornecida' }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        };

        const response = await fetch(discourseUrl, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();

        return new Response(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            }
        });
    } catch (error) {
        console.error('Erro ao buscar discurso:', error);
        return new Response(
            JSON.stringify({ error: 'Erro ao buscar discurso' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }
}