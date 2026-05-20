import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Nina as a Student
    const student = await prisma.user.upsert({
        where: { email: 'nina@gmail.com' },
        update: {},
        create: {
            email: 'nina@gmail.com',
            name: 'Nina Student',
            passwordHash: hashedPassword,
            role: 'STUDENT',
        },
    });
    console.log('Student created:', student.email);

    // 2. Create an Instructor
    const instructor = await prisma.user.upsert({
        where: { email: 'instructor@edutrack.com' },
        update: {},
        create: {
            email: 'instructor@edutrack.com',
            name: 'Dr. Smith',
            passwordHash: hashedPassword,
            role: 'INSTRUCTOR',
        },
    });
    console.log('Instructor created:', instructor.email);

    // 3. Create a Course
    const course = await prisma.course.upsert({
        where: { classCode: 'CS101' },
        update: {},
        create: {
            title: 'Introduction to Computer Science',
            description: 'A foundational course on CS principles.',
            classCode: 'CS101',
            instructorId: instructor.id,
        },
    });
    console.log('Course created:', course.title);

    // 4. Create an Enrollment
    const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
            userId: student.id,
            courseId: course.id,
        },
    });

    if (!existingEnrollment) {
        await prisma.enrollment.create({
            data: {
                userId: student.id,
                courseId: course.id,
            },
        });
        console.log('Student enrolled in course');
    } else {
        console.log('Student already enrolled');
    }

    // 5. Create an Assignment
    const assignment = await prisma.assignment.create({
        data: {
            title: 'First Coding Exercise',
            description: 'Write a Hello World program.',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            courseId: course.id,
        },
    });
    console.log('Assignment created:', assignment.title);

    // 6. Create an Announcement
    await prisma.announcement.create({
        data: {
            title: 'Welcome to CS101',
            body: 'Welcome everyone! We are excited to start this journey.',
            courseId: course.id,
        },
    });
    console.log('Announcement created');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
