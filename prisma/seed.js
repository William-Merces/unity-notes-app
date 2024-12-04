const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Verifica se a estaca já existe
        const existingStake = await prisma.stake.findFirst({
            where: { name: 'Estaca Vitória da Conquista' },
            include: { wards: true }
        });

        // Se a estaca já existe, verifica se precisamos adicionar classes
        if (existingStake) {
            console.log('Estaca already exists, checking classes...');
            
            // Para cada ala, verifica/cria as classes padrão
            for (const ward of existingStake.wards) {
                const existingClasses = await prisma.class.findMany({
                    where: { wardId: ward.id }
                });

                if (existingClasses.length === 0) {
                    await prisma.class.createMany({
                        data: [
                            {
                                name: `Quórum de Élderes - ${ward.name}`,
                                wardId: ward.id,
                                organization: 'elders'
                            },
                            {
                                name: `Sociedade de Socorro - ${ward.name}`,
                                wardId: ward.id,
                                organization: 'relief_society'
                            }
                        ]
                    });
                    console.log(`Created classes for ward: ${ward.name}`);
                }
            }
            return;
        }

        // Se a estaca não existe, cria tudo do zero
        const wardData = [
            'Ala Sumaré',
            'Ala Brasil',
            'Ala Aeroporto VdC',
            'Ala Brumado',
            'Ala Morada Real',
            'Ala Candeias',
            'Ramo Morada dos Pássaros',
            'Ala Poções',
            'Ala Itapetinga'
        ];

        const stake = await prisma.stake.create({
            data: {
                name: 'Estaca Vitória da Conquista',
                wards: {
                    create: wardData.map(wardName => ({
                        name: wardName,
                        classes: {
                            create: [
                                {
                                    name: `Quórum de Élderes - ${wardName}`,
                                    organization: 'elders'
                                },
                                {
                                    name: `Sociedade de Socorro - ${wardName}`,
                                    organization: 'relief_society'
                                }
                            ]
                        }
                    }))
                }
            },
            include: {
                wards: {
                    include: {
                        classes: true
                    }
                }
            }
        });

        console.log('Seed completed successfully:', stake);
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });