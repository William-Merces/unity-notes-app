// src/utils/hymn-utils.ts

interface Hymn {
    number: number;
    title: string;
    url: string;
}

export function extractHymnInfo(url: string): Hymn | null {
    // Exemplo de URL: https://www.churchofjesuschrist.org/media/music/songs/the-morning-breaks?crumbs=hymns&lang=por
    try {
        const titlePart = url.split('/songs/')[1].split('?')[0];
        const titleWords = titlePart.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        // Aqui você precisaria de um mapeamento dos títulos em inglês para português
        // Por enquanto, vamos usar o título em inglês
        return {
            number: 1, // Você precisará ter um mapeamento de números
            title: titleWords,
            url: url
        };
    } catch (e) {
        return null;
    }
}

// Você precisará criar um mapeamento completo dos hinos
export const hymnMapping: Record<string, { number: number; title: string }> = {
    'the-morning-breaks': { number: 1, title: 'Já Rompeu a Aurora' },
    'the-spirit-of-god': { number: 2, title: 'O Espírito de Deus' },
    // ... adicionar todos os mapeamentos
};