import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog/dialog';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Card } from '@/components/ui/card/card';

// Interface para os hinos
interface Hymn {
    number: number;
    title: string;
    url: string;
}

const HymnSelector = ({
    value,
    onChange
}: {
    value: string;
    onChange: (hymn: Hymn) => void;
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Lista de hinos processada
    const hymns = useMemo(() => {
        // Processa os URLs para extrair os títulos e números
        return [
            { number: 1, title: "A Alva Rompe", url: "https://www.churchofjesuschrist.org/media/music/songs/the-morning-breaks?crumbs=hymns&lang=por" },
            { number: 2, title: "Tal Como um Facho", url: "https://www.churchofjesuschrist.org/media/music/songs/the-spirit-of-god?crumbs=hymns&lang=por" },
            { number: 3, title: "Alegres Cantemos", url: "https://www.churchofjesuschrist.org/media/music/songs/now-let-us-rejoice?crumbs=hymns&lang=por" },
            { number: 4, title: "No Monte a Bandeira", url: "https://www.churchofjesuschrist.org/media/music/songs/high-on-the-mountain-top?crumbs=hymns&lang=por" },
            { number: 5, title: "Israel, Jesus Te Chama", url: "https://www.churchofjesuschrist.org/media/music/songs/israel-israel-god-is-calling?crumbs=hymns&lang=por" },
            { number: 6, title: "Um Anjo Lá do Céu", url: "https://www.churchofjesuschrist.org/media/music/songs/an-angel-from-on-high?crumbs=hymns&lang=por" },
            { number: 7, title: "O Que Vimos Lá nos Céus", url: "https://www.churchofjesuschrist.org/media/music/songs/what-was-witnessed-in-the-heavens?crumbs=hymns&lang=por" },
            { number: 8, title: "Oração pelo Profeta", url: "https://www.churchofjesuschrist.org/media/music/songs/we-ever-pray-for-thee?crumbs=hymns&lang=por" },
            { number: 9, title: "Graças Damos, Ó Deus, Por um Profeta", url: "https://www.churchofjesuschrist.org/media/music/songs/we-thank-thee-o-god-for-a-prophet?crumbs=hymns&lang=por" },
            { number: 10, title: "Vinde ao Profeta Escutar", url: "https://www.churchofjesuschrist.org/media/music/songs/come-listen-to-a-prophets-voice?crumbs=hymns&lang=por" },
            { number: 11, title: "Abençoa Nosso Profeta", url: "https://www.churchofjesuschrist.org/media/music/songs/god-bless-our-prophet-dear?crumbs=hymns&lang=por" },
            { number: 12, title: "Que Manhã Maravilhosa!", url: "https://www.churchofjesuschrist.org/media/music/songs/joseph-smiths-first-prayer?crumbs=hymns&lang=por" },
            { number: 13, title: "Rejubilai-vos, Ó Nações", url: "https://www.churchofjesuschrist.org/media/music/songs/let-earths-inhabitants-rejoice?crumbs=hymns&lang=por" },
            { number: 14, title: "Hoje, ao Profeta Louvemos", url: "https://www.churchofjesuschrist.org/media/music/songs/praise-to-the-man?crumbs=hymns&lang=por" },
            { number: 15, title: "Um Pobre e Aflito Viajor", url: "https://www.churchofjesuschrist.org/media/music/songs/a-poor-wayfaring-man-of-grief?crumbs=hymns&lang=por" },
            { number: 16, title: "Ó Montanhas Mil", url: "https://www.churchofjesuschrist.org/media/music/songs/o-ye-mountains-high?crumbs=hymns&lang=por" },
            { number: 17, title: "Por Teus Dons", url: "https://www.churchofjesuschrist.org/media/music/songs/for-the-strength-of-the-hills?crumbs=hymns&lang=por" },
            { number: 18, title: "Vede, Ó Santos", url: "https://www.churchofjesuschrist.org/media/music/songs/saints-behold-how-great-jehovah?crumbs=hymns&lang=por" },
            { number: 19, title: "Sereno Finda o Dia", url: "https://www.churchofjesuschrist.org/media/music/songs/the-wintry-day-descending-to-its-close?crumbs=hymns&lang=por" },
            { number: 20, title: "Vinde, Ó Santos", url: "https://www.churchofjesuschrist.org/media/music/songs/come-come-ye-saints?crumbs=hymns&lang=por" },
            { number: 21, title: "Ao Salvador Louvemos", url: "https://www.churchofjesuschrist.org/media/music/songs/come-all-ye-saints-of-zion?crumbs=hymns&lang=por" },
            { number: 22, title: "Em Glória Resplandesce", url: "https://www.churchofjesuschrist.org/media/music/songs/arise-o-glorious-zion?crumbs=hymns&lang=por" },
            { number: 23, title: "Lá nos Cumes", url: "https://www.churchofjesuschrist.org/media/music/songs/zion-stands-with-hills-surrounded?crumbs=hymns&lang=por" },
            { number: 24, title: "Vem, Ó Dia Prometido", url: "https://www.churchofjesuschrist.org/media/music/songs/come-thou-glorious-day-of-promise?crumbs=hymns&lang=por" },
            { number: 25, title: "Bela Sião", url: "https://www.churchofjesuschrist.org/media/music/songs/beautiful-zion-built-above?crumbs=hymns&lang=por" },
            { number: 26, title: "O Mundo Desperta", url: "https://www.churchofjesuschrist.org/media/music/songs/the-day-dawn-is-breaking?crumbs=hymns&lang=por" },
            { number: 27, title: "Vinde, Ó Filhos do Senhor", url: "https://www.churchofjesuschrist.org/media/music/songs/come-ye-children-of-the-lord?crumbs=hymns&lang=por" },
            { number: 28, title: "Ó Vem, Supremo Rei", url: "https://www.churchofjesuschrist.org/media/music/songs/come-o-thou-king-of-kings?crumbs=hymns&lang=por" },
            { number: 29, title: "Ó Criaturas do Senhor", url: "https://www.churchofjesuschrist.org/media/music/songs/all-creatures-of-our-god-and-king?crumbs=hymns&lang=por" },
            { number: 30, title: "Ó Santos, Que na Terra Habitais", url: "https://www.churchofjesuschrist.org/media/music/songs/come-all-ye-saints-who-dwell-on-earth?crumbs=hymns&lang=por" },
            { number: 31, title: "Com Braço Forte", url: "https://www.churchofjesuschrist.org/media/music/songs/god-of-our-fathers-whose-almighty-hand?crumbs=hymns&lang=por" },
            { number: 32, title: "Castelo Forte", url: "https://www.churchofjesuschrist.org/media/music/songs/a-mighty-fortress-is-our-god?crumbs=hymns&lang=por" },
            { number: 33, title: "Glória a Deus Cantai", url: "https://www.churchofjesuschrist.org/media/music/songs/glory-to-god-on-high?crumbs=hymns&lang=por" },
            { number: 34, title: "Louvai a Deus", url: "https://www.churchofjesuschrist.org/media/music/songs/praise-to-the-lord-the-almighty?crumbs=hymns&lang=por" },
            { number: 35, title: "A Deus, Senhor e Rei", url: "https://www.churchofjesuschrist.org/media/music/songs/rejoice-the-lord-is-king?crumbs=hymns&lang=por" },
            { number: 36, title: "Deus É Amor", url: "https://www.churchofjesuschrist.org/media/music/songs/god-is-love?crumbs=hymns&lang=por" },
            { number: 37, title: "O Senhor Meu Pastor É", url: "https://www.churchofjesuschrist.org/media/music/songs/the-lord-is-my-shepherd?crumbs=hymns&lang=por" },
            { number: 38, title: "Que Toda Honra e Glória", url: "https://www.churchofjesuschrist.org/media/music/songs/all-glory-laud-and-honor?crumbs=hymns&lang=por" },
            { number: 39, title: "Corações, Pois, Exultai", url: "https://www.churchofjesuschrist.org/media/music/songs/praise-the-lord-with-heart-and-voice?crumbs=hymns&lang=por" },
            { number: 40, title: "Jeová, Sê Nosso Guia", url: "https://www.churchofjesuschrist.org/media/music/songs/guide-us-o-thou-great-jehovah?crumbs=hymns&lang=por" },
            { number: 41, title: "Firmes Segui", url: "https://www.churchofjesuschrist.org/media/music/songs/press-forward-saints?crumbs=hymns&lang=por" },
            { number: 42, title: "Que Firme Alicerce", url: "https://www.churchofjesuschrist.org/media/music/songs/how-firm-a-foundation?crumbs=hymns&lang=por" },
            { number: 43, title: "Grandioso És Tu", url: "https://www.churchofjesuschrist.org/media/music/songs/how-great-thou-art?crumbs=hymns&lang=por" },
            { number: 44, title: "Jesus, Minha Luz", url: "https://www.churchofjesuschrist.org/media/music/songs/the-lord-is-my-light?crumbs=hymns&lang=por" },
            { number: 45, title: "Ó Vós Que Amais ao Senhor", url: "https://www.churchofjesuschrist.org/media/music/songs/come-we-that-love-the-lord?crumbs=hymns&lang=por" },
            { number: 46, title: "Nossas Vozes Elevemos", url: "https://www.churchofjesuschrist.org/media/music/songs/god-speed-the-right?crumbs=hymns&lang=por" },
            { number: 47, title: "Deus nos Rege com Amor", url: "https://www.churchofjesuschrist.org/media/music/songs/how-gentle-gods-commands?crumbs=hymns&lang=por" },
            { number: 48, title: "Ó Pai Bendito", url: "https://www.churchofjesuschrist.org/media/music/songs/god-of-our-fathers-we-come-unto-thee?crumbs=hymns&lang=por" },
            { number: 49, title: "Pela Beleza do Mundo", url: "https://www.churchofjesuschrist.org/media/music/songs/for-the-beauty-of-the-earth?crumbs=hymns&lang=por" },
            { number: 50, title: "Cantando Louvamos", url: "https://www.churchofjesuschrist.org/media/music/songs/redeemer-of-israel?crumbs=hymns&lang=por" },
            { number: 51, title: "Oração de Graças", url: "https://www.churchofjesuschrist.org/media/music/songs/prayer-of-thanksgiving?crumbs=hymns&lang=por" },
            { number: 52, title: "Vinde, Ó Povos, Graças Dar", url: "https://www.churchofjesuschrist.org/media/music/songs/come-ye-thankful-people?crumbs=hymns&lang=por" },
            { number: 53, title: "Se Tenho Fé", url: "https://www.churchofjesuschrist.org/media/music/songs/when-faith-endures?crumbs=hymns&lang=por" },
            { number: 54, title: "Doce É o Trabalho", url: "https://www.churchofjesuschrist.org/media/music/songs/sweet-is-the-work?crumbs=hymns&lang=por" },
            { number: 55, title: "Santo! Santo! Santo!", url: "https://www.churchofjesuschrist.org/media/music/songs/holy-holy-holy-sanctus?crumbs=hymns&lang=por" },
            { number: 56, title: "Os Céus Proclamam", url: "https://www.churchofjesuschrist.org/media/music/songs/the-heavens-resound?crumbs=hymns&lang=por" },
            { number: 57, title: "Conta as Bênçãos", url: "https://www.churchofjesuschrist.org/media/music/songs/count-your-blessings?crumbs=hymns&lang=por" },
            { number: 58, title: "Ao Deus de Abraão Louvai", url: "https://www.churchofjesuschrist.org/media/music/songs/the-god-of-abraham-praise?crumbs=hymns&lang=por" },
            { number: 59, title: "Louvai o Eterno Criador", url: "https://www.churchofjesuschrist.org/media/music/songs/praise-god-from-whom-all-blessings-flow?crumbs=hymns&lang=por" },
            { number: 60, title: "Brilha, Meiga Luz", url: "https://www.churchofjesuschrist.org/media/music/songs/lead-kindly-light?crumbs=hymns&lang=por" },
            { number: 61, title: "Careço de Jesus", url: "https://www.churchofjesuschrist.org/media/music/songs/i-need-thee-every-hour?crumbs=hymns&lang=por" },
            { number: 62, title: "Mais Perto Quero Estar", url: "https://www.churchofjesuschrist.org/media/music/songs/nearer-my-god-to-thee?crumbs=hymns&lang=por" },
            { number: 63, title: "Guia-me a Ti", url: "https://www.churchofjesuschrist.org/media/music/songs/guide-me-to-thee?crumbs=hymns&lang=por" },
            { number: 64, title: "Ó Pai Celeste", url: "https://www.churchofjesuschrist.org/media/music/songs/father-in-heaven?crumbs=hymns&lang=por" },
            { number: 65, title: "Jesus Cristo É Meu Senhor", url: "https://www.churchofjesuschrist.org/media/music/songs/jesus-lover-of-my-soul?crumbs=hymns&lang=por" },
            { number: 66, title: "Creio em Cristo", url: "https://www.churchofjesuschrist.org/media/music/songs/i-believe-in-christ?crumbs=hymns&lang=por" },
            { number: 67, title: "Vive o Redentor", url: "https://www.churchofjesuschrist.org/media/music/songs/my-redeemer-lives?crumbs=hymns&lang=por" },
            { number: 68, title: "Vinde a Mim", url: "https://www.churchofjesuschrist.org/media/music/songs/come-follow-me?crumbs=hymns&lang=por" },
            { number: 69, title: "Vinde a Cristo", url: "https://www.churchofjesuschrist.org/media/music/songs/come-unto-jesus?crumbs=hymns&lang=por" },
            { number: 70, title: "Eu Sei Que Vive Meu Senhor", url: "https://www.churchofjesuschrist.org/media/music/songs/i-know-that-my-redeemer-lives?crumbs=hymns&lang=por" },
            { number: 71, title: "Testemunho", url: "https://www.churchofjesuschrist.org/media/music/songs/testimony?crumbs=hymns&lang=por" },
            { number: 72, title: "Mestre, o Mar Se Revolta", url: "https://www.churchofjesuschrist.org/media/music/songs/master-the-tempest-is-raging?crumbs=hymns&lang=por" },
            { number: 73, title: "Onde Encontrar a Paz?", url: "https://www.churchofjesuschrist.org/media/music/songs/where-can-i-turn-for-peace?crumbs=hymns&lang=por" },
            { number: 74, title: "Sê Humilde", url: "https://www.churchofjesuschrist.org/media/music/songs/be-thou-humble?crumbs=hymns&lang=por" },
            { number: 75, title: "Mais Vontade Dá-me", url: "https://www.churchofjesuschrist.org/media/music/songs/more-holiness-give-me?crumbs=hymns&lang=por" },
            { number: 76, title: "Rocha Eterna", url: "https://www.churchofjesuschrist.org/media/music/songs/rock-of-ages?crumbs=hymns&lang=por" },
            { number: 77, title: "A Luz de Deus", url: "https://www.churchofjesuschrist.org/media/music/songs/the-light-divine?crumbs=hymns&lang=por" },
            { number: 78, title: "Embora Cheios de Pesar", url: "https://www.churchofjesuschrist.org/media/music/songs/though-deepening-trials?crumbs=hymns&lang=por" },
            { number: 79, title: "Ó Doce, Grata Oração", url: "https://www.churchofjesuschrist.org/media/music/songs/sweet-hour-of-prayer?crumbs=hymns&lang=por" },
            { number: 80, title: "Santo Espírito de Deus", url: "https://www.churchofjesuschrist.org/media/music/songs/let-the-holy-spirit-guide?crumbs=hymns&lang=por" },
            { number: 81, title: "Secreta Oração", url: "https://www.churchofjesuschrist.org/media/music/songs/secret-prayer?crumbs=hymns&lang=por" },
            { number: 82, title: "Eis-nos Agora Aqui", url: "https://www.churchofjesuschrist.org/media/music/songs/prayer-is-the-souls-sincere-desire?crumbs=hymns&lang=por" },
            { number: 83, title: "Com Fervor Fizeste a Prece?", url: "https://www.churchofjesuschrist.org/media/music/songs/did-you-think-to-pray?crumbs=hymns&lang=por" },
            { number: 84, title: "Só por em Ti, Jesus, Pensar", url: "https://www.churchofjesuschrist.org/media/music/songs/jesus-the-very-thought-of-thee?crumbs=hymns&lang=por" },
            { number: 85, title: "Deus Vos Guarde", url: "https://www.churchofjesuschrist.org/media/music/songs/god-be-with-you-till-we-meet-again?crumbs=hymns&lang=por" },
            { number: 86, title: "Nós Pedimos-te, Senhor", url: "https://www.churchofjesuschrist.org/media/music/songs/lord-we-ask-thee-ere-we-part?crumbs=hymns&lang=por" },
            { number: 87, title: "Ó Bondoso Pai Eterno", url: "https://www.churchofjesuschrist.org/media/music/songs/o-thou-kind-and-gracious-father?crumbs=hymns&lang=por" },
            { number: 88, title: "Dá-nos, Tu, ó Pai Bondoso", url: "https://www.churchofjesuschrist.org/media/music/songs/lord-dismiss-us-with-thy-blessing?crumbs=hymns&lang=por" },
            { number: 89, title: "Ao Partir Cantemos", url: "https://www.churchofjesuschrist.org/media/music/songs/sing-we-now-at-parting?crumbs=hymns&lang=por" },
            { number: 90, title: "Teu Santo Espírito, Senhor", url: "https://www.churchofjesuschrist.org/media/music/songs/thy-spirit-lord-has-stirred-our-souls?crumbs=hymns&lang=por" },
            { number: 91, title: "Qual Orvalho Que Cintila", url: "https://www.churchofjesuschrist.org/media/music/songs/as-the-dew-from-heaven-distilling?crumbs=hymns&lang=por" },
            { number: 92, title: "Vai Fugindo o Dia", url: "https://www.churchofjesuschrist.org/media/music/songs/now-the-day-is-over?crumbs=hymns&lang=por" },
            { number: 93, title: "Suavemente a Noite Cai", url: "https://www.churchofjesuschrist.org/media/music/songs/softly-now-the-light-of-day?crumbs=hymns&lang=por" },
            { number: 94, title: "Oração para a Noite", url: "https://www.churchofjesuschrist.org/media/music/songs/prayer-for-the-night?crumbs=hymns&lang=por" },
            { number: 95, title: "Eis-nos, Hoje, a Teus Pés", url: "https://www.churchofjesuschrist.org/media/music/songs/lord-we-come-before-thee-now?crumbs=hymns&lang=por" },
            { number: 96, title: "É Tarde, a Noite Logo Vem", url: "https://www.churchofjesuschrist.org/media/music/songs/abide-with-me-tis-eventide?crumbs=hymns&lang=por" },
            { number: 97, title: "Comigo Habita", url: "https://www.churchofjesuschrist.org/media/music/songs/abide-with-me?crumbs=hymns&lang=por" },
            { number: 98, title: "Ó Deus, Senhor Eterno", url: "https://www.churchofjesuschrist.org/media/music/songs/o-god-the-eternal-father?crumbs=hymns&lang=por" },
            { number: 99, title: "Ao Partilhar de Teu Amor", url: "https://www.churchofjesuschrist.org/media/music/songs/we-have-partaken-of-thy-love?crumbs=hymns&lang=por" },
            { number: 100, title: "Entoai a Deus Louvor", url: "https://www.churchofjesuschrist.org/media/music/songs/gently-raise-the-sacred-strain?crumbs=hymns&lang=por" },
            { number: 101, title: "Deus, Escuta-nos Orar", url: "https://www.churchofjesuschrist.org/media/music/songs/god-our-father-hear-us-pray?crumbs=hymns&lang=por" },
            { number: 102, title: "Nossa Humilde Prece Atende", url: "https://www.churchofjesuschrist.org/media/music/songs/in-humility-our-savior?crumbs=hymns&lang=por" },
            { number: 103, title: "Enquanto unidos em Amor", url: "https://www.churchofjesuschrist.org/media/music/songs/while-of-these-emblems-we-partake-aeolian?crumbs=hymns&lang=por" },
            { number: 104, title: "Quão Grato É Cantar Louvor", url: "https://www.churchofjesuschrist.org/media/music/songs/tis-sweet-to-sing-the-matchless-love-hancock?crumbs=hymns&lang=por" },
            { number: 105, title: "Cantemos Todos a Jesus", url: "https://www.churchofjesuschrist.org/media/music/songs/well-sing-all-hail-to-jesus-name?crumbs=hymns&lang=por" },
            { number: 106, title: "Jesus de Nazaré, Mestre e Rei", url: "https://www.churchofjesuschrist.org/media/music/songs/jesus-of-nazareth-savior-and-king?crumbs=hymns&lang=por" },
            { number: 107, title: "Deus Tal Amor por Nós Mostrou", url: "https://www.churchofjesuschrist.org/media/music/songs/god-loved-us-so-he-sent-his-son?crumbs=hymns&lang=por" },
            { number: 108, title: "Eis-nos à Mesa do Senhor", url: "https://www.churchofjesuschrist.org/media/music/songs/again-our-dear-redeeming-lord?crumbs=hymns&lang=por" },
            { number: 109, title: "Em uma Cruz Jesus Morreu", url: "https://www.churchofjesuschrist.org/media/music/songs/upon-the-cross-of-calvary?crumbs=hymns&lang=por" },
            { number: 110, title: "Vede, Morreu o Redentor", url: "https://www.churchofjesuschrist.org/media/music/songs/behold-the-great-redeemer-die?crumbs=hymns&lang=por" },
            { number: 111, title: "Lembrando a Morte de Jesus", url: "https://www.churchofjesuschrist.org/media/music/songs/in-memory-of-the-crucified?crumbs=hymns&lang=por" },
            { number: 112, title: "Assombro me Causa", url: "https://www.churchofjesuschrist.org/media/music/songs/i-stand-all-amazed?crumbs=hymns&lang=por" },
            { number: 113, title: "No Monte do Calvário", url: "https://www.churchofjesuschrist.org/media/music/songs/there-is-a-green-hill-far-away?crumbs=hymns&lang=por" },
            { number: 114, title: "Da Corte Celestial", url: "https://www.churchofjesuschrist.org/media/music/songs/how-great-the-wisdom-and-the-love?crumbs=hymns&lang=por" },
            { number: 115, title: "Tão Humilde ao Nascer", url: "https://www.churchofjesuschrist.org/media/music/songs/jesus-once-of-humble-birth?crumbs=hymns&lang=por" },
            { number: 116, title: "Sobre o Calvário", url: "https://www.churchofjesuschrist.org/media/music/songs/there-is-a-green-hill-far-away-old-english-melody?crumbs=hymns&lang=por" },
            { number: 117, title: "Com Irmãos Nós Reunidos", url: "https://www.churchofjesuschrist.org/media/music/songs/with-our-brothers-here-united?crumbs=hymns&lang=por" },
            { number: 118, title: "Manhã da Ressurreição", url: "https://www.churchofjesuschrist.org/media/music/songs/easter-morning?crumbs=hymns&lang=por" },
            { number: 119, title: "Cristo É Já Ressuscitado", url: "https://www.churchofjesuschrist.org/media/music/songs/he-is-risen?crumbs=hymns&lang=por" },
            { number: 120, title: "Cristo Já Ressuscitou", url: "https://www.churchofjesuschrist.org/media/music/songs/christ-the-lord-is-risen-today?crumbs=hymns&lang=por" },
            { number: 121, title: "Mundo Feliz, Nasceu Jesus", url: "https://www.churchofjesuschrist.org/media/music/songs/joy-to-the-world?crumbs=hymns&lang=por" },
            { number: 122, title: "Erguei-vos Cantando", url: "https://www.churchofjesuschrist.org/media/music/songs/oh-come-all-ye-faithful?crumbs=hymns&lang=por" },
            { number: 123, title: "Lá na Judéia, Onde Cristo Nasceu", url: "https://www.churchofjesuschrist.org/media/music/songs/far-far-away-on-judeas-plains?crumbs=hymns&lang=por" },
            { number: 124, title: "Anjos Descem a Cantar", url: "https://www.churchofjesuschrist.org/media/music/songs/angels-we-have-heard-on-high?crumbs=hymns&lang=por" },
            { number: 125, title: "Ouvi os Sinos do Natal", url: "https://www.churchofjesuschrist.org/media/music/songs/i-heard-the-bells-on-christmas-day?crumbs=hymns&lang=por" },
            { number: 126, title: "Noite Feliz", url: "https://www.churchofjesuschrist.org/media/music/songs/silent-night?crumbs=hymns&lang=por" },
            { number: 127, title: "Jesus num Presépio", url: "https://www.churchofjesuschrist.org/media/music/songs/away-in-a-manger?crumbs=hymns&lang=por" },
            { number: 128, title: "Na Bela Noite Se Ouviu", url: "https://www.churchofjesuschrist.org/media/music/songs/it-came-upon-the-midnight-clear?crumbs=hymns&lang=por" },
            { number: 129, title: "Pequena Vila de Belém", url: "https://www.churchofjesuschrist.org/media/music/songs/o-little-town-of-bethlehem?crumbs=hymns&lang=por" },
            { number: 130, title: "No Céu Desponta Nova Luz", url: "https://www.churchofjesuschrist.org/media/music/songs/break-forth-o-beauteous-heavenly-light?crumbs=hymns&lang=por" },
            { number: 131, title: "No Dia de Natal", url: "https://www.churchofjesuschrist.org/media/music/songs/with-wondering-awe?crumbs=hymns&lang=por" },
            { number: 132, title: "Eis dos Anjos a Harmonia", url: "https://www.churchofjesuschrist.org/media/music/songs/hark-the-herald-angels-sing?crumbs=hymns&lang=por" },
            { number: 133, title: "Quando o Anjo Proclamou", url: "https://www.churchofjesuschrist.org/media/music/songs/the-first-noel?crumbs=hymns&lang=por" },
            { number: 134, title: "Sim, Eu Te Seguirei", url: "https://www.churchofjesuschrist.org/media/music/songs/lord-i-would-follow-thee?crumbs=hymns&lang=por" },
            { number: 135, title: "Eu Devo Partilhar", url: "https://www.churchofjesuschrist.org/media/music/songs/because-i-have-been-given-much?crumbs=hymns&lang=por" },
            { number: 136, title: "Neste mundo", url: "https://www.churchofjesuschrist.org/media/music/songs/have-i-done-any-good?crumbs=hymns&lang=por" },
            { number: 137, title: "Oh! Falemos Palavras Amáveis", url: "https://www.churchofjesuschrist.org/media/music/songs/let-us-oft-speak-kind-words?crumbs=hymns&lang=por" },
            { number: 138, title: "Não Deixeis Palavras Duras", url: "https://www.churchofjesuschrist.org/media/music/songs/angry-words-oh-let-them-never?crumbs=hymns&lang=por" },
            { number: 139, title: "Deus É Consolador Sem Par", url: "https://www.churchofjesuschrist.org/media/music/songs/god-moves-in-a-mysterious-way?crumbs=hymns&lang=por" },
            { number: 140, title: "Ama o Pastor Seu Rebanho", url: "https://www.churchofjesuschrist.org/media/music/songs/dear-to-the-heart-of-the-shepherd?crumbs=hymns&lang=por" },
            { number: 141, title: "Trabalhemos Hoje", url: "https://www.churchofjesuschrist.org/media/music/songs/let-us-all-press-on?crumbs=hymns&lang=por" },
            { number: 142, title: "Nossa Lei É Trabalhar", url: "https://www.churchofjesuschrist.org/media/music/songs/put-your-shoulder-to-the-wheel?crumbs=hymns&lang=por" },
            { number: 143, title: "Pai, Inspira-me ao Ensinar", url: "https://www.churchofjesuschrist.org/media/music/songs/help-me-teach-with-inspiration?crumbs=hymns&lang=por" },
            { number: 144, title: "Mãos ao Trabalho", url: "https://www.churchofjesuschrist.org/media/music/songs/awake-for-the-night-is-coming?crumbs=hymns&lang=por" },
            { number: 145, title: "Sempre Que Alguém Nos Faz o Bem", url: "https://www.churchofjesuschrist.org/media/music/songs/each-life-that-touches-ours-for-good?crumbs=hymns&lang=por" },
            { number: 146, title: "Se a Vida É Penosa", url: "https://www.churchofjesuschrist.org/media/music/songs/if-the-way-be-full-of-trial?crumbs=hymns&lang=por" },
            { number: 147, title: "Faze o Bem", url: "https://www.churchofjesuschrist.org/media/music/songs/do-what-is-right?crumbs=hymns&lang=por" },
            { number: 148, title: "Faze o Bem, Escolhendo o Que É Certo", url: "https://www.churchofjesuschrist.org/media/music/songs/choose-the-right?crumbs=hymns&lang=por" },
            { number: 149, title: "A Alma É Livre", url: "https://www.churchofjesuschrist.org/media/music/songs/know-this-that-every-soul-is-free-stephens?crumbs=hymns&lang=por" },
            { number: 150, title: "Quem Segue ao Senhor?", url: "https://www.churchofjesuschrist.org/media/music/songs/whos-on-the-lords-side?crumbs=hymns&lang=por" },
            { number: 151, title: "Minha Alma Hoje Tem a luz", url: "https://www.churchofjesuschrist.org/media/music/songs/there-is-sunshine-in-my-soul-today?crumbs=hymns&lang=por" },
            { number: 152, title: "Prolongue os Bons Momentos", url: "https://www.churchofjesuschrist.org/media/music/songs/improve-the-shining-moments?crumbs=hymns&lang=por" },
            { number: 153, title: "Deixa a Luz do Sol Entrar", url: "https://www.churchofjesuschrist.org/media/music/songs/you-can-make-the-pathway-bright?crumbs=hymns&lang=por" },
            { number: 154, title: "Enquanto o Sol Brilha", url: "https://www.churchofjesuschrist.org/media/music/songs/today-while-the-sun-shines?crumbs=hymns&lang=por" },
            { number: 155, title: "Luz Espalhai", url: "https://www.churchofjesuschrist.org/media/music/songs/scatter-sunshine?crumbs=hymns&lang=por" },
            { number: 156, title: "Agora Não, mas Logo Mais", url: "https://www.churchofjesuschrist.org/media/music/songs/sometime-well-understand?crumbs=hymns&lang=por" },
            { number: 157, title: "Amor que Cristo Demonstrou", url: "https://www.churchofjesuschrist.org/media/music/songs/o-love-that-glorifies-the-son?crumbs=hymns&lang=por" },
            { number: 158, title: "Tu Jesus, Ó Rocha Eterna", url: "https://www.churchofjesuschrist.org/media/music/songs/o-thou-rock-of-our-salvation?crumbs=hymns&lang=por" },
            { number: 159, title: "À Glória Nós Iremos", url: "https://www.churchofjesuschrist.org/media/music/songs/we-are-marching-on-to-glory?crumbs=hymns&lang=por" },
            { number: 160, title: "Somos os Soldados", url: "https://www.churchofjesuschrist.org/media/music/songs/we-are-all-enlisted?crumbs=hymns&lang=por" },
            { number: 161, title: "As Hostes do Eterno", url: "https://www.churchofjesuschrist.org/media/music/songs/behold-a-royal-army?crumbs=hymns&lang=por" },
            { number: 162, title: "Com Valor Marchemos", url: "https://www.churchofjesuschrist.org/media/music/songs/onward-christian-soldiers?crumbs=hymns&lang=por" },
            { number: 163, title: "Ide por Todo o Mundo", url: "https://www.churchofjesuschrist.org/media/music/songs/go-ye-into-all-the-world?crumbs=hymns&lang=por" },
            { number: 164, title: "De Um a Outro Pólo", url: "https://www.churchofjesuschrist.org/media/music/songs/come-all-whose-souls-are-lighted?crumbs=hymns&lang=por" },
            { number: 165, title: "Semeando", url: "https://www.churchofjesuschrist.org/media/music/songs/we-are-sowing?crumbs=hymns&lang=por" },
            { number: 166, title: "Chamados a Servir", url: "https://www.churchofjesuschrist.org/media/music/songs/called-to-serve?crumbs=hymns&lang=por" },
            { number: 167, title: "Aonde Mandares Irei", url: "https://www.churchofjesuschrist.org/media/music/songs/ill-go-where-you-want-me-to-go?crumbs=hymns&lang=por" },
            { number: 168, title: "Povos da Terra, Vinde, Escutai!", url: "https://www.churchofjesuschrist.org/media/music/songs/hark-all-ye-nations?crumbs=hymns&lang=por" },
            { number: 169, title: "Eis os Teus Filhos, Ó Senhor", url: "https://www.churchofjesuschrist.org/media/music/songs/behold-thy-sons-and-daughters-lord?crumbs=hymns&lang=por" },
            { number: 170, title: "Avante, ao Mundo Proclamai", url: "https://www.churchofjesuschrist.org/media/music/songs/go-forth-with-faith?crumbs=hymns&lang=por" },
            { number: 171, title: "A Verdade o Que É?", url: "https://www.churchofjesuschrist.org/media/music/songs/oh-say-what-is-truth?crumbs=hymns&lang=por" },
            { number: 172, title: "A Verdade É Nosso Guia", url: "https://www.churchofjesuschrist.org/media/music/songs/truth-reflects-upon-our-senses?crumbs=hymns&lang=por" },
            { number: 173, title: "Ao Raiar o Novo Dia", url: "https://www.churchofjesuschrist.org/media/music/songs/come-away-to-the-sunday-school?crumbs=hymns&lang=por" },
            { number: 174, title: "Sê Bem-vindo, Dia Santo", url: "https://www.churchofjesuschrist.org/media/music/songs/welcome-welcome-sabbath-morning?crumbs=hymns&lang=por" },
            { number: 175, title: "Do Pó Nos Fala uma Voz", url: "https://www.churchofjesuschrist.org/media/music/songs/men-are-that-they-might-have-joy?crumbs=hymns&lang=por" },
            { number: 176, title: "Estudando as Escrituras", url: "https://www.churchofjesuschrist.org/media/music/songs/as-i-search-the-holy-scriptures?crumbs=hymns&lang=por" },
            { number: 177, title: "Ó Meu Pai", url: "https://www.churchofjesuschrist.org/media/music/songs/o-my-father?crumbs=hymns&lang=por" },
            { number: 178, title: "Ó Quão Majestosa É a Obra de Deus", url: "https://www.churchofjesuschrist.org/media/music/songs/how-wondrous-and-great?crumbs=hymns&lang=por" },
            { number: 179, title: "Ó Jeová, Senhor do Céu", url: "https://www.churchofjesuschrist.org/media/music/songs/jehovah-lord-of-heaven-and-earth?crumbs=hymns&lang=por" },
            { number: 180, title: "Já Refulge a Glória Eterna", url: "https://www.churchofjesuschrist.org/media/music/songs/battle-hymn-of-the-republic?crumbs=hymns&lang=por" },
            { number: 181, title: "O Fim Se Aproxima", url: "https://www.churchofjesuschrist.org/media/music/songs/the-time-is-far-spent?crumbs=hymns&lang=por" },
            { number: 182, title: "Juventude da Promessa", url: "https://www.churchofjesuschrist.org/media/music/songs/hope-of-israel?crumbs=hymns&lang=por" },
            { number: 183, title: "Deve Sião Fugir à Luta?", url: "https://www.churchofjesuschrist.org/media/music/songs/true-to-the-faith?crumbs=hymns&lang=por" },
            { number: 184, title: "Constantes Qual Firmes Montanhas", url: "https://www.churchofjesuschrist.org/media/music/songs/carry-on?crumbs=hymns&lang=por" },
            { number: 185, title: "Quão Belos São", url: "https://www.churchofjesuschrist.org/media/music/songs/how-beautiful-thy-temples-lord?crumbs=hymns&lang=por" },
            { number: 186, title: "Levantai-vos, Ide ao Templo", url: "https://www.churchofjesuschrist.org/media/music/songs/rise-ye-saints-and-temples-enter?crumbs=hymns&lang=por" },
            { number: 187, title: "Nós Dedicamos Esta Casa", url: "https://www.churchofjesuschrist.org/media/music/songs/this-house-we-dedicate-to-thee?crumbs=hymns&lang=por" },
            { number: 188, title: "Com Amor no Lar", url: "https://www.churchofjesuschrist.org/media/music/songs/love-at-home?crumbs=hymns&lang=por" },
            { number: 189, title: "Pode o Lar Ser Como o Céu", url: "https://www.churchofjesuschrist.org/media/music/songs/home-can-be-a-heaven-on-earth?crumbs=hymns&lang=por" },
            { number: 190, title: "Os Teus Filhos, Pai Celeste", url: "https://www.churchofjesuschrist.org/media/music/songs/children-of-our-heavenly-father?crumbs=hymns&lang=por" },
            { number: 191, title: "As Famílias Poderão Ser Eternas", url: "https://www.churchofjesuschrist.org/media/music/songs/families-can-be-together-forever?crumbs=hymns&lang=por" },
            { number: 192, title: "Ó Crianças, Deus Vos Ama", url: "https://www.churchofjesuschrist.org/media/music/songs/dearest-children-god-is-near-you?crumbs=hymns&lang=por" },
            { number: 193, title: "Sou um Filho de Deus", url: "https://www.churchofjesuschrist.org/media/music/songs/i-am-a-child-of-god?crumbs=hymns&lang=por" },
            { number: 194, title: "Guarda os Mandamentos", url: "https://www.churchofjesuschrist.org/media/music/songs/keep-the-commandments?crumbs=hymns&lang=por" },
            { number: 195, title: "Eu Sei que Deus Vive", url: "https://www.churchofjesuschrist.org/media/music/songs/i-know-my-father-lives?crumbs=hymns&lang=por" },
            { number: 196, title: "Nas Montanhas de Sião", url: "https://www.churchofjesuschrist.org/media/music/songs/in-our-lovely-deseret?crumbs=hymns&lang=por" },
            { number: 197, title: "Amai-vos Uns aos Outros", url: "https://www.churchofjesuschrist.org/media/music/songs/love-one-another?crumbs=hymns&lang=por" },
            { number: 198, title: "Quando Vejo o Sol Raiar", url: "https://www.churchofjesuschrist.org/media/music/songs/gods-daily-care?crumbs=hymns&lang=por" },
            { number: 199, title: "Faz-me Andar Só na Luz", url: "https://www.churchofjesuschrist.org/media/music/songs/teach-me-to-walk-in-the-light?crumbs=hymns&lang=por" },
            { number: 200, title: "Irmãs em Sião", url: "https://www.churchofjesuschrist.org/media/music/songs/as-sisters-in-zion?crumbs=hymns&lang=por" },
            { number: 201, title: "Ó Filhos do Senhor", url: "https://www.churchofjesuschrist.org/media/music/songs/come-all-ye-sons-of-god?crumbs=hymns&lang=por" },
            { number: 202, title: "Brilham Raios de Clemência", url: "https://www.churchofjesuschrist.org/media/music/songs/brightly-beams-our-fathers-mercy-mens-choir?crumbs=hymns&lang=por" },
            { number: 203, title: "Ó Élderes de Israel", url: "https://www.churchofjesuschrist.org/media/music/songs/ye-elders-of-israel?crumbs=hymns&lang=por" },
            { number: 204, title: "Ó Vós, Que Sois Chamados", url: "https://www.churchofjesuschrist.org/media/music/songs/ye-who-are-called-to-labor?crumbs=hymns&lang=por" },
        ];
    }, []);

    // Filtra os hinos baseado no termo de busca
    const filteredHymns = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();
        return hymns.filter(hymn =>
            hymn.title.toLowerCase().includes(searchLower) ||
            hymn.number.toString().includes(searchLower)
        );
    }, [hymns, searchTerm]);

    // Encontra o hino selecionado
    const selectedHymn = useMemo(() => {
        return hymns.find(hymn => hymn.url === value);
    }, [hymns, value]);

    return (
        <div className="w-full">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                    >
                        {selectedHymn
                            ? `${selectedHymn.number} - ${selectedHymn.title}`
                            : "Selecione um hino..."}
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Selecionar Hino</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Buscar por número ou título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                        <div className="overflow-y-auto max-h-[60vh] space-y-2">
                            {filteredHymns.map((hymn) => (
                                <Card
                                    key={hymn.number}
                                    className="p-3 cursor-pointer hover:bg-accent"
                                    onClick={() => {
                                        onChange(hymn);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex items-center">
                                        <span className="font-medium mr-2">{hymn.number}</span>
                                        <span>{hymn.title}</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HymnSelector;