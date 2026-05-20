import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@edutrack.com'
    const password = 'password123'
    const name = 'System Admin'

    console.log(`Checking for existing admin: ${email}...`)

    try {
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            console.log('Admin already exists.')
            return
        }

        const passwordHash = await bcrypt.hash(password, 12)
        const admin = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: 'ADMIN' as any, // Cast as many because of schema enum
            },
        })

        console.log('Admin account created successfully!')
        console.log(`Email: ${admin.email}`)
        console.log(`Password: ${password}`)
    } catch (err) {
        console.error('Error creating admin:', err)
    } finally {
        await prisma.$disconnect()
    }
}

main()
