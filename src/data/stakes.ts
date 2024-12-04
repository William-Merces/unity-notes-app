// data/stakes.ts

interface Ward {
    id: string;
    name: string;
}

interface Stake {
    id: string;
    name: string;
    wards: Ward[];
}

export const stakes: Stake[] = [
    {
        id: "vitoria-conquista",
        name: "Estaca Vitória da Conquista",
        wards: [
            { id: "sumare", name: "Ala Sumaré" },
            { id: "brasil", name: "Ala Brasil" },
            { id: "aeroporto", name: "Ala Aeroporto VdC" },
            { id: "brumado", name: "Ala Brumado" },
            { id: "morada-real", name: "Ala Morada Real" },
            { id: "candeias", name: "Ala Candeias" },
            { id: "morada-passaros", name: "Ramo Morada dos Pássaros" },
            { id: "pocoes", name: "Ala Poções" },
            { id: "itapetinga", name: "Ala Itapetinga" }
        ]
    }
];