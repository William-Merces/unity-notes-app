// src/utils/discourse-utils.ts

export interface ProcessedSlide {
    content: string;
    resources: any[];
}

export function processDiscourseContent(html: string): ProcessedSlide[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove elementos indesejados
    const elementsToRemove = doc.querySelectorAll('nav, aside, footer, script, style');
    elementsToRemove.forEach(el => el.remove());

    // Pega o conteúdo principal
    const mainContent = doc.querySelector('main');
    if (!mainContent) return [];

    // Extrai título, autor e cargo
    const title = doc.querySelector('h1')?.textContent?.trim() || '';
    const author = doc.querySelector('.author-name')?.textContent?.trim() || '';
    const role = doc.querySelector('.author-role')?.textContent?.trim() || '';

    const slides: ProcessedSlide[] = [];

    // Adiciona slide de título se houver informações suficientes
    if (title || author) {
        slides.push({
            content: `${title}\n\n${author}${role ? `\n${role}` : ''}`,
            resources: []
        });
    }

    // Processa parágrafos
    const paragraphs = mainContent.querySelectorAll('p');
    
    paragraphs.forEach(p => {
        const text = p.textContent?.trim();
        if (!text || text.length < 20) return; // Ignora parágrafos muito curtos

        // Divide parágrafos muito longos (mais de 500 caracteres)
        if (text.length > 500) {
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
            let currentSlide = '';

            sentences.forEach(sentence => {
                if ((currentSlide + sentence).length > 500) {
                    if (currentSlide) {
                        slides.push({
                            content: currentSlide.trim(),
                            resources: []
                        });
                    }
                    currentSlide = sentence;
                } else {
                    currentSlide += sentence;
                }
            });

            if (currentSlide) {
                slides.push({
                    content: currentSlide.trim(),
                    resources: []
                });
            }
        } else {
            slides.push({
                content: text,
                resources: []
            });
        }
    });

    return slides;
}