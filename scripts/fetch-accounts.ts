import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
    console.log('Fetching accounts from database...')
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        if (users.length === 0) {
            console.log('No user accounts found.')
        } else {
            console.log(`Found ${users.length} accounts:`)
            console.table(users.map((u: { name: string; email: string; role: string; isActive: boolean; createdAt: Date }) => ({
                Name: u.name,
                Email: u.email,
                Role: u.role,
                Status: u.isActive ? 'Active' : 'Inactive',
                Joined: u.createdAt.toISOString().split('T')[0]
            })))
        }
    } catch (error) {
        console.error('Error fetching users:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
