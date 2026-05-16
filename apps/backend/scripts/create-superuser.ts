import { prisma } from '../prisma/prisma';
import { adminPermissions } from '@/auth/permissions';

function askRequired(question: string): string {
    while (true) {
        const answer = prompt(question)?.trim();

        if (answer) {
            return answer;
        }

        console.log('This field is required.');
    }
}

function askPassword(): string {
    while (true) {
        const password = askRequired('Password: ');

        if (password) {
            return password;
        }

        console.log('This field is required.');
    }
}

function askYesNo(question: string): boolean {
    while (true) {
        const answer = prompt(question)?.trim().toLowerCase();

        if (answer === 'y') {
            return true;
        }

        if (answer === 'n') {
            return false;
        }

        console.log('Please enter y or n.');
    }
}

async function main(): Promise<void> {
    const username = askRequired('Username: ');
    const name = askRequired('Name: ');
    const password = askPassword();
    const mustChangePassword = askYesNo('Must change password on next login? (y/n): ');

    const passwordHash = await Bun.password.hash(password, { algorithm: 'bcrypt' });

    const user = await prisma.$transaction(async tx => {
        const administratorRole = await tx.role.upsert({
            where: { name: 'Administrator' },
            create: {
                name: 'Administrator',
                isSystem: true,
                permissions: {
                    create: adminPermissions.map(permissionKey => ({ permissionKey })),
                },
            },
            update: {
                isSystem: true,
                permissions: {
                    deleteMany: {},
                    create: adminPermissions.map(permissionKey => ({ permissionKey })),
                },
            },
        });

        const superuser = await tx.user.upsert({
            where: { username },
            create: {
                username,
                name,
                passwordHash,
                mustChangePassword,
                isActive: true,
                roles: {
                    create: {
                        roleId: administratorRole.id,
                    },
                },
            },
            update: {
                name,
                passwordHash,
                mustChangePassword,
                isActive: true,
                roles: {
                    deleteMany: {},
                    create: {
                        roleId: administratorRole.id,
                    },
                },
            },
            select: {
                id: true,
                username: true,
                name: true,
                mustChangePassword: true,
            },
        });

        await tx.session.deleteMany({ where: { userId: superuser.id } });

        return superuser;
    });

    console.log(`Superuser "${user.username}" is ready.`);
}

main()
    .catch(error => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
