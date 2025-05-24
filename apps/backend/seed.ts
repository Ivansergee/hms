import { prisma } from "./prisma/prisma";
import { Gender } from "@shared/generated/enums";

async function main() {
    await prisma.guest.createMany({
        data: [
            {
                firstName: 'Ivan',
                lastName: 'Petrov',
                parentName: 'Ivanovich',
                gender: Gender.MALE,
                birthdate: new Date('1995-11-11'),
                phone: '+79217737198',
                email: 'test@test.ru'
            },
            {
                firstName: 'Anna',
                lastName: 'Ivanova',
                parentName: 'Petrovna',
                gender: Gender.FEMALE,
                birthdate: new Date('2000-11-11'),
                phone: '+79217737198',
                email: 'test@test.ru'
            },
            {
                firstName: 'John',
                lastName: 'Doe',
                gender: Gender.MALE,
                birthdate: new Date('2001-11-11'),
                phone: '+12317737198',
                email: 'test@test.ru'
            },
        ],
    });

    await prisma.category.createMany({
        data: [
            {
                name: 'Standard double',
                tag: 'DBL',
                capacity: 2,
            },
            {
                name: 'Single',
                tag: 'SNGL',
                capacity: 1,
            },
            {
                name: 'Family',
                tag: 'FML',
                capacity: 4,
            }
        ],
    })

    await prisma.room.createMany({
        data: [
            {
                name: '101',
                categoryId: 1,
            },
            {
                name: '102',
                categoryId: 1,
            },
            {
                name: '103',
                categoryId: 2,
            },
            {
                name: '104',
                categoryId: 2,
            },
            {
                name: '201',
                categoryId: 1,
            },
            {
                name: '202',
                categoryId: 1,
            },
            {
                name: '203',
                categoryId: 3,
            },
            {
                name: '204',
                categoryId: 3,
            }
        ],
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
